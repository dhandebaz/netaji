import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ ok: false, connected: false, message: 'no_database_configured' });
  }
  try {
    const r = await pool.query('SELECT 1 as ok');
    return NextResponse.json({ ok: true, connected: true, result: r.rows[0]?.ok === 1 });
  } catch {
    return NextResponse.json({ ok: false, connected: false, error: 'db_unreachable' }, { status: 500 });
  }
}

