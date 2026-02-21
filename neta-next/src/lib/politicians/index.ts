import { getPool } from '@/lib/db';

type GetPoliticiansParams = {
  tenant: string | null;
  state: string | null;
  party: string | null;
  search: string | null;
  sort: string | null;
  limit?: number;
  offset?: number;
  role: string | null;
  ids: string | null;
};

type PoliticianRow = {
  id: number;
  name: string;
  slug: string | null;
  party: string | null;
  party_logo: string | null;
  state: string | null;
  constituency: string | null;
  photo_url: string | null;
  myneta_id: string | null;
  election_slug: string | null;
  age: number | null;
  approval_rating: number | null;
  total_assets: number | null;
  criminal_cases: number | null;
  education: string | null;
  attendance: number | null;
  verified: boolean | null;
  status: string | null;
  role: string | null;
  votes_up: number | null;
  votes_down: number | null;
  source: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  ai_narrative?: string | null;
  ai_swot?: unknown | null;
  ai_last_refreshed_at?: Date | null;
};

const generateSlug = (name: string): string =>
  name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

async function ensurePoliticiansTable() {
  const pool = getPool();
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS politicians (
    id SERIAL PRIMARY KEY,
    tenant_id TEXT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    party TEXT,
    party_logo TEXT,
    state TEXT,
    constituency TEXT,
    photo_url TEXT,
    myneta_id TEXT,
    election_slug TEXT,
    age INTEGER,
    approval_rating REAL DEFAULT 50,
    total_assets REAL DEFAULT 0,
    criminal_cases INTEGER DEFAULT 0,
    education TEXT,
    attendance REAL DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    role TEXT DEFAULT 'elected',
    votes_up INTEGER DEFAULT 0,
    votes_down INTEGER DEFAULT 0,
    source TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`);
  await pool.query(`ALTER TABLE politicians ADD COLUMN IF NOT EXISTS ai_narrative TEXT`);
  await pool.query(`ALTER TABLE politicians ADD COLUMN IF NOT EXISTS ai_swot JSONB`);
  await pool.query(`ALTER TABLE politicians ADD COLUMN IF NOT EXISTS ai_last_refreshed_at TIMESTAMP`);
}

function mapRowToPublic(r: PoliticianRow) {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug || generateSlug(r.name),
    party: r.party,
    partyLogo: r.party_logo,
    state: r.state,
    constituency: r.constituency,
    photoUrl: r.photo_url,
    mynetaId: r.myneta_id,
    electionSlug: r.election_slug,
    age: r.age,
    approvalRating: r.approval_rating,
    totalAssets: r.total_assets,
    criminalCases: r.criminal_cases,
    education: r.education,
    attendance: r.attendance,
    verified: r.verified,
    status: r.status,
    role: r.role || 'elected',
    votes: { up: r.votes_up || 0, down: r.votes_down || 0 },
    source: r.source,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function getPoliticiansHandler(params: GetPoliticiansParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }

  await ensurePoliticiansTable();

  const state = params.state || undefined;
  const party = params.party || undefined;
  const search = params.search || undefined;
  const sort = params.sort || undefined;
  const role = params.role || undefined;
  const ids = params.ids || undefined;

  const limit = typeof params.limit === 'number' && !isNaN(params.limit) ? params.limit : 100;
  const offset = typeof params.offset === 'number' && !isNaN(params.offset) ? params.offset : 0;

  const values: (string | number)[] = [];
  const where: string[] = [];
  let idx = 1;

  if (params.tenant) {
    where.push(`(tenant_id = $${idx} OR tenant_id IS NULL)`);
    values.push(params.tenant);
    idx++;
  }

  if (state) {
    where.push(`state = $${idx}`);
    values.push(state);
    idx++;
  }

  if (party) {
    where.push(`party = $${idx}`);
    values.push(party);
    idx++;
  }

  if (role) {
    where.push(`role = $${idx}`);
    values.push(role);
    idx++;
  }

  if (search) {
    const s = String(search).toLowerCase();
    where.push(
      `(LOWER(name) LIKE $${idx} OR LOWER(party) LIKE $${idx} OR LOWER(constituency) LIKE $${idx})`
    );
    values.push(`%${s}%`);
    idx++;
  }

  if (ids) {
    const idList = String(ids)
      .split(',')
      .map((x) => Number(x.trim()))
      .filter((x) => !isNaN(x));
    if (idList.length) {
      const placeholders = idList.map(() => `$${idx++}`);
      where.push(`id IN (${placeholders.join(',')})`);
      values.push(...idList);
    }
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const totalRow = await pool.query<{ c: number }>(
    `SELECT COUNT(*)::int AS c FROM politicians ${whereSql}`,
    values
  );

  const paramsWithPaging = values.slice();
  paramsWithPaging.push(Number(limit));
  paramsWithPaging.push(Number(offset));

  let orderBy = 'ORDER BY id DESC';
  if (sort === 'approval') orderBy = 'ORDER BY approval_rating DESC NULLS LAST';
  else if (sort === 'votes')
    orderBy = 'ORDER BY (COALESCE(votes_up,0) - COALESCE(votes_down,0)) DESC';
  else if (sort === 'cases') orderBy = 'ORDER BY criminal_cases DESC NULLS LAST';
  else if (sort === 'assets') orderBy = 'ORDER BY total_assets DESC NULLS LAST';

  const rows = await pool.query<PoliticianRow>(
    `SELECT * FROM politicians ${whereSql} ${orderBy} LIMIT $${
      paramsWithPaging.length - 1
    } OFFSET $${paramsWithPaging.length}`,
    paramsWithPaging
  );

  const mapped = rows.rows.map((r) => mapRowToPublic(r));

  return {
    data: mapped,
    total: totalRow.rows[0]?.c || 0,
    limit: Number(limit),
    offset: Number(offset),
  };
}

export async function getPoliticianBySlugHandler(params: { tenant: string | null; slug: string }) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }
  await ensurePoliticiansTable();
  const values: (string | number)[] = [];
  const where: string[] = [];
  let idx = 1;

  where.push(`LOWER(slug) = LOWER($${idx})`);
  values.push(params.slug);
  idx++;

  if (params.tenant) {
    where.push(`(tenant_id = $${idx} OR tenant_id IS NULL)`);
    values.push(params.tenant);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const row = await pool.query<PoliticianRow>(
    `SELECT * FROM politicians ${whereSql} ORDER BY id DESC LIMIT 1`,
    values
  );
  if (!row.rows.length) {
    return null;
  }
  return mapRowToPublic(row.rows[0]);
}

type CreatePoliticianParams = {
  tenant: string | null;
  body: {
    name?: string;
    party?: string | null;
    partyLogo?: string | null;
    state?: string | null;
    constituency?: string | null;
    photoUrl?: string | null;
    mynetaId?: string | null;
    electionSlug?: string | null;
    age?: number | null;
    approvalRating?: number | null;
    totalAssets?: number | null;
    criminalCases?: number | null;
    education?: string | null;
    attendance?: number | null;
    verified?: boolean | null;
    status?: string | null;
    role?: string | null;
    source?: string | null;
  };
};

export async function createPoliticianHandler(params: CreatePoliticianParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }

  await ensurePoliticiansTable();

  const b = params.body || {};
  const name = b.name || 'unknown';
  const slug = generateSlug(name);

  const result = await pool.query<PoliticianRow>(
    `INSERT INTO politicians (tenant_id,name,slug,party,party_logo,state,constituency,photo_url,myneta_id,election_slug,age,approval_rating,total_assets,criminal_cases,education,attendance,verified,status,role,votes_up,votes_down,source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,0,0,$20)
     RETURNING *`,
    [
      params.tenant || null,
      name,
      slug,
      b.party || null,
      b.partyLogo || null,
      b.state || null,
      b.constituency || null,
      b.photoUrl || null,
      b.mynetaId || null,
      b.electionSlug || null,
      b.age || null,
      b.approvalRating ?? 50,
      b.totalAssets ?? 0,
      b.criminalCases ?? 0,
      b.education || null,
      b.attendance ?? 0,
      b.verified ?? false,
      b.status || 'active',
      b.role || 'elected',
      b.source || null,
    ]
  );

  const row = result.rows[0];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    party: row.party,
    partyLogo: row.party_logo,
    state: row.state,
    constituency: row.constituency,
    photoUrl: row.photo_url,
    mynetaId: row.myneta_id,
    electionSlug: row.election_slug,
    age: row.age,
    approvalRating: row.approval_rating,
    totalAssets: row.total_assets,
    criminalCases: row.criminal_cases,
    education: row.education,
    attendance: row.attendance,
    verified: row.verified,
    status: row.status,
    role: row.role,
    votes: { up: row.votes_up || 0, down: row.votes_down || 0 },
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type RealPolitician = {
  id?: number | string;
  name?: string;
  slug?: string;
  party?: string | null;
  partyLogo?: string | null;
  state?: string | null;
  constituency?: string | null;
  photoUrl?: string | null;
  mynetaId?: string | null;
  electionSlug?: string | null;
  age?: number | null;
  approvalRating?: number | null;
  totalAssets?: number | null;
  criminalCases?: number | null;
  education?: string | null;
  attendance?: number | null;
  verified?: boolean | null;
  status?: string | null;
  role?: string | null;
  votes?: { up?: number; down?: number };
  votesUp?: number;
  votesDown?: number;
  source?: string | null;
};

export async function upsertRealPoliticiansToDb(realPoliticians: RealPolitician[], tenantId = 'default') {
  const pool = getPool();
  if (!pool) return;
  await ensurePoliticiansTable();
  for (const p of realPoliticians) {
    try {
      const name = p.name || 'Unknown';
      const slug = p.slug || generateSlug(name);
      const mynetaId = p.mynetaId || String(p.id || '');
      const electionSlug = p.electionSlug || 'LokSabha2024';
      const existing = await pool.query(
        `SELECT id FROM politicians WHERE myneta_id = $1 AND election_slug = $2 LIMIT 1`,
        [mynetaId, electionSlug]
      );
      if (existing.rows.length) {
        const id = existing.rows[0].id;
        await pool.query(
          `UPDATE politicians
           SET name = $1,
               slug = $2,
               party = $3,
               party_logo = $4,
               state = $5,
               constituency = $6,
               photo_url = $7,
               age = $8,
               approval_rating = $9,
               total_assets = $10,
               criminal_cases = $11,
               education = $12,
               verified = $13,
               status = $14,
               source = $15,
               updated_at = NOW()
           WHERE id = $16`,
          [
            name,
            slug,
            p.party || null,
            p.partyLogo || null,
            p.state || null,
            p.constituency || null,
            p.photoUrl || null,
            p.age || null,
            p.approvalRating ?? 50,
            p.totalAssets ?? 0,
            p.criminalCases ?? 0,
            p.education || null,
            p.verified ?? true,
            p.status || 'active',
            p.source || 'MyNeta.info',
            id,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO politicians
             (tenant_id,name,slug,party,party_logo,state,constituency,photo_url,myneta_id,election_slug,age,approval_rating,total_assets,criminal_cases,education,attendance,verified,status,role,votes_up,votes_down,source,created_at,updated_at)
           VALUES
             ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,
          [
            tenantId,
            name,
            slug,
            p.party || null,
            p.partyLogo || null,
            p.state || null,
            p.constituency || null,
            p.photoUrl || null,
            mynetaId,
            electionSlug,
            p.age || null,
            p.approvalRating ?? 50,
            p.totalAssets ?? 0,
            p.criminalCases ?? 0,
            p.education || null,
            p.attendance ?? 0,
            p.verified ?? true,
            p.status || 'active',
            p.role || 'elected',
            p.votes?.up || p.votesUp || 0,
            p.votes?.down || p.votesDown || 0,
            p.source || 'MyNeta.info',
            new Date(),
            new Date(),
          ]
        );
      }
    } catch {
    }
  }
}
