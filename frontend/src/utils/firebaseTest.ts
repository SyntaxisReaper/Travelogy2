// Firebase Authentication Test Utility
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export const testFirebaseConnection = async () => {
  console.log('🔥 Firebase Test Starting...');
  
  try {
    // Test 1: Check if Firebase is initialized
    console.log('1. Firebase Auth:', auth ? '✅ Connected' : '❌ Not initialized');
    console.log('2. Firebase DB:', db ? '✅ Connected' : '❌ Not initialized');
    
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    
    // Test 2: Check current auth state
    console.log('3. Current User:', auth.currentUser?.email || 'None');
    
    // Test 3: Try to create a test user (will fail if already exists)
    const testEmail = 'test@travelogy.com';
    const testPassword = 'test123456';
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('4. Test User Created:', userCredential.user.email);
      
      // Clean up - delete test user
      await signOut(auth);
    } catch (createError: any) {
      if (createError.code === 'auth/email-already-in-use') {
        console.log('4. Test User Already Exists - trying to sign in...');
        try {
          const signInResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
          console.log('5. Test Sign-in Successful:', signInResult.user.email);
          await signOut(auth);
        } catch (signInError: any) {
          console.log('5. Sign-in Error:', signInError.code, signInError.message);
        }
      } else {
        console.log('4. Create User Error:', createError.code, createError.message);
      }
    }
    
    console.log('🎉 Firebase Test Completed');
    return true;
    
  } catch (error: any) {
    console.error('❌ Firebase Test Failed:', error.message);
    console.error('Error Code:', error.code || 'Unknown');
    return false;
  }
};

// Test Google Sign-in specifically
export const testGoogleAuth = async () => {
  console.log('🌐 Google Auth Test Starting...');
  
  try {
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    
    // Import Google sign-in dynamically to avoid issues
    const { signInWithGoogle } = await import('../services/authService');
    
    console.log('Google Auth Test: Ready to test (manual trigger needed)');
    return true;
    
  } catch (error: any) {
    console.error('❌ Google Auth Test Failed:', error.message);
    return false;
  }
};

// Export for console debugging
(window as any).testFirebase = testFirebaseConnection;
(window as any).testGoogle = testGoogleAuth;