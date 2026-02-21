import { NextRequest, NextResponse } from 'next/server';
import { adminAiChat } from '@/lib/ai/admin';
import { verifyJwtAndRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = await verifyJwtAndRole(request, ['superadmin']);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const body = await request.json();
  const message = body.message || body.prompt;
  if (!message) {
    return NextResponse.json({ success: false, error: 'missing_message' }, { status: 400 });
  }
  const email = auth.user.email || 'system';
  const result = await adminAiChat(message, email);
  return NextResponse.json(result);
}
