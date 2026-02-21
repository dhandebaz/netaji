import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { ADMIN_USERS, getSupabase, isSupabaseAuthEnabled } from '@/lib/auth/providers';

type LoginBody = {
  email?: string;
  password?: string;
  role?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const email = body.email;
  const password = body.password;
  const role = body.role;

  try {
    if (role === 'voter') {
      const supabaseEnabled = await isSupabaseAuthEnabled();
      if (!supabaseEnabled) {
        return NextResponse.json({ success: false, error: 'supabase_disabled' }, { status: 503 });
      }
      const supabase = getSupabase();
      if (!supabase) {
        return NextResponse.json({ success: false, error: 'supabase_unavailable' }, { status: 503 });
      }
      if (!email || !password) {
        return NextResponse.json({ success: false, error: 'missing_credentials' }, { status: 400 });
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data?.user) {
        return NextResponse.json({ success: false, error: 'invalid_credentials' }, { status: 401 });
      }

      const supaUser = data.user;
      const token = signToken({
        id: supaUser.id,
        role: 'voter',
        email: supaUser.email || email,
      });

      return NextResponse.json({
        success: true,
        user: {
          id: supaUser.id,
          name:
            typeof supaUser.user_metadata === 'object' && supaUser.user_metadata && 'full_name' in supaUser.user_metadata
              ? (supaUser.user_metadata as { full_name?: string }).full_name || 'Citizen Voter'
              : 'Citizen Voter',
          email: supaUser.email || email,
          role: 'voter',
          token,
        },
      });
    }

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'missing_credentials' }, { status: 400 });
    }

    const user = ADMIN_USERS[email];
    if (user && password === user.password) {
      const token = signToken({
        id: Date.now().toString(),
        role: user.role,
        email,
      });
      return NextResponse.json({
        success: true,
        user: {
          id: Date.now().toString(),
          name: user.name,
          email,
          role: user.role,
          token,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: 'auth_internal_error' }, { status: 500 });
  }
}
