import { NextRequest, NextResponse } from 'next/server';
import { updateGame, deleteGame } from '@/lib/games';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const body = await request.json();

  const updated = await updateGame({ id, body });
  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const ok = await deleteGame({ id });
  if (!ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

