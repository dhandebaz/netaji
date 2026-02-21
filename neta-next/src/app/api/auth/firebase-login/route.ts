import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { signToken } from '@/lib/auth';
import { DEMO_PASSWORDS, getFirebaseAdminApp } from '@/lib/auth/providers';

type FirebaseLoginBody = {
  idToken?: string;
  role?: string;
};

export async function POST(request: NextRequest) {
  const app = getFirebaseAdminApp();
  if (!app) {
    return NextResponse.json({ success: false, error: 'otp_unavailable' }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as FirebaseLoginBody;
  const idToken = body.idToken;
  const role = body.role;

  if (!idToken) {
    return NextResponse.json({ success: false, error: 'missing_token' }, { status: 400 });
  }

  try {
    const decoded = await admin.auth(app).verifyIdToken(idToken);
    const userPhone = decoded.phone_number || null;
    const uid = decoded.uid;
    const assignedRole = role && Object.prototype.hasOwnProperty.call(DEMO_PASSWORDS, role) ? role : 'voter';

    const token = signToken({
      id: uid,
      role: assignedRole,
      phone: userPhone || undefined,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: uid,
        name: 'Citizen Voter',
        email: userPhone || 'phone-user@neta.app',
        role: assignedRole,
        token,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_token' }, { status: 401 });
  }
}
