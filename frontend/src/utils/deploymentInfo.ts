// Deployment Information Utility
export const getDeploymentInfo = () => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'unknown';
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const isVercel = hostname.includes('vercel.app');
  const isNetlify = hostname.includes('netlify.app');
  const isProduction = !isLocalhost;

  return {
    hostname,
    origin,
    isLocalhost,
    isVercel,
    isNetlify,
    isProduction,
    platform: isVercel ? 'Vercel' : isNetlify ? 'Netlify' : isLocalhost ? 'Local' : 'Unknown'
  };
};

export const logDeploymentInfo = () => {
  const info = getDeploymentInfo();
  console.log('🌐 Deployment Info:', {
    'Platform': info.platform,
    'Hostname': info.hostname,
    'Origin': info.origin,
    'Is Production': info.isProduction,
    'Firebase Domain Authorization Required': info.isProduction
  });
  
  if (info.isProduction) {
    console.log(`🔥 To fix Google sign-in, add "${info.hostname}" to Firebase Console:`);
    console.log('1. Go to https://console.firebase.google.com/project/travelogy-c645554/authentication/settings');
    console.log('2. Click "Authentication" → "Settings" → "Authorized domains"');
    console.log(`3. Add "${info.hostname}" to the list`);
    console.log('4. Save and try Google sign-in again');
  }
  
  return info;
};

// Auto-log deployment info
if (typeof window !== 'undefined') {
  logDeploymentInfo();
}