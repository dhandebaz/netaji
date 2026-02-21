import { getPool } from '@/lib/db';

type SettingsRow = {
  value: unknown;
};

type SystemSettings = Record<string, unknown>;

export type ScraperMeta = {
  lastRunAt?: string;
  lastSource?: string;
  lastState?: string;
  lastCount?: number;
};

type ScraperStatusValue = {
  tenants: Record<string, ScraperMeta>;
};

export type AiMeta = {
  lastRunAt?: string;
  lastCount?: number;
  lastError?: string | null;
};

type AiStatusValue = {
  tenants: Record<string, AiMeta>;
};

async function ensureSettingsTable() {
  const pool = getPool();
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
  )`);
}

export async function getSystemSettings(): Promise<SystemSettings> {
  const pool = getPool();
  if (!pool) {
    return {};
  }
  await ensureSettingsTable();
  const result = await pool.query<SettingsRow>('SELECT value FROM settings WHERE key = $1 LIMIT 1', ['system']);
  const raw = result.rows[0]?.value;
  if (raw && typeof raw === 'object') {
    return raw as SystemSettings;
  }
  return {};
}

export async function saveSystemSettings(partial: SystemSettings): Promise<SystemSettings> {
  const pool = getPool();
  if (!pool) {
    return partial;
  }
  await ensureSettingsTable();
  const current = await getSystemSettings();
  const merged: SystemSettings = { ...current, ...partial };
  await pool.query(
    `INSERT INTO settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
    ['system', merged]
  );
  return merged;
}

export async function saveScraperMeta(tenantId: string | null, meta: ScraperMeta): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await ensureSettingsTable();
  const key = 'politician_scraper_status';
  let current: ScraperStatusValue = { tenants: {} };
  try {
    const existing = await pool.query<SettingsRow>('SELECT value FROM settings WHERE key = $1 LIMIT 1', [key]);
    if (existing.rows[0]?.value && typeof existing.rows[0].value === 'object') {
      current = existing.rows[0].value as ScraperStatusValue;
    }
  } catch {
    current = { tenants: {} };
  }
  const tenants = current.tenants || {};
  const id = tenantId || 'default';
  tenants[id] = { ...(tenants[id] || {}), ...meta };
  const value: ScraperStatusValue = { tenants };
  await pool.query(
    `INSERT INTO settings (key, value)
     VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [key, value]
  );
}

export async function getScraperMeta(tenantId: string | null): Promise<ScraperMeta | null> {
  const pool = getPool();
  if (!pool) return null;
  await ensureSettingsTable();
  const key = 'politician_scraper_status';
  try {
    const existing = await pool.query<SettingsRow>('SELECT value FROM settings WHERE key = $1 LIMIT 1', [key]);
    const current = existing.rows[0]?.value as ScraperStatusValue | undefined;
    const tenants = current?.tenants || {};
    const id = tenantId || 'default';
    return tenants[id] || null;
  } catch {
    return null;
  }
}

export async function saveAiMeta(tenantId: string | null, meta: AiMeta): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await ensureSettingsTable();
  const key = 'politician_ai_status';
  let current: AiStatusValue = { tenants: {} };
  try {
    const existing = await pool.query<SettingsRow>('SELECT value FROM settings WHERE key = $1 LIMIT 1', [key]);
    if (existing.rows[0]?.value && typeof existing.rows[0].value === 'object') {
      current = existing.rows[0].value as AiStatusValue;
    }
  } catch {
    current = { tenants: {} };
  }
  const tenants = current.tenants || {};
  const id = tenantId || 'default';
  tenants[id] = { ...(tenants[id] || {}), ...meta };
  const value: AiStatusValue = { tenants };
  await pool.query(
    `INSERT INTO settings (key, value)
     VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [key, value]
  );
}

export async function getAiMeta(tenantId: string | null): Promise<AiMeta | null> {
  const pool = getPool();
  if (!pool) return null;
  await ensureSettingsTable();
  const key = 'politician_ai_status';
  try {
    const existing = await pool.query<SettingsRow>('SELECT value FROM settings WHERE key = $1 LIMIT 1', [key]);
    const current = existing.rows[0]?.value as AiStatusValue | undefined;
    const tenants = current?.tenants || {};
    const id = tenantId || 'default';
    return tenants[id] || null;
  } catch {
    return null;
  }
}
