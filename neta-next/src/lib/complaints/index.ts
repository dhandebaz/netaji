import { getPool } from '@/lib/db';

type GetComplaintsParams = {
  tenant: string | null;
  status: string | null;
  politicianId: string | null;
  limit?: number;
  offset?: number;
};

type ComplaintPayload = {
  politicianId?: number;
  userId?: string;
  userName?: string;
  category: string;
  description: string;
  location?: string;
  evidenceUrl?: string;
  proofOfWork?: string;
};

type CreateComplaintParams = {
  tenant: string | null;
  body: ComplaintPayload;
};

type UpdateComplaintBody = {
  category?: string;
  description?: string;
  location?: string;
  evidenceUrl?: string;
  status?: string;
  proofOfWork?: string;
};

type UpdateComplaintParams = {
  tenant: string | null;
  id: string;
  body: UpdateComplaintBody;
};

type UpvoteComplaintParams = {
  tenant: string | null;
  id: string;
};

async function ensureComplaintsTable() {
  const pool = getPool();
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    politician_id INTEGER,
    user_id TEXT,
    user_name TEXT,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    evidence_url TEXT,
    upvotes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    proof_of_work TEXT,
    filed_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    tenant_id TEXT
  )`);
}

export async function getComplaints(params: GetComplaintsParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }

  await ensureComplaintsTable();

  const limit = typeof params.limit === 'number' && !isNaN(params.limit) ? params.limit : 50;
  const offset = typeof params.offset === 'number' && !isNaN(params.offset) ? params.offset : 0;

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
  if (params.politicianId) {
    where.push(`politician_id = $${idx}`);
    values.push(Number(params.politicianId));
    idx++;
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const totalRow = await pool.query(
    `SELECT COUNT(*)::int AS c FROM complaints ${whereSql}`,
    values
  );

  values.push(limit);
  values.push(offset);

  const rows = await pool.query(
    `SELECT * FROM complaints ${whereSql} ORDER BY filed_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
    values
  );

  return {
    data: rows.rows,
    total: totalRow.rows[0]?.c || 0,
  };
}

export async function createComplaint(params: CreateComplaintParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }

  await ensureComplaintsTable();

  const b = params.body || ({} as ComplaintPayload);
  const q = `INSERT INTO complaints (politician_id,user_id,user_name,category,description,location,evidence_url,upvotes,status,proof_of_work,tenant_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,0,'pending',$8,$9) RETURNING *`;
  const qParams: (string | number | null)[] = [
    b.politicianId ?? null,
    b.userId ?? null,
    b.userName ?? null,
    b.category,
    b.description,
    b.location ?? null,
    b.evidenceUrl ?? null,
    b.proofOfWork ?? null,
    params.tenant ?? null,
  ];
  const r = await pool.query(q, qParams);
  return r.rows[0];
}

export async function updateComplaint(params: UpdateComplaintParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }

  await ensureComplaintsTable();

  const fields: string[] = [];
  const values: (string | number | Date)[] = [];
  let idx = 1;
  const allowed: (keyof UpdateComplaintBody)[] = [
    'category',
    'description',
    'location',
    'evidenceUrl',
    'status',
    'proofOfWork',
  ];
  for (const k of allowed) {
    const value = params.body?.[k];
    if (value !== undefined) {
      const col = k.replace(/[A-Z]/g, (m: string) => '_' + m.toLowerCase());
      fields.push(`${col} = $${idx++}`);
      values.push(value);
    }
  }
  values.push(new Date());
  fields.push(`updated_at = $${idx++}`);
  values.push(Number(params.id));
  let where = `id = $${idx++}`;
  if (params.tenant) {
    values.push(params.tenant);
    where += ` AND tenant_id = $${idx++}`;
  }
  const q = `UPDATE complaints SET ${fields.join(', ')} WHERE ${where} RETURNING *`;
  const r = await pool.query(q, values);
  if (r.rows.length === 0) {
    return null;
  }
  return r.rows[0];
}

export async function upvoteComplaint(params: UpvoteComplaintParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }

  await ensureComplaintsTable();

  const values: (string | number)[] = [Number(params.id)];
  let where = 'id = $1';
  if (params.tenant) {
    values.push(params.tenant);
    where += ' AND tenant_id = $2';
  }
  const r = await pool.query(
    `UPDATE complaints SET upvotes = COALESCE(upvotes,0)+1, updated_at = NOW() WHERE ${where} RETURNING *`,
    values
  );
  if (r.rows.length === 0) {
    return null;
  }
  return r.rows[0];
}
