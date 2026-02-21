import { getPool } from '@/lib/db';

type PoliticianRow = {
  id: number;
  name: string;
  slug: string | null;
  party: string | null;
  state: string | null;
  constituency: string | null;
  approval_rating: number | null;
  total_assets: number | null;
  criminal_cases: number | null;
  attendance: number | null;
  votes_up: number | null;
  votes_down: number | null;
};

type ComplaintRow = {
  id: number;
  politician_id: number | null;
  category: string;
  status: string;
  filed_at: Date | null;
};

export async function getOpenData(tenant: string | null) {
  const pool = getPool();
  const tenantId = tenant || null;
  let politicians: PoliticianRow[] = [];
  let complaints: ComplaintRow[] = [];

  if (pool) {
    try {
      const tenantParam = tenantId ? [tenantId] : [];
      const whereSql = tenantId ? 'WHERE tenant_id = $1 OR tenant_id IS NULL' : '';
      const polRes = await pool.query<PoliticianRow>(
        `SELECT id, name, slug, party, state, constituency, approval_rating, total_assets, criminal_cases, attendance, votes_up, votes_down FROM politicians ${whereSql}`,
        tenantParam
      );
      politicians = polRes.rows;
      const compRes = await pool.query<ComplaintRow>(
        `SELECT id, politician_id, category, status, filed_at FROM complaints ${whereSql}`,
        tenantParam
      );
      complaints = compRes.rows;
    } catch {
      politicians = [];
      complaints = [];
    }
  }

  const normalizedPoliticians = politicians.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug || (r.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
    party: r.party,
    state: r.state,
    constituency: r.constituency,
    approval_rating: r.approval_rating,
    total_assets: r.total_assets,
    criminal_cases: r.criminal_cases,
    attendance: r.attendance,
    votes: {
      up: r.votes_up || 0,
      down: r.votes_down || 0,
    },
  }));

  const normalizedComplaints = complaints.map((c) => ({
    id: c.id,
    politician_id: c.politician_id,
    category: c.category,
    status: c.status,
    filed_at: c.filed_at ? c.filed_at.toISOString() : null,
  }));

  return {
    source: 'neta-open-data',
    tenant: tenantId,
    politicians: normalizedPoliticians,
    complaints: normalizedComplaints,
    generated_at: new Date().toISOString(),
  };
}
