import { NextRequest, NextResponse } from 'next/server';
import { runRealPoliticianRefresh } from '@/lib/scraper';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const tenant = request.headers.get('x-tenant') || null;
  const state = searchParams.get('state');
  const strictParam = searchParams.get('strict');
  const countParam = searchParams.get('count');

  const strict =
    typeof strictParam === 'string' &&
    ['1', 'true', 'yes'].includes(strictParam.toLowerCase());
  const maxCount = countParam ? Math.max(1, Math.min(6, Number(countParam))) : 3;

  const result = await runRealPoliticianRefresh({
    tenant,
    state,
    strict,
    maxCount,
  });

  const status = result.success ? 200 : strict ? 503 : 200;
  return NextResponse.json(result, { status });
}

