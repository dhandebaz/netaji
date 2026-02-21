import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtAndRole } from '@/lib/auth';

type AuditLogEntry = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target?: string | null;
  details?: string | null;
};

export async function GET(request: NextRequest) {
  const auth = await verifyJwtAndRole(request, ['superadmin']);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const limitParam = url.searchParams.get('limit');
  const offsetParam = url.searchParams.get('offset');
  const limit = Number.isFinite(Number(limitParam)) ? Number(limitParam) : 100;
  const offset = Number.isFinite(Number(offsetParam)) ? Number(offsetParam) : 0;

  const demo: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      actor: auth.user.email || 'system',
      action: 'login',
      target: 'superadmin',
      details: 'Superadmin dashboard login from Next API',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      actor: auth.user.email || 'system',
      action: 'settings.update',
      target: 'system_settings',
      details: 'Updated AI provider configuration',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      actor: auth.user.email || 'system',
      action: 'scraper.run',
      target: 'politician_scraper',
      details: 'Triggered real politician refresh via Next API',
    },
  ];

  const sliced = demo.slice(offset, offset + limit);

  return NextResponse.json({
    data: sliced,
    total: demo.length,
  });
}
