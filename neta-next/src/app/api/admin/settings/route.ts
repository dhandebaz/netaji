import { NextRequest, NextResponse } from 'next/server';
import { getSystemSettings, saveSystemSettings } from '@/lib/admin/settings';
import { verifyJwtAndRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await verifyJwtAndRole(request, ['superadmin', 'developer']);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const settings = await getSystemSettings();
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const auth = await verifyJwtAndRole(request, ['superadmin']);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const body = await request.json();
  const merged = await saveSystemSettings(body);
  return NextResponse.json({ success: true, settings: merged });
}

