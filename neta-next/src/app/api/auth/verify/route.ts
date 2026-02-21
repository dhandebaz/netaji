import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenRaw } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const header = request.headers.get('authorization');
  const token = header?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  const decoded = verifyTokenRaw(token);
  if (!decoded) {
    return NextResponse.json({ valid: false, error: 'Invalid or expired token' }, { status: 401 });
  }
  return NextResponse.json({
    valid: true,
    role: decoded.role,
    email: decoded.email,
  });
}

