import { NextRequest, NextResponse } from 'next/server';
import { updateRTITask } from '@/lib/rti';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const tenant = request.headers.get('x-tenant') || null;
  const body = await request.json();

  const updated = await updateRTITask({ tenant, id, body });
  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

