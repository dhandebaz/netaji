import type { AuditReport } from './index';

export function renderTransparencyHtml(params: {
  report: AuditReport;
  integrityScore: number;
  anchorHash: string;
  timestamp: string;
}) {
  const { report, integrityScore, anchorHash, timestamp } = params;

  const stability = report.stats.governanceStability;
  const drift =
    typeof report.stats.healthDrift === 'number'
      ? report.stats.healthDrift
      : null;
  const stateHealth = report.stats.stateHealth ?? [];

  const rows = stateHealth
    .map(
      (s) =>
        `<tr><td>${s.state}</td><td>${s.healthScore}</td></tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>System Transparency Report</title>
</head>
<body>
  <h1>System Transparency Report</h1>
  <p>Generated at: ${timestamp}</p>
  <h2>Core Metrics</h2>
  <ul>
    <li>Health Score: ${report.healthScore}</li>
    <li>Governance Stability: ${stability}</li>
    <li>Integrity Score: ${integrityScore}</li>
    <li>Health Drift: ${drift ?? 'N/A'}</li>
    <li>Anchor Hash: ${anchorHash}</li>
  </ul>
  <h2>State Ranking</h2>
  <table border="1" cellspacing="0" cellpadding="4">
    <thead>
      <tr><th>State</th><th>Health Score</th></tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;
}

