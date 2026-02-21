import { GoogleGenerativeAI } from '@google/generative-ai';
import { getPool } from '@/lib/db';
import { saveAiMeta } from '@/lib/admin/settings';
import { logCronRun } from '@/lib/cron';

type PoliticianRecord = {
  id: number;
  name: string;
  party: string | null;
  state: string | null;
  constituency: string | null;
  role?: string | null;
  approval_rating?: number | null;
  total_assets?: number | null;
  criminal_cases?: number | null;
  attendance?: number | null;
  votes_up?: number | null;
  votes_down?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  history?: { position?: string }[] | null;
};

type LlmPayload = {
  id: number;
  name: string;
  party: string | null;
  state: string | null;
  constituency: string | null;
  role: string;
  approval_rating: number | null;
  total_assets: number | null;
  criminal_cases: number | null;
  attendance: number | null;
  votes: {
    up: number;
    down: number;
  };
  last_updated: string | null;
};

const getAiClient = () => {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!key) return null;
  try {
    return new GoogleGenerativeAI(key);
  } catch {
    return null;
  }
};

export const isAiAvailable = () => {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!key) return false;
  try {
    const client = new GoogleGenerativeAI(key);
    return !!client;
  } catch {
    return false;
  }
};

export const generateText = async (prompt: string) => {
  const client = getAiClient();
  if (!client) {
    return null;
  }
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });
  const text = result.response.text();
  return { text };
};

async function loadPoliticianBySlug(slug: string, tenant: string | null): Promise<PoliticianRecord | null> {
  const pool = getPool();
  if (!pool) {
    return null;
  }
  await pool.query('SELECT 1'); // ensure connection
  const params: (string | null)[] = [slug];
  let where = 'slug = $1';
  if (tenant) {
    params.push(tenant);
    where += ' AND (tenant_id = $2 OR tenant_id IS NULL)';
  }
  const rows = await pool.query<PoliticianRecord>(`SELECT * FROM politicians WHERE ${where} LIMIT 1`, params);
  if (!rows.rows[0]) return null;
  return rows.rows[0];
}

export async function getLlmPoliticianPayload(slug: string, tenant: string | null): Promise<LlmPayload | null> {
  const record = await loadPoliticianBySlug(slug, tenant);
  if (!record) {
    return null;
  }
  return {
    id: record.id,
    name: record.name,
    party: record.party || null,
    state: record.state || null,
    constituency: record.constituency || null,
    role: record.role || 'elected',
    approval_rating: typeof record.approval_rating === 'number' ? record.approval_rating : null,
    total_assets: typeof record.total_assets === 'number' ? record.total_assets : null,
    criminal_cases: typeof record.criminal_cases === 'number' ? record.criminal_cases : null,
    attendance: typeof record.attendance === 'number' ? record.attendance : null,
    votes: {
      up: typeof record.votes_up === 'number' ? record.votes_up : 0,
      down: typeof record.votes_down === 'number' ? record.votes_down : 0,
    },
    last_updated: record.updated_at || record.created_at || null,
  };
}

export async function generatePoliticianSummary(slug: string, tenant: string | null) {
  const pool = getPool();
  if (!pool) {
    return null;
  }

  const record = await loadPoliticianBySlug(slug, tenant);
  if (!record) {
    return null;
  }

  const ai = getAiClient();
  if (!ai) {
    return {
      structured: {
        id: record.id,
        name: record.name,
        party: record.party,
        state: record.state,
        constituency: record.constituency,
        approval_rating: typeof record.approval_rating === 'number' ? record.approval_rating : null,
        total_assets: typeof record.total_assets === 'number' ? record.total_assets : null,
        criminal_cases: typeof record.criminal_cases === 'number' ? record.criminal_cases : null,
        attendance: typeof record.attendance === 'number' ? record.attendance : null,
      },
      narrative: null,
      swot: null,
      provider: 'offline',
    };
  }

  const history = Array.isArray(record.history) ? record.history : [];
  const recentRole = history[0]?.position || 'Politician';
  const prompt = [
    'You are NetaAI, a neutral political analyst for India.',
    'Generate a short narrative summary and SWOT analysis for this politician.',
    'Keep tone factual and non-partisan.',
    `Name: ${record.name}`,
    `Party: ${record.party || 'Unknown'}`,
    `State: ${record.state || 'Unknown'}`,
    `Constituency: ${record.constituency || 'Unknown'}`,
    `Approval Rating: ${typeof record.approval_rating === 'number' ? record.approval_rating : 'Unknown'}`,
    `Total Assets (Cr): ${typeof record.total_assets === 'number' ? record.total_assets : 'Unknown'}`,
    `Criminal Cases: ${typeof record.criminal_cases === 'number' ? record.criminal_cases : 'Unknown'}`,
    `Attendance: ${typeof record.attendance === 'number' ? record.attendance : 'Unknown'}%`,
    `Recent Role: ${recentRole}`,
    '',
    'Respond as strict JSON with this exact shape:',
    '{',
    '  "narrative": "2 paragraphs of analysis.",',
    '  "swot": {',
    '    "strengths": ["..."],',
    '    "weaknesses": ["..."],',
    '    "opportunities": ["..."],',
    '    "threats": ["..."]',
    '  }',
    '}',
  ].join('\n');

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    const text = result.response.text();
    let parsed: { narrative?: string; swot?: unknown } | null = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
    return {
      structured: {
        id: record.id,
        name: record.name,
        party: record.party,
        state: record.state,
        constituency: record.constituency,
        approval_rating: typeof record.approval_rating === 'number' ? record.approval_rating : null,
        total_assets: typeof record.total_assets === 'number' ? record.total_assets : null,
        criminal_cases: typeof record.criminal_cases === 'number' ? record.criminal_cases : null,
        attendance: typeof record.attendance === 'number' ? record.attendance : null,
      },
      narrative: parsed && typeof parsed.narrative === 'string' ? parsed.narrative : null,
      swot: parsed && parsed.swot ? parsed.swot : null,
      provider: 'google-gemini',
    };
  } catch {
    return {
      structured: {
        id: record.id,
        name: record.name,
        party: record.party,
        state: record.state,
        constituency: record.constituency,
        approval_rating: typeof record.approval_rating === 'number' ? record.approval_rating : null,
        total_assets: typeof record.total_assets === 'number' ? record.total_assets : null,
        criminal_cases: typeof record.criminal_cases === 'number' ? record.criminal_cases : null,
        attendance: typeof record.attendance === 'number' ? record.attendance : null,
      },
      narrative: null,
      swot: null,
      provider: 'error',
    };
  }
}

export type AiRefreshResult = {
  success: boolean;
  count: number;
  durationMs: number;
  error?: string;
};

export async function runAiRefreshBatch(limit: number, tenant: string | null): Promise<AiRefreshResult> {
  const started = Date.now();
  const pool = getPool();
  if (!pool) {
    const durationMs = Date.now() - started;
    await logCronRun('ai-refresh', 'error', 'database_unavailable');
    return { success: false, count: 0, durationMs, error: 'database_unavailable' };
  }

  const aiClientAvailable = isAiAvailable();
  if (!aiClientAvailable) {
    const durationMs = Date.now() - started;
    await logCronRun('ai-refresh', 'error', 'ai_unavailable');
    return { success: false, count: 0, durationMs, error: 'ai_unavailable' };
  }

  const maxCount = Math.max(1, Math.min(5, Number.isFinite(limit) ? Number(limit) : 3));
  const tenantId = tenant || 'default';

  await pool.query('SELECT 1');

  const params: (string | number)[] = [];
  let where = '(ai_last_refreshed_at IS NULL OR ai_narrative IS NULL)';
  if (tenant) {
    params.push(tenant);
    where += ' AND (tenant_id = $1 OR tenant_id IS NULL)';
  }
  params.push(maxCount);
  const limitIndex = params.length;

  const rows = await pool.query<{ id: number; slug: string }>(
    `SELECT id, slug FROM politicians WHERE ${where} ORDER BY id ASC LIMIT $${limitIndex}`,
    params
  );

  if (rows.rows.length === 0) {
    const durationMs = Date.now() - started;
    await logCronRun('ai-refresh', 'ok', null, { count: 0, tenant: tenantId, reason: 'nothing_to_refresh' });
    await saveAiMeta(tenantId, {
      lastRunAt: new Date().toISOString(),
      lastCount: 0,
      lastError: null,
    });
    return { success: true, count: 0, durationMs };
  }

  let processed = 0;

  for (const row of rows.rows) {
    const summary = await generatePoliticianSummary(row.slug, tenant);
    if (!summary) {
      continue;
    }
    const narrative =
      typeof summary.narrative === 'string' && summary.narrative.length > 0 ? summary.narrative : null;
    const swot =
      summary.swot && typeof summary.swot === 'object' ? summary.swot : null;
    await pool.query(
      `UPDATE politicians
       SET ai_narrative = $1,
           ai_swot = $2,
           ai_last_refreshed_at = NOW()
       WHERE id = $3`,
      [narrative, swot, row.id]
    );
    processed += 1;
  }

  const durationMs = Date.now() - started;
  await logCronRun('ai-refresh', 'ok', null, { count: processed, tenant: tenantId });
  await saveAiMeta(tenantId, {
    lastRunAt: new Date().toISOString(),
    lastCount: processed,
    lastError: null,
  });

  return { success: true, count: processed, durationMs };
}
