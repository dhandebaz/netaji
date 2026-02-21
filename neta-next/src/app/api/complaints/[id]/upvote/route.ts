import { NextRequest, NextResponse } from 'next/server';
import { upvoteComplaint } from '@/lib/complaints';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const tenant = request.headers.get('x-tenant') || null;

  const updated = await upvoteComplaint({ tenant, id });
  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

