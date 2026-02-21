import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyJwtAndRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await verifyJwtAndRole(request, ['superadmin']);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const pool = getPool();
  return NextResponse.json({
    primary: {
      type: pool ? 'postgresql' : 'json-file',
      status: 'connected',
      path: pool ? 'PostgreSQL (Neon)' : 'data.json',
    },
    sseClients: 0,
  });
}

