import { NextRequest, NextResponse } from 'next/server';
import { getVolunteers, createVolunteer } from '@/lib/volunteer';

export async function GET(request: NextRequest) {
  const tenant = request.headers.get('x-tenant') || null;
  const data = await getVolunteers({ tenant });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const tenant = request.headers.get('x-tenant') || null;
  const body = await request.json();
  const created = await createVolunteer({ tenant, body });
  return NextResponse.json(created);
}

