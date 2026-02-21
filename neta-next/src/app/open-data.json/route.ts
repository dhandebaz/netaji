import { NextRequest, NextResponse } from 'next/server';
import { getOpenData } from '@/lib/openData';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const tenant = request.headers.get('x-tenant') || null;
  const payload = await getOpenData(tenant);
  return NextResponse.json(payload);
}

