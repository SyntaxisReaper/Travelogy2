import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  signInWithRedirect,
  User 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  travelStats?: {
    totalTrips: number;
    totalDistance: number;
    favoriteTransport: string;
    sustainabilityScore: number;
  };
}

const ensureFirebase = () => {
  if (!auth || !db) {
    const err: any = new Error('Firebase authentication is not available');
    err.code = 'auth/config-missing';
    throw err;
  }
};

// Sign up with email and password
export const signUpWithEmail = async (
  email: string, 
  password: string, 
  displayName?: string
): Promise<User> => {
  try {
    ensureFirebase();
    const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
    const user = userCredential.user;
    
    // Update the user's display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    // Create user profile in Firestore (best-effort — don't block auth if it fails)
    try {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: displayName || user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        travelStats: {
          totalTrips: 0,
          totalDistance: 0,
          favoriteTransport: '',
          sustainabilityScore: 100
        }
      };
      await setDoc(doc(db!, 'users', user.uid), userProfile);
    } catch (e) {
      console.warn('signUp: profile write skipped', e);
    }
    
    return user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<User> => {
  try {
    ensureFirebase();
    const userCredential = await signInWithEmailAndPassword(auth!, email, password);
    const user = userCredential.user;
    
    // Update last login time (best-effort)
    try {
      const userRef = doc(db!, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await setDoc(userRef, { lastLoginAt: new Date() }, { merge: true });
      }
    } catch (e) {
      console.warn('signIn: lastLoginAt write skipped', e);
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};


// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    ensureFirebase();
    let user: User | null = null;
    
    try {
      // Try popup first
      const result = await signInWithPopup(auth!, googleProvider);
      user = result.user;
    } catch (err: any) {
      const code = err?.code || '';
      
      // Handle popup issues
      if (code === 'auth/popup-blocked' || 
          code === 'auth/popup-closed-by-user' ||
          code === 'auth/cancelled-popup-request') {
        // Try redirect as fallback
        try {
          await signInWithRedirect(auth!, googleProvider);
          return new Promise(() => { /* redirecting */ }) as unknown as Promise<User>;
        } catch (redirectErr) {
          throw err; // Throw original popup error
        }
      }
      
      // Handle specific error codes
      if (code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        const currentOrigin = window.location.origin;
        const isProduction = currentDomain.includes('vercel.app') || currentDomain.includes('netlify.app') || !currentDomain.includes('localhost');
        
        console.error('🚫 Firebase Auth Domain Error:');
        console.error('Current domain:', currentDomain);
        console.error('Current origin:', currentOrigin);
        console.error('To fix: Go to Firebase Console → Authentication → Settings → Authorized domains');
        console.error(`Add this domain: ${currentDomain}`);
        
        const domainMessage = isProduction 
          ? `Domain "${currentDomain}" not authorized for Google sign-in.\n\nTo fix this:\n1. Go to Firebase Console\n2. Authentication → Settings → Authorized domains\n3. Add "${currentDomain}"\n4. Try again\n\nFor now, please use email/password login.`
          : `Localhost not authorized for Google sign-in.\n\nTo fix this:\n1. Go to Firebase Console\n2. Authentication → Settings → Authorized domains\n3. Add "localhost"\n4. Try again\n\nFor now, please use email/password login.`;
        
        const error: any = new Error(domainMessage);
        error.code = 'auth/unauthorized-domain';
        throw error;
      }
      
      if (code === 'auth/internal-error') {
        console.error('🔴 Google Sign-in Internal Error Details:');
        console.error('Error object:', err);
        console.error('Error message:', err?.message);
        console.error('Error details:', err?.customData);
        console.error('Current domain:', window.location.hostname);
        console.error('Current origin:', window.location.origin);
        console.error('Firebase config check:');
        console.error('- Project ID:', process.env.REACT_APP_FIREBASE_PROJECT_ID);
        console.error('- Auth Domain:', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN);
        console.error('- App ID present:', !!process.env.REACT_APP_FIREBASE_APP_ID);
        
        const detailedMessage = `Google sign-in internal error detected.\n\n` +
          `This usually means:\n` +
          `1. OAuth consent screen is not configured in Google Cloud Console\n` +
          `2. OAuth client is not properly configured\n` +
          `3. Firebase Authentication provider settings are incorrect\n\n` +
          `Domain: ${window.location.hostname}\n` +
          `Please check Firebase Console > Authentication > Sign-in method > Google\n` +
          `and Google Cloud Console > APIs & Services > Credentials\n\n` +
          `For now, please use email/password login.`;
        
        const error: any = new Error(detailedMessage);
        error.code = 'auth/internal-error';
        throw error;
      }
      
      if (code === 'auth/network-request-failed') {
        const error: any = new Error('Network error during Google sign-in. Please check your connection and try again.');
        error.code = 'auth/network-request-failed';
        throw error;
      }
      
      // For other errors, add context
      const error: any = new Error(`Google sign-in failed: ${err.message || 'Unknown error'}`);
      error.code = code || 'auth/unknown-error';
      throw error;
    }

    // Check/create profile (best-effort) in Firestore
    try {
      const userRef = doc(db!, 'users', user!.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const userProfile: UserProfile = {
          uid: user!.uid,
          email: user!.email!,
          displayName: user!.displayName || '',
          photoURL: user!.photoURL || '',
          createdAt: new Date(),
          lastLoginAt: new Date(),
          travelStats: {
            totalTrips: 0,
            totalDistance: 0,
            favoriteTransport: '',
            sustainabilityScore: 100
          }
        };
        await setDoc(userRef, userProfile);
      } else {
        await setDoc(userRef, { lastLoginAt: new Date() }, { merge: true });
      }
    } catch (e) {
      console.warn('google signIn: profile write skipped', e);
    }

    return user!;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};


// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    ensureFirebase();
    await signOut(auth!);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    ensureFirebase();
    await sendPasswordResetEmail(auth!, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    ensureFirebase();
    const userRef = doc(db!, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  uid: string, 
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    ensureFirebase();
    const userRef = doc(db!, 'users', uid);
    await setDoc(userRef, updates, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Firebase Auth error messages helper
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No user found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'This email address is already registered.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Popup was blocked. Please allow popups and try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in cancelled. Please try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    case 'auth/auth-domain-config-required':
      return 'Authentication configuration error. Please contact support.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact support.';
    case 'auth/unauthorized-domain': {
      const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
      const isProduction = currentDomain.includes('vercel.app') || currentDomain.includes('netlify.app') || !currentDomain.includes('localhost');
      return isProduction 
        ? `Domain "${currentDomain}" not authorized. Add it to Firebase Console > Authentication > Settings > Authorized domains, then try again.`
        : 'Localhost not authorized. Add "localhost" to Firebase Console > Authentication > Settings > Authorized domains.';
    }
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/config-missing':
      return 'Firebase Authentication is not configured. Please check your environment variables.';
    case 'auth/admin-restricted-operation':
      return 'This operation is restricted by admin policy. Please contact support.';
    case 'auth/credential-already-in-use':
      return 'This Google account is already linked to another user.';
    case 'auth/requires-recent-login':
      return 'Please sign out and sign in again to perform this operation.';
    case 'auth/internal-error':
      return 'Google sign-in encountered an internal error. Please try again or use email/password login.';
    case 'auth/firebase-app-check-token-is-invalid':
      return 'App Check token validation failed. This is usually a configuration issue. Please refresh the page and try again, or contact support if the problem persists.';
    case 'auth/app-check-token-invalid':
      return 'Security token validation failed. Please refresh the page and try again.';
    case 'auth/unknown-error':
      return 'An unknown authentication error occurred. Please try again.';
    default:
      // Log unknown errors for debugging
      console.error('[Auth Error] Unknown error code:', errorCode);
      return `Authentication error: ${errorCode}. Please try email/password login or contact support.`;
  }
};
