import { NextRequest, NextResponse } from 'next/server';
import { createGrievance, getGrievances } from '@/lib/grievances';
import { verifyJwtAndRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await verifyJwtAndRole(request, ['superadmin']);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const tenant = request.headers.get('x-tenant') || null;
  const result = await getGrievances(tenant);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const tenant = request.headers.get('x-tenant') || null;
  const body = await request.json();
  try {
    const created = await createGrievance(tenant, body);
    return NextResponse.json({ success: true, data: created });
  } catch (e) {
    const error = e as Error;
    const msg = typeof error.message === 'string' && error.message ? error.message : 'failed_to_create_grievance';
    const status = msg === 'invalid_payload' ? 400 : msg === 'support_channel_unavailable' ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
