import { getPool } from '@/lib/db';
import type { Pool } from 'pg';

type AddVoteParams = {
  tenant: string | null;
  politicianId: number;
  voteType: 'up' | 'down';
  voterId?: string | null;
  ipAddress?: string | null;
};

async function ensureVotesTable(pool: Pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    tenant_id TEXT,
    politician_id INTEGER REFERENCES politicians(id),
    voter_id TEXT,
    vote_type TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`);
}

async function ensureVoteAuditTrailTable(pool: Pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS vote_audit_trail (
    id SERIAL PRIMARY KEY,
    politician_id INT,
    previous_votes INT,
    new_votes INT,
    delta INT,
    created_at TIMESTAMP DEFAULT NOW()
  )`);
}

export async function addVote(params: AddVoteParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }

  await ensureVotesTable(pool as Pool);
  await ensureVoteAuditTrailTable(pool as Pool);

  const recent = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM vote_audit_trail
     WHERE politician_id = $1
     AND created_at > NOW() - INTERVAL '10 minutes'`,
    [params.politicianId]
  );

  if (recent.rows[0].count > 200) {
    return { error: 'rate_limit_exceeded' };
  }

  const tenantId = params.tenant || 'default';
  const voter = params.voterId || `anon_${Date.now()}`;

  const checkParams = [params.politicianId, voter, tenantId];
  const existing = await pool.query(
    'SELECT 1 FROM votes WHERE politician_id = $1 AND voter_id = $2 AND tenant_id = $3 LIMIT 1',
    checkParams
  );
  if (existing.rows.length > 0) {
    return { error: 'Already voted for this politician' };
  }

  const voteRes = await pool.query(
    `INSERT INTO votes (tenant_id,politician_id,voter_id,vote_type,ip_address)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [tenantId, params.politicianId, voter, params.voteType, params.ipAddress || null]
  );

  const polRes = await pool.query(
    'SELECT id,votes_up,votes_down FROM politicians WHERE id = $1 LIMIT 1',
    [params.politicianId]
  );
  const previousVotes = polRes.rows[0]?.votes_up || 0;
  let votesUp = previousVotes;
  let votesDown = polRes.rows[0]?.votes_down || 0;
  if (params.voteType === 'up') votesUp += 1;
  else votesDown += 1;
  const total = votesUp + votesDown;
  const approval = total > 0 ? Math.round((votesUp / total) * 100) : 50;
  await pool.query(
    'UPDATE politicians SET votes_up = $1, votes_down = $2, approval_rating = $3, updated_at = NOW() WHERE id = $4',
    [votesUp, votesDown, approval, params.politicianId]
  );

  const delta = votesUp - previousVotes;

  await pool.query(
    `INSERT INTO vote_audit_trail (politician_id, previous_votes, new_votes, delta)
     VALUES ($1, $2, $3, $4)`,
    [params.politicianId, previousVotes, votesUp, delta]
  );

  return {
    success: true,
    vote: voteRes.rows[0],
  };
}
