import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { Auth } from 'firebase/auth';
import TechLoader from './TechLoader';
import { colors } from '../styles/techTheme';

interface AuthCheckerProps {
  authInstance: Auth;
  children: React.ReactNode;
}

const AuthChecker: React.FC<AuthCheckerProps> = ({ authInstance, children }) => {
  const [user, loading, error] = useAuthState(authInstance);

  if (loading) {
    return (
      <TechLoader
        type="neural"
        size="large"
        text="Verifying Neural Access..."
        color={colors.neonCyan}
        fullscreen
      />
    );
  }

  if (error) {
    console.error('Authentication error:', error);
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthChecker;