import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  let tenant = '';

  if (host) {
    const parts = host.split('.');
    if (parts.length > 2) {
      tenant = parts[0];
    }
  }

  const res = NextResponse.next();
  if (tenant) {
    res.headers.set('x-tenant', tenant);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

