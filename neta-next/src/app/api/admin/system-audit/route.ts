import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtAndRole } from '@/lib/auth';
import { runSystemAudit } from '@/lib/supervisor';

export async function GET(request: NextRequest) {
  const auth = await verifyJwtAndRole(request, ['superadmin', 'developer']);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const report = await runSystemAudit();

  return NextResponse.json(report);
}

