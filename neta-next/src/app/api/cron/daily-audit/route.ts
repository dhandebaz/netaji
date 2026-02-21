import { NextRequest, NextResponse } from 'next/server';
import { logCronRun } from '@/lib/cron';
import { runSystemAudit } from '@/lib/supervisor';
import { hashAuditReport } from '@/lib/supervisor/hash';
import { publishHashToGitHub } from '@/lib/supervisor/githubAnchor';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  const hasCronSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!hasCronSecret) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized' },
      { status: 401 }
    );
  }

  const report = await runSystemAudit(true);

  const hash = hashAuditReport(report);
  await publishHashToGitHub(hash);

  await logCronRun('daily-audit', 'ok', null, {
    snapshot: true,
    hash,
  });

  return NextResponse.json({
    ok: true,
    snapshot: true,
    mode: 'cron',
  });
}
