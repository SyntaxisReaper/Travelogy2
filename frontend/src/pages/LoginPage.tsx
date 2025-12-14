import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Alert,
  CircularProgress,
  Link,
  Divider
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { signInWithEmail, resetPassword, getAuthErrorMessage, signInWithGoogle } from '../services/authService';
import { motion } from 'framer-motion';
import { travelColors } from '../styles/travelTheme';
import TravelCard from '../components/TravelCard';
import AdventureButton from '../components/AdventureButton';
import TravelText from '../components/TravelText';
import { Luggage } from '@mui/icons-material';
import { extractErrorCode } from '../utils/error';
import { auth } from '../services/firebase';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();

  // If Firebase auth isn't available, skip auto-redirect logic and just render the page.

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signInWithEmail(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const code = extractErrorCode(err);
      setError(getAuthErrorMessage(code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      await resetPassword(email);
      setResetEmailSent(true);
      setError('');
    } catch (err: unknown) {
      setError(getAuthErrorMessage(extractErrorCode(err)));
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) { 
      setError('Google sign-in is not available. Please use email/password login.'); 
      return; 
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Starting Google sign-in...');
      const user = await signInWithGoogle();
      console.log('Google sign-in successful:', user?.email);
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      const code = extractErrorCode(err);
      const errorMessage = getAuthErrorMessage(code);
      console.error('Error code:', code, 'Message:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.sky}20 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: `radial-gradient(circle, ${travelColors.primary.sunset}15 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          left: '10%',
          width: '120px',
          height: '120px',
          background: `radial-gradient(circle, ${travelColors.primary.ocean}10 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <TravelCard
            cardVariant="ocean"
            cardElevation="high"
            borderAccent
            sx={{ p: 4, mb: 4 }}
          >
            <Box textAlign="center" sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Luggage sx={{ fontSize: 40, color: travelColors.primary.ocean, mr: 1 }} />
                <TravelText
                  text="Welcome Back, Traveler!"
                  textVariant="adventure"
                  animated
                  variant="h4"
                />
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4, 
                  color: travelColors.text.secondary,
                  fontStyle: 'italic' 
                }}
              >
                Continue your journey and explore new adventures
              </Typography>
              
              {/* Production deployment notice */}
              {typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  📱 <strong>Demo Mode:</strong> Google sign-in requires domain authorization.<br/>
                  <strong>Demo Account:</strong> demo@travelogy.com / demo123<br/>
                  Or contact admin to add this domain to Firebase.
                </Alert>
              )}

              <Box component="form" onSubmit={handleLogin} sx={{ textAlign: 'left' }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: travelColors.backgrounds.paper,
                      '& fieldset': {
                        borderColor: travelColors.primary.ocean + '40',
                      },
                      '&:hover fieldset': {
                        borderColor: travelColors.primary.ocean + '80',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: travelColors.primary.ocean,
                        boxShadow: travelColors.shadows.soft,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: travelColors.primary.ocean,
                    },
                    '& .MuiOutlinedInput-input': {
                      color: travelColors.text.primary,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: travelColors.backgrounds.paper,
                      '& fieldset': {
                        borderColor: travelColors.primary.ocean + '40',
                      },
                      '&:hover fieldset': {
                        borderColor: travelColors.primary.ocean + '80',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: travelColors.primary.ocean,
                        boxShadow: travelColors.shadows.soft,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: travelColors.primary.ocean,
                    },
                    '& .MuiOutlinedInput-input': {
                      color: travelColors.text.primary,
                    },
                  }}
                />

                {error && (
                  <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {resetEmailSent && (
                  <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                    Password reset email sent! Check your inbox.
                  </Alert>
                )}

                <Box sx={{ mt: 3, mb: 2 }}>
                  <AdventureButton
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                    buttonVariant="ocean"
                    adventure={!isLoading}
                    size="large"
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1, color: travelColors.text.white }} />
                        Preparing your adventure...
                      </>
                    ) : (
                      '🧳 Continue Journey'
                    )}
                  </AdventureButton>
                </Box>

                <Divider sx={{ my: 3, borderColor: travelColors.primary.ocean + '30' }} />

                {/* Social Login Buttons */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    textAlign: 'center', 
                    mb: 2, 
                    color: travelColors.text.secondary,
                    fontStyle: 'italic' 
                  }}
                >
                  Or continue your journey with
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                  <AdventureButton
                    fullWidth
                    disabled={isLoading || !auth}
                    buttonVariant="coral"
                    size="medium"
                    onClick={handleGoogleSignIn}
                  >
                    🌍 Google Travel
                  </AdventureButton>
                </Box>

                <Divider sx={{ my: 2, borderColor: travelColors.primary.ocean + '30' }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    component="button"
                    type="button"
                    onClick={handleForgotPassword}
                    sx={{
                      color: travelColors.primary.sunset,
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        color: travelColors.primary.coral,
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    🗺️ Forgot Password?
                  </Link>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 1, 
                      color: travelColors.text.secondary 
                    }}
                  >
                    Ready to start your first adventure?
                  </Typography>
                  <Link
                    component={RouterLink}
                    to="/register"
                    sx={{
                      color: travelColors.primary.forest,
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      '&:hover': {
                        color: travelColors.primary.ocean,
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    🌟 Join Fellow Travelers
                  </Link>
                </Box>
              </Box>
            </Box>
          </TravelCard>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;
