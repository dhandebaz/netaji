import { NextRequest, NextResponse } from 'next/server';
import { addVote } from '@/lib/votes';

export async function POST(request: NextRequest) {
  const tenant = request.headers.get('x-tenant') || null;
  const body = await request.json();

  const politicianId = Number(body.politicianId);
  const voteType = body.voteType === 'down' ? 'down' : 'up';
  const voterId = body.voterId || null;

  if (!politicianId || !['up', 'down'].includes(voteType)) {
    return NextResponse.json({ error: 'Invalid vote payload' }, { status: 400 });
  }

  const result = await addVote({
    tenant,
    politicianId,
    voteType,
    voterId,
    ipAddress: request.headers.get('x-forwarded-for') || null,
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}

