import { NextRequest, NextResponse } from 'next/server';
import { playGame } from '@/lib/games';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(_: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const updated = await playGame({ id });
  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

