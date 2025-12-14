// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration (from environment)
import { FIREBASE_CONFIG } from '../config/env';

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);

// Disable App Check to avoid token validation errors in development/production
// App Check can be re-enabled later with proper reCAPTCHA configuration
if (typeof window !== 'undefined') {
  console.log('🔒 App Check: DISABLED to avoid token validation errors');
  console.log('📝 To enable App Check: Configure reCAPTCHA in Firebase Console');
}

// Enhanced debug info for both development and production
if (typeof window !== 'undefined') {
  console.log('🔧 Firebase Config Check:');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Domain:', window.location.hostname);
  console.log('Origin:', window.location.origin);
  console.log('API Key:', process.env.REACT_APP_FIREBASE_API_KEY ? 'PRESENT' : 'MISSING');
  console.log('Project ID:', process.env.REACT_APP_FIREBASE_PROJECT_ID || 'MISSING');
  console.log('App ID:', process.env.REACT_APP_FIREBASE_APP_ID ? 'PRESENT' : 'MISSING');
  console.log('Auth Domain:', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'MISSING');
  
  // Check if all required config is present
  const requiredKeys = ['REACT_APP_FIREBASE_API_KEY', 'REACT_APP_FIREBASE_AUTH_DOMAIN', 'REACT_APP_FIREBASE_PROJECT_ID', 'REACT_APP_FIREBASE_APP_ID'];
  const missingKeys = requiredKeys.filter(key => !process.env[key]);
  if (missingKeys.length > 0) {
    console.error('❌ Missing Firebase config:', missingKeys);
  } else {
    console.log('✅ Firebase config complete');
  }
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only if supported)
let analytics = null;
try {
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }
} catch (e) {
  console.warn('Analytics initialization failed:', e);
}

// Set auth persistence
try {
  setPersistence(auth, browserLocalPersistence);
} catch (e) {
  console.warn('Auth persistence setup failed:', e);
}

export { analytics };

// Initialize Auth Providers (safe regardless of app init)
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider with enhanced settings
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({ 
  prompt: 'select_account',
  access_type: 'offline', // This might help with some auth issues
  include_granted_scopes: 'true',
  // Remove hd parameter as it can cause issues
});

// Log provider configuration
if (typeof window !== 'undefined') {
  console.log('🌐 Google Provider configured with scopes:', ['profile', 'email']);
  console.log('🔑 Custom parameters:', { prompt: 'select_account', access_type: 'offline' });
}


export default app;
