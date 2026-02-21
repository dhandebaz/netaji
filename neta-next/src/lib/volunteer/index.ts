import { getPool } from '@/lib/db';

type GetVolunteersParams = {
  tenant: string | null;
};

type VolunteerRow = {
  id: number;
  tenant_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  state: string | null;
  rtis_filed: number | null;
  points: number | null;
  claims_resolved: number | null;
  rank: number | null;
};

type VolunteerPayload = {
  name: string;
  email?: string;
  phone?: string;
  state?: string;
  rank?: number;
};

type CreateVolunteerParams = {
  tenant: string | null;
  body: VolunteerPayload;
};

type UpdateVolunteerBody = {
  name?: string;
  email?: string;
  phone?: string;
  state?: string;
  rtisFiled?: number;
  points?: number;
  claimsResolved?: number;
  rank?: number;
};

type UpdateVolunteerParams = {
  tenant: string | null;
  id: string;
  body: UpdateVolunteerBody;
};

async function ensureVolunteersTable() {
  const pool = getPool();
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS volunteers (
    id SERIAL PRIMARY KEY,
    tenant_id TEXT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    state TEXT,
    rtis_filed INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    claims_resolved INTEGER DEFAULT 0,
    rank INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`);
}

export async function getVolunteers(params: GetVolunteersParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }

  await ensureVolunteersTable();

  const values: string[] = [];
  let where = '';
  if (params.tenant) {
    where = 'WHERE tenant_id = $1';
    values.push(params.tenant);
  }

  const rows = await pool.query<VolunteerRow>(
    `SELECT * FROM volunteers ${where} ORDER BY points DESC NULLS LAST`,
    values
  );
  return rows.rows;
}

export async function createVolunteer(params: CreateVolunteerParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }

  await ensureVolunteersTable();

  const b = params.body || ({} as VolunteerPayload);
  const r = await pool.query<VolunteerRow>(
    `INSERT INTO volunteers (tenant_id,name,email,phone,state,rtis_filed,points,claims_resolved,rank)
     VALUES ($1,$2,$3,$4,$5,0,0,0,$6) RETURNING *`,
    [params.tenant || null, b.name, b.email || null, b.phone || null, b.state || null, b.rank || null]
  );
  return r.rows[0];
}

export async function updateVolunteer(params: UpdateVolunteerParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }

  await ensureVolunteersTable();

  const fields: string[] = [];
  const values: (string | number | Date)[] = [];
  let idx = 1;
  const allowed: (keyof UpdateVolunteerBody)[] = [
    'name',
    'email',
    'phone',
    'state',
    'rtisFiled',
    'points',
    'claimsResolved',
    'rank',
  ];
  for (const k of allowed) {
    const value = params.body?.[k];
    if (value !== undefined) {
      const col = k.replace(/[A-Z]/g, (m: string) => '_' + m.toLowerCase());
      fields.push(`${col} = $${idx++}`);
      values.push(value as string | number);
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
  const q = `UPDATE volunteers SET ${fields.join(', ')} WHERE ${where} RETURNING *`;
  const r = await pool.query<VolunteerRow>(q, values);
  if (r.rows.length === 0) {
    return null;
  }
  return r.rows[0];
}
