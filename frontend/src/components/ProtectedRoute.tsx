import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import type { Auth } from 'firebase/auth';
import TechLoader from './TechLoader';
import { colors } from '../styles/techTheme';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRouteWithAuth: React.FC<ProtectedRouteProps> = ({ children }) => {
  const authInstance = auth as Auth; // guaranteed by parent
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

  if (error || !user) {
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Authentication error:', error);
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const authInstance = auth as Auth | null;
  if (!authInstance) {
    return <Navigate to="/login" replace />;
  }
  return <ProtectedRouteWithAuth>{children}</ProtectedRouteWithAuth>;
};

export default ProtectedRoute;
