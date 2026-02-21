import { NextResponse } from 'next/server';
import { runSystemAudit } from '@/lib/supervisor';
import { hashAuditReport } from '@/lib/supervisor/hash';

export const revalidate = 60;

export async function GET() {
  const report = await runSystemAudit(false);
  const hash = hashAuditReport(report);

  return NextResponse.json({
    healthScore: report.healthScore,
    riskLevel: report.riskLevel,
    issues: report.issues,
    stats: report.stats,
    generatedAt: report.generatedAt,
    hash,
  });
}
