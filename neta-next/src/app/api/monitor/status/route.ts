import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyJwtAndRole } from '@/lib/auth';
import { isPineconeAvailable } from '@/lib/vector/search';
import { isAiAvailable } from '@/lib/ai';
import { getScraperMeta, getAiMeta } from '@/lib/admin/settings';

type CountRow = {
  c: number;
};

export async function GET(request: NextRequest) {
  const auth = await verifyJwtAndRole(request, ['superadmin', 'developer']);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const tenant = request.headers.get('x-tenant') || null;

  const pool = getPool();
  let db: 'ok' | 'error' = 'ok';

  if (!pool) {
    db = 'error';
  } else {
    try {
      await pool.query('SELECT 1');
    } catch {
      db = 'error';
    }
  }

  const pinecone = isPineconeAvailable() ? 'ok' : 'unconfigured';
  const gemini = isAiAvailable() ? 'ok' : 'unconfigured';

  let lastScrape: string | null = null;
  let lastAiRun: string | null = null;
  let pendingScrapes = 0;

  if (pool && db === 'ok') {
    const scraperMeta = await getScraperMeta(tenant);
    if (scraperMeta && scraperMeta.lastRunAt) {
      lastScrape = scraperMeta.lastRunAt;
    }

    const aiMeta = await getAiMeta(tenant);
    if (aiMeta && aiMeta.lastRunAt) {
      lastAiRun = aiMeta.lastRunAt;
    }

    try {
      const params: (string | number)[] = [];
      let where = '(ai_last_refreshed_at IS NULL OR ai_narrative IS NULL)';
      if (tenant) {
        params.push(tenant);
        where += ' AND (tenant_id = $1 OR tenant_id IS NULL)';
      }
      const countResult = await pool.query<CountRow>(
        `SELECT COUNT(*)::int AS c FROM politicians WHERE ${where}`,
        params
      );
      pendingScrapes = countResult.rows[0]?.c ?? 0;
    } catch {
      pendingScrapes = 0;
    }
  }

  return NextResponse.json({
    db,
    pinecone,
    gemini,
    lastScrape,
    lastAiRun,
    pendingScrapes,
  });
}

