import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  const pool = getPool();

  if (!pool) {
    return NextResponse.json({ error: true }, { status: 500 });
  }

  const [votes, aiBacklog] = await Promise.all([
    pool.query(`SELECT COALESCE(SUM(votes_up), 0)::int AS total FROM politicians`),
    pool.query(
      `SELECT COUNT(*)::int AS count
       FROM politicians
       WHERE ai_narrative IS NULL`
    ),
  ]);

  return NextResponse.json({
    totalVotes: votes.rows[0]?.total ?? 0,
    aiBacklog: aiBacklog.rows[0]?.count ?? 0,
  });
}

