import { getPool } from '@/lib/db';

type GetTasksParams = {
  tenant: string | null;
  status: string | null;
  priority: string | null;
};

type RTITaskRow = {
  id: number;
  tenant_id: string | null;
  politician_id: number | null;
  politician_name: string | null;
  topic: string;
  status: string;
  priority: string;
  generated_date: Date | null;
  claimed_by: string | null;
  filed_date: Date | null;
  response_date: Date | null;
  proof_of_filing_url: string | null;
  government_response_url: string | null;
  pio_details: unknown;
  created_at: Date | null;
  updated_at: Date | null;
};

type CreateTaskBody = {
  politicianId?: number;
  politicianName?: string;
  topic: string;
  pioDetails?: unknown;
};

type CreateTaskParams = {
  tenant: string | null;
  body: CreateTaskBody;
};

type UpdateTaskBody = {
  status?: string;
  priority?: string;
  claimedBy?: string;
  filedDate?: string;
  responseDate?: string;
  proofOfFilingUrl?: string;
  governmentResponseUrl?: string;
  pioDetails?: unknown;
};

type UpdateTaskParams = {
  tenant: string | null;
  id: string;
  body: UpdateTaskBody;
};

async function ensureRTITasksTable() {
  const pool = getPool();
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS rti_tasks (
    id SERIAL PRIMARY KEY,
    tenant_id TEXT,
    politician_id INTEGER,
    politician_name TEXT,
    topic TEXT NOT NULL,
    status TEXT DEFAULT 'generated',
    priority TEXT DEFAULT 'medium',
    generated_date TIMESTAMP DEFAULT NOW(),
    claimed_by TEXT,
    filed_date TIMESTAMP,
    response_date TIMESTAMP,
    proof_of_filing_url TEXT,
    government_response_url TEXT,
    pio_details JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`);
}

export async function getRTITasks(params: GetTasksParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }

  await ensureRTITasksTable();

  const values: (string | number)[] = [];
  const where: string[] = [];
  let idx = 1;

  if (params.tenant) {
    where.push(`tenant_id = $${idx}`);
    values.push(params.tenant);
    idx++;
  }
  if (params.status) {
    where.push(`status = $${idx}`);
    values.push(params.status);
    idx++;
  }
  if (params.priority) {
    where.push(`priority = $${idx}`);
    values.push(params.priority);
    idx++;
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const rows = await pool.query<RTITaskRow>(
    `SELECT * FROM rti_tasks ${whereSql} ORDER BY generated_date DESC`,
    values
  );
  return rows.rows;
}

export async function createRTITask(params: CreateTaskParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }

  await ensureRTITasksTable();

  const b = params.body || ({} as CreateTaskBody);
  const r = await pool.query<RTITaskRow>(
    `INSERT INTO rti_tasks (tenant_id,politician_id,politician_name,topic,status,priority,generated_date,claimed_by,proof_of_filing_url,government_response_url,pio_details)
     VALUES ($1,$2,$3,$4,'generated','medium',NOW(),NULL,NULL,NULL,$5) RETURNING *`,
    [
      params.tenant || null,
      b.politicianId ?? null,
      b.politicianName ?? null,
      b.topic,
      b.pioDetails ?? null,
    ]
  );
  return r.rows[0];
}

export async function updateRTITask(params: UpdateTaskParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }

  await ensureRTITasksTable();

  const fields: string[] = [];
  const values: (string | number | Date)[] = [];
  let idx = 1;
  const allowed: (keyof UpdateTaskBody)[] = [
    'status',
    'priority',
    'claimedBy',
    'filedDate',
    'responseDate',
    'proofOfFilingUrl',
    'governmentResponseUrl',
    'pioDetails',
  ];
  for (const k of allowed) {
    const value = params.body?.[k];
    if (value !== undefined) {
      const col = k.replace(/[A-Z]/g, (m: string) => '_' + m.toLowerCase());
      fields.push(`${col} = $${idx++}`);
      values.push(value as string);
    }
  }
  values.push(new Date());
  fields.push(`updated_at = $${idx++}`);
  values.push(Number(params.id));
  let where = `id = $${idx++}`;
  if (params.tenant) {
    values.push(params.tenant);
    where += ` AND (tenant_id = $${idx++} OR tenant_id IS NULL)`;
  }
  const q = `UPDATE rti_tasks SET ${fields.join(', ')} WHERE ${where} RETURNING *`;
  const r = await pool.query(q, values);
  if (r.rows.length === 0) {
    return null;
  }
  return r.rows[0];
}
