// @ts-nocheck
import { jwtVerify } from 'jose';

export async function verifyTokenEdge(token) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-for-development');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}
