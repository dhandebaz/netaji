import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtAndRole } from '@/lib/auth';
import { logCronRun } from '@/lib/cron';
import { runSystemAudit } from '@/lib/supervisor';

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
  const reason = searchParams.get('reason') || null;

  const started = Date.now();

  try {
    const report = await runSystemAudit();
    const durationMs = Date.now() - started;

    await logCronRun('system-audit', 'ok', null, {
      tenant: tenant || 'default',
      healthScore: report.healthScore,
      riskLevel: report.riskLevel,
      reason,
    });

    return NextResponse.json({
      ok: true,
      durationMs,
      healthScore: report.healthScore,
      riskLevel: report.riskLevel,
      mode: hasCronSecret ? 'cron' : 'admin',
    });
  } catch (error) {
    const durationMs = Date.now() - started;

    await logCronRun('system-audit', 'error', String(error), {
      tenant: tenant || 'default',
      reason,
    });

    return NextResponse.json(
      {
        ok: false,
        durationMs,
        error: 'system_audit_failed',
        mode: hasCronSecret ? 'cron' : 'admin',
      },
      { status: 500 }
    );
  }
}

