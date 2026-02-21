import { NextRequest, NextResponse } from 'next/server';
import { getGames, createGame } from '@/lib/games';

export async function GET() {
  const data = await getGames();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const created = await createGame({ body });
  return NextResponse.json(created);
}

