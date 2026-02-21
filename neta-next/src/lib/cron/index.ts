import { getPool } from '@/lib/db';

type CronStatus = 'ok' | 'error';

type CronLogRow = {
  id: number;
  job: string;
  status: string;
  error: string | null;
  meta: unknown | null;
  created_at: Date;
};

async function ensureCronLogsTable() {
  const pool = getPool();
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS cron_logs (
    id SERIAL PRIMARY KEY,
    job TEXT NOT NULL,
    status TEXT NOT NULL,
    error TEXT,
    meta JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )`);
}

export async function logCronRun(job: string, status: CronStatus, error?: string | null, meta?: unknown) {
  const pool = getPool();
  if (!pool) return;
  await ensureCronLogsTable();
  await pool.query(
    `INSERT INTO cron_logs (job, status, error, meta, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [job, status, error || null, meta ?? null]
  );
}

export async function getRecentCronErrors(limit = 10): Promise<CronLogRow[]> {
  const pool = getPool();
  if (!pool) return [];
  await ensureCronLogsTable();
  const rows = await pool.query<CronLogRow>(
    `SELECT id, job, status, error, meta, created_at
     FROM cron_logs
     WHERE status = 'error'
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows.rows;
}

export async function getLastCronRun(job: string): Promise<CronLogRow | null> {
  const pool = getPool();
  if (!pool) return null;
  await ensureCronLogsTable();
  const rows = await pool.query<CronLogRow>(
    `SELECT id, job, status, error, meta, created_at
     FROM cron_logs
     WHERE job = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [job]
  );
  return rows.rows[0] || null;
}

