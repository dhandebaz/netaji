import crypto from 'crypto';
import type { AuditReport } from './index';

export function hashAuditReport(report: AuditReport): string {
  const json = JSON.stringify(report);
  return crypto.createHash('sha256').update(json).digest('hex');
}

