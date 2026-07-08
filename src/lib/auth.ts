import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'vit-g-hub-omni-dev-secret-2026';
const TOKEN_EXPIRY = '7d';
export const COOKIE_NAME = 'courtmate-session';


export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; role: string; name: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): { userId: string; role: string; name: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string; name: string; email: string };
  } catch {
    return null;
  }
}
