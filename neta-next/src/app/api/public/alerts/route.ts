import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: true }, { status: 500 });
  }

  await pool.query(
    `CREATE TABLE IF NOT EXISTS system_alerts (
      id SERIAL PRIMARY KEY,
      code TEXT,
      severity TEXT,
      message TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`
  );

  const result = await pool.query(
    `SELECT code, severity, message, created_at
     FROM system_alerts
     ORDER BY created_at DESC
     LIMIT 20`
  );

  return NextResponse.json({
    alerts: result.rows,
  });
}

