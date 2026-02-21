import { getPool } from '@/lib/db';
import { getRecentCronErrors } from '@/lib/cron';
import { isPineconeAvailable } from '@/lib/vector/search';
import { isAiAvailable } from '@/lib/ai';
import { hashAuditReport } from './hash';

export type IssueSeverity = 'low' | 'medium' | 'high';

export type Issue = {
  code: string;
  severity: IssueSeverity;
  message: string;
};

export type StateHealth = {
  state: string;
  healthScore: number;
};

export type AuditReport = {
  healthScore: number;
  riskLevel: IssueSeverity;
  issues: Issue[];
  stats: {
    pendingAI: number;
    voteAnomalies: number;
    staleProfiles: number;
    governanceStability?: number;
    projectedStability?: number;
    healthDrift?: number;
    stateHealth?: StateHealth[];
  };
  generatedAt: string;
};

function calculateScore(issues: Issue[]): number {
  let score = 100;
  for (const i of issues) {
    if (i.severity === 'high') score -= 30;
    if (i.severity === 'medium') score -= 15;
    if (i.severity === 'low') score -= 5;
  }
  return Math.max(score, 0);
}

import type { Pool } from 'pg';

async function detectVoteVelocity(pool: Pool): Promise<number> {
  const result = await pool.query(
    `SELECT id,
            name,
            votes_up,
            LAG(votes_up) OVER (ORDER BY updated_at) AS previous_votes
     FROM politicians
     WHERE updated_at > NOW() - INTERVAL '24 hours'
     LIMIT 200`
  );

  let spikes = 0;

  for (const row of result.rows) {
    if (row.previous_votes && row.votes_up - row.previous_votes > 1000) {
      spikes++;
    }
  }

  return spikes;
}

async function detectBehaviorDrift(pool: Pool): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM politicians
     WHERE approval_rating < 10
     AND votes_up > 2000`
  );

  return result.rows[0]?.count ?? 0;
}

async function detectCoordinatedActivity(pool: Pool): Promise<number> {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS vote_audit_trail (
      id SERIAL PRIMARY KEY,
      politician_id INT,
      previous_votes INT,
      new_votes INT,
      delta INT,
      created_at TIMESTAMP DEFAULT NOW()
    )`
  );

  const result = await pool.query(
    `SELECT politician_id,
            COUNT(*) AS vote_events
     FROM vote_audit_trail
     WHERE created_at > NOW() - INTERVAL '1 hour'
     GROUP BY politician_id
     HAVING COUNT(*) > 50
     LIMIT 20`
  );

  return result.rows.length;
}

type StateRow = {
  state: string;
  total: number;
  avg_approval: number;
  total_cases: number;
};

async function computeStateHealth(pool: Pool): Promise<StateHealth[]> {
  const result = await pool.query<StateRow>(
    `SELECT state,
            COUNT(*) AS total,
            AVG(approval_rating)::float AS avg_approval,
            SUM(criminal_cases)::int AS total_cases
     FROM politicians
     GROUP BY state
     LIMIT 50`
  );

  return result.rows.map((r) => {
    const health = 100 - r.total_cases * 2 - (100 - r.avg_approval);
    const clamped = Math.max(Math.min(health, 100), 0);

    return {
      state: r.state,
      healthScore: clamped,
    };
  });
}

export async function runSystemAudit(storeSnapshot = false): Promise<AuditReport> {
  const start = Date.now();
  const pool = getPool();

  if (!pool) {
    const fallback: AuditReport = {
      healthScore: 50,
      riskLevel: 'medium',
      issues: [
        {
          code: 'db_unavailable',
          severity: 'high',
          message: 'Database connection unavailable',
        },
      ],
      stats: {
        pendingAI: 0,
        voteAnomalies: 0,
        staleProfiles: 0,
      },
      generatedAt: new Date().toISOString(),
    };
    const duration = Date.now() - start;
    console.log(`System audit duration: ${duration}ms (db_unavailable)`);
    return fallback;
  }

  const issues: Issue[] = [];

  let pendingAI = 0;
  let staleProfiles = 0;
  let voteAnomalies = 0;
  let stateHealth: StateHealth[] = [];

  const [aiRes, staleRes] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS count
       FROM politicians
       WHERE ai_narrative IS NULL
       LIMIT 1`
    ),
    pool.query(
      `SELECT COUNT(*)::int AS count
       FROM politicians
       WHERE updated_at < NOW() - INTERVAL '90 days'
       LIMIT 1`
    ),
  ]);

  pendingAI = aiRes.rows[0]?.count ?? 0;
  staleProfiles = staleRes.rows[0]?.count ?? 0;

  if (pendingAI > 50) {
    issues.push({
      code: 'ai_backlog',
      severity: 'medium',
      message: `${pendingAI} politicians missing AI narrative`,
    });
  }

  if (staleProfiles > 100) {
    issues.push({
      code: 'stale_profiles',
      severity: 'medium',
      message: `${staleProfiles} profiles not updated in 90+ days`,
    });
  }

  const anomalyCheck = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM politicians
     WHERE votes_up > 5000`
  );
  voteAnomalies = anomalyCheck.rows[0]?.count ?? 0;

  if (voteAnomalies > 0) {
    issues.push({
      code: 'vote_spike',
      severity: 'high',
      message: `${voteAnomalies} abnormal vote spikes detected`,
    });
  }

  const velocitySpikes = await detectVoteVelocity(pool);

  if (velocitySpikes > 0) {
    issues.push({
      code: 'vote_velocity_spike',
      severity: 'high',
      message: `${velocitySpikes} rapid vote surges detected`,
    });
  }

  voteAnomalies += velocitySpikes;

  const driftCount = await detectBehaviorDrift(pool);

  if (driftCount > 0) {
    issues.push({
      code: 'behavioral_drift',
      severity: 'medium',
      message: `${driftCount} approval/vote mismatch anomalies`,
    });
  }

  const coordinated = await detectCoordinatedActivity(pool);

  if (coordinated > 0) {
    issues.push({
      code: 'coordinated_vote_activity',
      severity: 'high',
      message: `${coordinated} suspicious vote clusters detected`,
    });
  }

  stateHealth = await computeStateHealth(pool);

  const cronErrors = await getRecentCronErrors(10);

  if (cronErrors.length > 3) {
    issues.push({
      code: 'cron_failures',
      severity: 'high',
      message: 'Multiple cron failures detected',
    });
  }

  const pinecone = isPineconeAvailable();
  const gemini = isAiAvailable();

  if (!pinecone) {
    issues.push({
      code: 'vector_unavailable',
      severity: 'medium',
      message: 'Vector index unavailable',
    });
  }

  if (!gemini) {
    issues.push({
      code: 'ai_unavailable',
      severity: 'medium',
      message: 'AI provider unavailable',
    });
  }

  const healthScore = calculateScore(issues);

  let riskLevel: IssueSeverity = 'low';
  if (healthScore < 70) riskLevel = 'medium';
  if (healthScore < 40) riskLevel = 'high';

  const stabilityRaw = healthScore - voteAnomalies * 2;
  const governanceStability = Math.max(Math.min(stabilityRaw, 100), 0);

  const report: AuditReport = {
    healthScore,
    riskLevel,
    issues,
    stats: {
      pendingAI,
      voteAnomalies,
      staleProfiles,
      governanceStability,
      stateHealth,
      projectedStability: 0,
    },
    generatedAt: new Date().toISOString(),
  };

  let projected = report.healthScore;
  projected -= report.stats.voteAnomalies * 1.5;
  projected -= report.stats.pendingAI * 0.2;
  report.stats.projectedStability = Math.max(Math.min(projected, 100), 0);

  await pool.query(
    `CREATE TABLE IF NOT EXISTS system_alerts (
      id SERIAL PRIMARY KEY,
      code TEXT,
      severity TEXT,
      message TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`
  );

  const highSeverity = issues.filter((i) => i.severity === 'high');

  for (const issue of highSeverity) {
    await pool.query(
      `INSERT INTO system_alerts (code, severity, message)
       VALUES ($1, $2, $3)`,
      [issue.code, issue.severity, issue.message]
    );
  }

  await pool.query(
    `CREATE TABLE IF NOT EXISTS system_audit_snapshots (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL,
      report JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`
  );

  const yesterday = await pool.query<{ report: { healthScore: number } }>(
    `SELECT report
     FROM system_audit_snapshots
     ORDER BY created_at DESC
     OFFSET 1
     LIMIT 1`
  );

  if (yesterday.rows.length > 0) {
    const prev = yesterday.rows[0].report;
    report.stats.healthDrift = report.healthScore - prev.healthScore;
  }

  if (storeSnapshot) {
    const hash = hashAuditReport(report);

    await pool.query(
      `DELETE FROM system_audit_snapshots
       WHERE created_at < NOW() - INTERVAL '60 days'`
    );

    await pool.query(
      `INSERT INTO system_audit_snapshots (hash, report)
       VALUES ($1, $2)`,
      [hash, { ...report, hash }]
    );
  }

  const duration = Date.now() - start;
  console.log(`System audit duration: ${duration}ms`);

  return report;
}
