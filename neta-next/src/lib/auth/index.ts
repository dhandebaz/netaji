import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

type JwtPayload = {
  id: string;
  role: string;
  email?: string;
  phone?: string;
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }
  return secret;
};

export const JWT_EXPIRY = '24h';

export function signToken(payload: JwtPayload) {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRY });
}

export function verifyTokenRaw(token: string): JwtPayload | null {
  try {
    const secret = getJwtSecret();
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    return null;
  }
}

export async function verifyJwtAndRole(request: NextRequest, roles: string[]) {
  const header = request.headers.get('authorization');
  const token = header?.replace('Bearer ', '');
  if (!token) {
    return { ok: false as const, status: 401, error: 'Authentication required' as const };
  }
  const decoded = verifyTokenRaw(token);
  if (!decoded) {
    return { ok: false as const, status: 401, error: 'Invalid or expired token' as const };
  }
  if (!roles.includes(decoded.role)) {
    return { ok: false as const, status: 403, error: 'Insufficient permissions' as const };
  }
  return { ok: true as const, status: 200, error: null as null, user: decoded };
}

