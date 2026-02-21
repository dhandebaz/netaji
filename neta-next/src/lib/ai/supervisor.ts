import { generateText } from './index';
import { AuditReport } from '@/lib/supervisor';

export async function generateSupervisorNarrative(report: AuditReport): Promise<string> {
  const prompt = `
You are a governance system advisor.
Given this system audit JSON, produce a concise narrative that includes:
1. Overall health (plain language)
2. Key risks and whether anomalies appear coordinated or isolated
3. A governance stability score from 0-100 with a one-line justification
4. Strategic next steps in priority order
5. A short executive summary (max 200 words)

JSON:
${JSON.stringify(report, null, 2)}
`;

  const result = await generateText(prompt);
  return result?.text ?? '';
}
