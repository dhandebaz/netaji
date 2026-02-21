import { runSystemAudit } from '@/lib/supervisor';
import { hashAuditReport } from '@/lib/supervisor/hash';
import { renderTransparencyHtml } from '@/lib/supervisor/pdf';

export async function GET() {
  const report = await runSystemAudit(false);
  const hash = hashAuditReport(report);

  const integrity =
    report.healthScore - report.stats.voteAnomalies * 2;
  const integrityScore = Math.max(Math.min(integrity, 100), 0);

  const html = renderTransparencyHtml({
    report,
    integrityScore,
    anchorHash: hash,
    timestamp: new Date().toISOString(),
  });

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
