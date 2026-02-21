import { getPool } from '@/lib/db';

type GrievanceRow = {
  id: string;
  tenant_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string | null;
  created_at: Date | null;
};

type GrievancePayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

async function ensureGrievancesTable() {
  const pool = getPool();
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS grievances (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW()
  )`);
}

export async function createGrievance(tenant: string | null, body: GrievancePayload) {
  const pool = getPool();
  if (!pool) {
    throw new Error('support_channel_unavailable');
  }
  const { name, email, subject, message } = body || ({} as GrievancePayload);
  if (!name || !email || !subject || !message) {
    throw new Error('invalid_payload');
  }
  await ensureGrievancesTable();
  const id = Date.now().toString();
  const tenantId = tenant || 'default';
  await pool.query(
    `INSERT INTO grievances (id, tenant_id, name, email, subject, message, status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,'open',NOW())`,
    [id, tenantId, name, email, subject, message]
  );
  return {
    id,
    name,
    email,
    subject,
    message,
    status: 'open',
    date: new Date().toISOString(),
  };
}

export async function getGrievances(tenant: string | null) {
  const pool = getPool();
  if (!pool) {
    return { data: [], total: 0 };
  }
  await ensureGrievancesTable();
  const tenantId = tenant || 'default';
  const result = await pool.query<GrievanceRow>(
    `SELECT id, tenant_id, name, email, subject, message, status, created_at
     FROM grievances
     WHERE tenant_id = $1 OR tenant_id IS NULL
     ORDER BY created_at DESC`,
    [tenantId]
  );
  const items = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status || 'open',
    date: row.created_at ? row.created_at.toISOString() : new Date().toISOString(),
  }));
  return { data: items, total: items.length };
}

export async function resolveGrievance(id: string) {
  const pool = getPool();
  if (!pool) {
    throw new Error('support_channel_unavailable');
  }
  await ensureGrievancesTable();
  const result = await pool.query<GrievanceRow>(
    `UPDATE grievances
     SET status = 'resolved'
     WHERE id = $1
     RETURNING id, name, email, subject, message, status, created_at`,
    [id]
  );
  if (result.rows.length === 0) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status || 'resolved',
    date: row.created_at ? row.created_at.toISOString() : new Date().toISOString(),
  };
}
