import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtAndRole } from '@/lib/auth';
import { logCronRun } from '@/lib/cron';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  const hasCronSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!hasCronSecret) {
    const auth = await verifyJwtAndRole(request, ['superadmin']);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: auth.status });
    }
  }

  const tenant = request.headers.get('x-tenant') || null;
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : 50;

  const started = Date.now();
  const durationMs = Date.now() - started;

  await logCronRun('sync', 'ok', null, {
    tenant: tenant || 'default',
    limit,
  });

  return NextResponse.json({
    ok: true,
    count: 0,
    durationMs,
    mode: hasCronSecret ? 'cron' : 'admin',
  });
}

