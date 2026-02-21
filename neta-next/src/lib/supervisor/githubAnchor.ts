import { hashAuditReport } from './hash';
import type { AuditReport } from './index';

export async function publishHashToGitHub(hash: string) {
  const repo = process.env.GH_AUDIT_REPO;
  const token = process.env.GH_TOKEN;

  if (!repo || !token) return { anchored: false };

  const date = new Date().toISOString().split('T')[0];
  const content = Buffer.from(hash, 'utf8').toString('base64');

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/audit-${date}.txt`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Daily audit anchor ${date}`,
      content,
    }),
  });

  return { anchored: res.ok };
}

export async function publishReportToGitHub(report: AuditReport) {
  const hash = hashAuditReport(report);
  return publishHashToGitHub(hash);
}

