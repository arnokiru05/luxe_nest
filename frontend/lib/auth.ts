// @ts-nocheck
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

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
    return { token, expiresAt };
  }
}

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
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

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

export async function verifyAuth(request) {
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

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, error: null };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { user: null, error: error.message };
  }
}
