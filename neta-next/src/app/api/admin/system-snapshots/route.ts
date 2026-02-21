import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtAndRole } from '@/lib/auth';
import { getPool } from '@/lib/db';

type SnapshotRow = {
  id: number;
  hash: string;
  healthScore: number;
  riskLevel: string;
  created_at: Date;
};

export async function GET(request: NextRequest) {
  const auth = await verifyJwtAndRole(request, ['superadmin', 'developer']);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const pool = getPool();

  if (!pool) {
    return NextResponse.json({ data: [], error: 'database_unavailable' }, { status: 500 });
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS system_audit_snapshots (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL,
      report JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  const result = await pool.query<SnapshotRow>(
    `SELECT 
       id,
       report->>'hash' AS "hash",
       (report->>'healthScore')::int AS "healthScore",
       report->>'riskLevel' AS "riskLevel",
       created_at
     FROM system_audit_snapshots
     ORDER BY created_at DESC
     LIMIT 30`
  );

  const rows = result.rows.map((row) => ({
    id: row.id,
    hash: row.hash,
    healthScore: row.healthScore,
    riskLevel: row.riskLevel,
    createdAt: row.created_at.toISOString(),
  }));

  return NextResponse.json({ data: rows });
}
