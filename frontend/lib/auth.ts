// @ts-nocheck
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

// This would normally be in an environment variable
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';

/**
 * Hash a password
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Create a session
 */
export async function createSession(userId) {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  try {
    const session = await prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    // If we can't create a session in the database, still return a token
    return { token, expiresAt };
  }
}

/**
 * Get user from token
 */
export async function getUserFromToken(token) {
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded.userId;
    
    if (!userId) return null;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

/**
 * Check if user is authenticated and has admin role
 */
export async function isAdmin(req) {
  const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
  if (!token) return false;

  try {
    const user = await getUserFromToken(token);
    return user?.role === 'ADMIN';
  } catch (error) {
    return false;
  }
}

/**
 * Verify authentication from request
 */
export async function verifyAuth(request) {
  // Try to get token from cookies first, then from authorization header
  const cookieToken = request.cookies?.get?.('token')?.value;
  const headerAuth = request.headers?.get?.('authorization');
  const headerToken = headerAuth?.split(' ')[1];
  const token = cookieToken || headerToken;
  
  if (!token) {
    return { user: null, error: 'No token provided' };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded.userId;
    
    if (!userId) {
      return { user: null, error: 'Invalid token format' };
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { user: null, error: 'User not found' };
    }

    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, error: null };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { user: null, error: error.message };
  }
}
