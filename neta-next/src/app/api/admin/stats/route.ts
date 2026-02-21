import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyJwtAndRole } from '@/lib/auth';

type CountRow = { c: number };

type ScraperStatusRow = {
  value: {
    tenants?: Record<
      string,
      {
        lastRunAt?: string;
        lastSource?: string;
        lastState?: string;
        lastCount?: number;
      }
    >;
  };
};

type DbStats = {
  politicians: number;
  complaints: number;
  pendingComplaints: number;
  volunteers: number;
  rtiTasks: number;
  votes: number;
  games: number | null;
} | null;

type ScraperMeta =
  | {
      lastRunAt?: string;
      lastSource?: string;
      lastState?: string;
      lastCount?: number;
    }
  | null;

export async function GET(request: NextRequest) {
  const auth = await verifyJwtAndRole(request, ['superadmin', 'developer']);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const pool = getPool();

  const trafficData: { name: string; users: number; votes: number }[] = [];
  const hours = [0, 4, 8, 12, 16, 20, 23];

  hours.forEach((h) => {
    const usersBase = h >= 8 && h <= 22 ? 2000 : 500;
    const users = usersBase + Math.floor(Math.random() * 1000);
    trafficData.push({
      name: `${String(h).padStart(2, '0')}:00`,
      users,
      votes: Math.floor(users * 0.15),
    });
  });

  let dbStats: DbStats = null;
  let scraperMeta: ScraperMeta = null;

  if (pool) {
    try {
      const tenantId = request.headers.get('x-tenant') || 'default';
      const tenantParam = [tenantId];
      const politiciansRes = await pool.query<CountRow>(
        'SELECT COUNT(*)::int AS c FROM politicians WHERE tenant_id = $1 OR tenant_id IS NULL',
        tenantParam
      );
      const complaintsRes = await pool.query<CountRow>(
        'SELECT COUNT(*)::int AS c FROM complaints WHERE tenant_id = $1 OR tenant_id IS NULL',
        tenantParam
      );
      const pendingComplaintsRes = await pool.query<CountRow>(
        "SELECT COUNT(*)::int AS c FROM complaints WHERE tenant_id = $1 AND status = 'pending'",
        tenantParam
      );
      const volunteersRes = await pool.query<CountRow>(
        'SELECT COUNT(*)::int AS c FROM volunteers WHERE tenant_id = $1 OR tenant_id IS NULL',
        tenantParam
      );
      const rtiTasksRes = await pool.query<CountRow>(
        'SELECT COUNT(*)::int AS c FROM rti_tasks WHERE tenant_id = $1 OR tenant_id IS NULL',
        tenantParam
      );
      const votesRes = await pool.query<CountRow>(
        'SELECT COUNT(*)::int AS c FROM votes WHERE tenant_id = $1 OR tenant_id IS NULL',
        tenantParam
      );

      let gamesCount: number | null = null;
      try {
        const gamesRes = await pool.query<CountRow>('SELECT COUNT(*)::int AS c FROM games');
        gamesCount = gamesRes.rows[0]?.c ?? null;
      } catch {
        gamesCount = null;
      }

      dbStats = {
        politicians: politiciansRes.rows[0]?.c ?? 0,
        complaints: complaintsRes.rows[0]?.c ?? 0,
        pendingComplaints: pendingComplaintsRes.rows[0]?.c ?? 0,
        volunteers: volunteersRes.rows[0]?.c ?? 0,
        rtiTasks: rtiTasksRes.rows[0]?.c ?? 0,
        votes: votesRes.rows[0]?.c ?? 0,
        games: gamesCount,
      };
      try {
        const metaRes = await pool.query<ScraperStatusRow>(
          "SELECT value FROM settings WHERE key = 'politician_scraper_status' LIMIT 1"
        );
        const tenants = metaRes.rows[0]?.value?.tenants || {};
        scraperMeta = (tenants && tenants[tenantId]) || null;
      } catch {
        scraperMeta = null;
      }
    } catch {
      dbStats = null;
    }
  }

  const response = {
    users: 14203 + Math.floor(Math.random() * 50),
    politicians: dbStats?.politicians ?? null,
    complaints: dbStats?.complaints ?? null,
    pendingComplaints: dbStats?.pendingComplaints ?? null,
    volunteers: dbStats?.volunteers ?? null,
    rtiTasks: dbStats?.rtiTasks ?? null,
    votes: dbStats?.votes ?? null,
    games: dbStats?.games ?? null,
    sseClients: 0,
    trafficData,
    build: {
      chunkSizeWarningLimit: 2500,
      manualChunks: ['vendor', 'charts', 'motion'],
      codeSplit: true,
    },
    db: {
      connected: !!dbStats,
      provider: process.env.DATABASE_URL ? 'supabase_postgres' : 'file',
      politicians: dbStats?.politicians ?? null,
      complaints: dbStats?.complaints ?? null,
      pendingComplaints: dbStats?.pendingComplaints ?? null,
      volunteers: dbStats?.volunteers ?? null,
      rtiTasks: dbStats?.rtiTasks ?? null,
      votes: dbStats?.votes ?? null,
      games: dbStats?.games ?? null,
      scraper: scraperMeta,
    },
  };

  return NextResponse.json(response);
}
