import { NextRequest, NextResponse } from 'next/server';
import { getPoliticiansHandler } from '@/lib/politicians';
import { runRealPoliticianRefresh } from '@/lib/scraper';

export async function GET(request: NextRequest) {
  const tenant = request.headers.get('x-tenant') || null;
  try {
    const existing = await getPoliticiansHandler({
      tenant,
      state: null,
      party: null,
      search: null,
      sort: null,
      limit: 50,
      offset: 0,
      role: null,
      ids: null,
    });
    if (Array.isArray(existing.data) && existing.data.length > 0) {
      return NextResponse.json({
        success: true,
        politicians: existing.data,
        count: existing.data.length,
      });
    }
  } catch {
  }

  const result = await runRealPoliticianRefresh({
    tenant,
    state: null,
    strict: false,
    maxCount: 6,
  });

  if (!result.success) {
    return NextResponse.json(
      {
        success: true,
        politicians: [],
        count: 0,
        fallback: true,
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    success: true,
    politicians: result.politicians,
    count: result.count,
    fallback: result.fallback,
  });
}

