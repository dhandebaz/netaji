import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: true }, { status: 500 });
  }

  const result = await pool.query(
    `SELECT state,
            SUM(votes_up)::int AS votes
     FROM politicians
     GROUP BY state
     LIMIT 50`
  );

  return NextResponse.json({
    states: result.rows,
  });
}

