import { NextRequest, NextResponse } from 'next/server';
import { getPoliticianBySlugHandler } from '@/lib/politicians';

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const { slug } = await context.params;
  const tenant = request.headers.get('x-tenant') || null;
  const result = await getPoliticianBySlugHandler({ tenant, slug });
  if (!result) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(result);
}

