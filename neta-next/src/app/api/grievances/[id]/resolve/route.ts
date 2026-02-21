import { NextRequest, NextResponse } from 'next/server';
import { resolveGrievance } from '@/lib/grievances';
import { verifyJwtAndRole } from '@/lib/auth';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteParams) {
  const auth = await verifyJwtAndRole(request, ['superadmin']);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await context.params;
  const resolved = await resolveGrievance(id);
  if (!resolved) {
    return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: resolved });
}

