import { NextResponse } from 'next/server';
import { runSystemAudit } from '@/lib/supervisor';

export async function GET() {
  const report = await runSystemAudit(false);

  const integrity =
    report.healthScore - report.stats.voteAnomalies * 2;

  return NextResponse.json({
    integrityScore: Math.max(Math.min(integrity, 100), 0),
  });
}

