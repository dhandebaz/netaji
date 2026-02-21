import { NextRequest, NextResponse } from 'next/server';
import { getLlmPoliticianPayload } from '@/lib/ai';

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const { slug } = await context.params;
  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }
  const tenant = request.headers.get('x-tenant') || null;
  const payload = await getLlmPoliticianPayload(slug, tenant);
  if (!payload) {
    return NextResponse.json({ error: 'Politician not found' }, { status: 404 });
  }
  return NextResponse.json(payload);
}

