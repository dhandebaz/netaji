import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: true }, { status: 500 });
  }

  await pool.query(
    `CREATE TABLE IF NOT EXISTS system_audit_snapshots (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL,
      report JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`
  );

  const row = await pool.query(
    `SELECT hash, created_at
     FROM system_audit_snapshots
     ORDER BY created_at DESC
     LIMIT 1`
  );

  return NextResponse.json({
    latest: row.rows[0] || null,
  });
}

