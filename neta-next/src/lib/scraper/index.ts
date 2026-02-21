import { upsertRealPoliticiansToDb, type RealPolitician } from '@/lib/politicians';
import { saveScraperMeta } from '@/lib/admin/settings';
import { logCronRun } from '@/lib/cron';
import { getFallbackPoliticians, fetchMultipleRealPoliticians } from '../realDataLoader.mjs';

type RunOptions = {
  tenant: string | null;
  state?: string | null;
  strict?: boolean;
  maxCount?: number;
};

type ScraperResult = {
  success: boolean;
  error?: string;
  count: number;
  strict?: boolean;
  politicians?: RealPolitician[];
  fallback?: boolean;
};

export async function runRealPoliticianRefresh(options: RunOptions): Promise<ScraperResult> {
  const tenantId = options.tenant || 'default';
  const stateFilter = options.state ? String(options.state) : null;
  const isStrict = !!options.strict;
  const maxCount = options.maxCount ?? 3;

  let realPoliticians: RealPolitician[] = [];

  try {
    const fetched = await fetchMultipleRealPoliticians(maxCount, null);
    realPoliticians = Array.isArray(fetched) ? (fetched as RealPolitician[]) : [];
  } catch {
    realPoliticians = [];
  }

  let usedFallback = false;

  if (!realPoliticians || realPoliticians.length === 0) {
    if (isStrict) {
      return {
        success: false,
        error: 'no_live_data',
        count: 0,
        strict: true,
      };
    }
    const fallback = getFallbackPoliticians(maxCount) as RealPolitician[];
    realPoliticians = fallback;
    usedFallback = true;
  }

  await upsertRealPoliticiansToDb(realPoliticians, tenantId);

  await saveScraperMeta(tenantId, {
    lastRunAt: new Date().toISOString(),
    lastSource: usedFallback ? 'fallback' : 'live',
    lastState: stateFilter || 'all',
    lastCount: realPoliticians.length,
  });

  return {
    success: true,
    count: realPoliticians.length,
    politicians: realPoliticians,
    fallback: usedFallback,
  };
}

export type ScrapeBatchResult = {
  success: boolean;
  count: number;
  fallback: boolean;
  durationMs: number;
  error?: string;
};

export async function runScrapeBatch(limit: number, tenant: string | null): Promise<ScrapeBatchResult> {
  const started = Date.now();
  const maxCount = Math.max(1, Math.min(10, Number.isFinite(limit) ? Number(limit) : 5));
  const tenantId = tenant || 'default';
  try {
    const result = await runRealPoliticianRefresh({
      tenant: tenantId,
      state: null,
      strict: false,
      maxCount,
    });
    await logCronRun('scrape', result.success ? 'ok' : 'error', result.error, {
      count: result.count,
      fallback: result.fallback ?? false,
      tenant: tenantId,
    });
    return {
      success: result.success,
      count: result.count,
      fallback: result.fallback ?? false,
      durationMs: Date.now() - started,
      error: result.error,
    };
  } catch (e) {
    const error = e as Error;
    const message = error.message || 'scrape_failed';
    await logCronRun('scrape', 'error', message, { tenant: tenantId });
    return {
      success: false,
      count: 0,
      fallback: false,
      durationMs: Date.now() - started,
      error: message,
    };
  }
}
