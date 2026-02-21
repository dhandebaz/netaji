import { NextRequest, NextResponse } from 'next/server';
import { runAiRefreshBatch } from '@/lib/ai';
import { verifyJwtAndRole } from '@/lib/auth';

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
  const limit = limitParam ? Number(limitParam) : 3;

  const result = await runAiRefreshBatch(limit, tenant);

  return NextResponse.json({
    ok: result.success,
    count: result.count,
    durationMs: result.durationMs,
    error: result.error || null,
    mode: hasCronSecret ? 'cron' : 'admin',
  });
}

