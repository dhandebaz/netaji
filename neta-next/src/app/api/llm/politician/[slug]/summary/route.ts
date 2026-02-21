import { NextRequest, NextResponse } from 'next/server';
import { generatePoliticianSummary } from '@/lib/ai';

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const { slug } = await context.params;
  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }
  const tenant = request.headers.get('x-tenant') || null;
  const result = await generatePoliticianSummary(slug, tenant);
  if (!result) {
    return NextResponse.json({ error: 'Politician not found or AI unavailable' }, { status: 404 });
  }
  return NextResponse.json(result);
}

