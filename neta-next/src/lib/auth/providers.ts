import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as admin from 'firebase-admin';
import { getSystemSettings } from '@/lib/admin/settings';

type DatabaseConfig = {
  type: string;
  enabled?: boolean;
};

type SettingsWithData = {
  data?: {
    databases?: DatabaseConfig[];
  };
};

let supabase: SupabaseClient | null = null;

export const DEMO_PASSWORDS = {
  superadmin: 'admin123',
  developer: 'dev123',
  volunteer: 'vol123',
  voter: 'citizen123',
};

export const ADMIN_USERS: Record<string, { password: string; role: string; name: string }> = {
  'admin@neta.ink': { password: DEMO_PASSWORDS.superadmin, role: 'superadmin', name: 'Super Admin' },
  'dev@neta.ink': { password: DEMO_PASSWORDS.developer, role: 'developer', name: 'Developer' },
  'volunteer@neta.ink': { password: DEMO_PASSWORDS.volunteer, role: 'volunteer', name: 'Volunteer User' },
};

export function getSupabase() {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null;
  }
  supabase = createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
  return supabase;
}

export async function isSupabaseAuthEnabled() {
  const supa = getSupabase();
  if (!supa) {
    return false;
  }
  try {
    const settings = (await getSystemSettings()) as SettingsWithData;
    const databases = settings.data?.databases || [];
    const supaDb = databases.find((db) => db.type === 'supabase');
    if (!supaDb) {
      return true;
    }
    return !!supaDb.enabled;
  } catch {
    return true;
  }
}

let firebaseApp: admin.app.App | null = null;

export function getFirebaseAdminApp() {
  if (firebaseApp) {
    return firebaseApp;
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !rawKey) {
    return null;
  }
  try {
    if (admin.apps.length) {
      firebaseApp = admin.apps[0] as admin.app.App;
      return firebaseApp;
    }
    const privateKey = rawKey.replace(/\\n/g, '\n');
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    return firebaseApp;
  } catch {
    return null;
  }
}
