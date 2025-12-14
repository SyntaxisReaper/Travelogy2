const DEFAULT_API_BASE = typeof window !== 'undefined' ? '/api' : 'http://localhost:8000/api';
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? DEFAULT_API_BASE;
export const DEMO_MODE = (process.env.REACT_APP_DEMO_MODE ?? '').toLowerCase() === 'true';

export const FIREBASE_CONFIG = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY ?? '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID ?? '',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID ?? undefined,
} as const;
