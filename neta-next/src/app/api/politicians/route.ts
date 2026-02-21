import { NextRequest, NextResponse } from 'next/server';
import { getPoliticiansHandler, createPoliticianHandler } from '@/lib/politicians';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const tenant = request.headers.get('x-tenant') || null;

  const state = searchParams.get('state');
  const party = searchParams.get('party');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort');
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');
  const role = searchParams.get('role');
  const ids = searchParams.get('ids');

  const result = await getPoliticiansHandler({
    tenant,
    state,
    party,
    search,
    sort,
    limit: limit ? parseInt(limit, 10) : undefined,
    offset: offset ? parseInt(offset, 10) : undefined,
    role,
    ids,
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const tenant = request.headers.get('x-tenant') || null;
  const body = await request.json();
  const result = await createPoliticianHandler({ tenant, body });
  return NextResponse.json(result);
}

