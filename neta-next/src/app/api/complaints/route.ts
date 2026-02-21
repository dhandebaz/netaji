import { NextRequest, NextResponse } from 'next/server';
import { getComplaints, createComplaint } from '@/lib/complaints';

export async function GET(request: NextRequest) {
  const tenant = request.headers.get('x-tenant') || null;
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const status = searchParams.get('status');
  const politicianId = searchParams.get('politicianId');
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  const result = await getComplaints({
    tenant,
    status,
    politicianId,
    limit: limit ? parseInt(limit, 10) : undefined,
    offset: offset ? parseInt(offset, 10) : undefined,
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const tenant = request.headers.get('x-tenant') || null;
  const body = await request.json();
  const created = await createComplaint({ tenant, body });
  return NextResponse.json(created);
}

