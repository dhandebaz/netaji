import { NextRequest, NextResponse } from 'next/server';
import { adminAiAnalyze } from '@/lib/ai/admin';
import { verifyJwtAndRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = await verifyJwtAndRole(request, ['superadmin', 'developer']);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const body = await request.json();
  const analysisType = body.analysisType || 'general';
  const result = await adminAiAnalyze(analysisType);
  return NextResponse.json(result);
}

