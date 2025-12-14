import React from 'react';
import { FIREBASE_CONFIG } from '../config/env';

const FirebaseTest: React.FC = () => {
  console.log('Firebase Config:', FIREBASE_CONFIG);
  
  // Check if all required Firebase config values are present
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingKeys = requiredKeys.filter(key => !FIREBASE_CONFIG[key as keyof typeof FIREBASE_CONFIG]);
  
  if (missingKeys.length > 0) {
    throw new Error(`Missing Firebase config keys: ${missingKeys.join(', ')}`);
  }
  
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      fontFamily: 'monospace'
    }}>
      <h3>🔧 Firebase Configuration Test</h3>
      <p>Project ID: {FIREBASE_CONFIG.projectId || 'MISSING'}</p>
      <p>Auth Domain: {FIREBASE_CONFIG.authDomain || 'MISSING'}</p>
      <p>API Key: {FIREBASE_CONFIG.apiKey ? FIREBASE_CONFIG.apiKey.substring(0, 20) + '...' : 'MISSING'}</p>
      <p>Environment: {process.env.NODE_ENV}</p>
      {missingKeys.length === 0 ? (
        <p style={{ color: '#00ff88' }}>✅ All Firebase config keys present!</p>
      ) : (
        <p style={{ color: '#ff4444' }}>❌ Missing keys: {missingKeys.join(', ')}</p>
      )}
    </div>
  );
};

export default FirebaseTest;