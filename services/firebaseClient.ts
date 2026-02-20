import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
if (!getApps().length) {
  if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
  } else {
    console.warn('[Firebase] Missing configuration. OTP login will be disabled.');
  }
} else {
  app = getApp();
}

export const firebaseApp = app;
export const firebaseAuth = app ? getAuth(app) : null;

