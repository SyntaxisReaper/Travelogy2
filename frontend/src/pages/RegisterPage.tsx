import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Alert,
  CircularProgress,
  Link,
  Divider,
  FormControlLabel,
  Checkbox,
  Grid
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { signUpWithEmail, getAuthErrorMessage, signInWithGoogle } from '../services/authService';
import { auth } from '../services/firebase';
import type { Auth as FirebaseAuth } from 'firebase/auth';
import { motion } from 'framer-motion';
import { travelColors } from '../styles/travelTheme';
import TravelCard from '../components/TravelCard';
import AdventureButton from '../components/AdventureButton';
import TravelText from '../components/TravelText';
import { 
  PersonAdd, 
  Explore, 
  FlightTakeoff, 
  PhotoCamera, 
  TravelExplore,
  AccountCircle,
  Email,
  Lock,
  Person,
  Google
} from '@mui/icons-material';
import { extractErrorCode } from '../utils/error';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const navigate = useNavigate();

  // If Firebase auth isn't available, skip auto-redirect logic and just render the page.

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.displayName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (!acceptTerms || !acceptPrivacy) {
      setError('Please accept the terms of service and privacy policy');
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      await signUpWithEmail(formData.email, formData.password, formData.displayName);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(getAuthErrorMessage(extractErrorCode(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!(auth as FirebaseAuth | null)) { setError('Social login unavailable. Please use email/password.'); return; }
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(getAuthErrorMessage(extractErrorCode(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.sunset}15 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${travelColors.primary.coral}20 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '8%',
          width: '150px',
          height: '150px',
          background: `radial-gradient(circle, ${travelColors.primary.ocean}15 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Grid container spacing={4} alignItems="center" sx={{ minHeight: '100vh' }}>
            {/* Left side - Welcome content */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 4, md: 0 } }}>
                  <TravelText
                    text="Begin Your Adventure!"
                    textVariant="adventure"
                    animated
                    variant="h2"
                    sx={{ mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' } }}
                  />
                  
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: travelColors.text.secondary,
                      mb: 4,
                      fontStyle: 'italic',
                      lineHeight: 1.6
                    }}
                  >
                    Join thousands of travelers sharing their stories and discovering new adventures
                  </Typography>
                  
                  {/* Features showcase */}
                  <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <PhotoCamera sx={{ fontSize: 40, color: travelColors.primary.sunset, mb: 1 }} />
                        <Typography variant="body2" sx={{ color: travelColors.text.primary }}>
                          Capture Memories
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Explore sx={{ fontSize: 40, color: travelColors.primary.ocean, mb: 1 }} />
                        <Typography variant="body2" sx={{ color: travelColors.text.primary }}>
                          Discover Places
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <FlightTakeoff sx={{ fontSize: 40, color: travelColors.primary.forest, mb: 1 }} />
                        <Typography variant="body2" sx={{ color: travelColors.text.primary }}>
                          Plan Trips
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <TravelExplore sx={{ fontSize: 40, color: travelColors.primary.coral, mb: 1 }} />
                        <Typography variant="body2" sx={{ color: travelColors.text.primary }}>
                          Share Stories
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </motion.div>
            </Grid>
            
            {/* Right side - Registration form */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <TravelCard
                  cardVariant="ocean"
                  cardElevation="high"
                  borderAccent
                  sx={{ p: 4 }}
                >
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <PersonAdd sx={{ fontSize: 50, color: travelColors.primary.ocean, mb: 1 }} />
                    <TravelText
                      text="Create Your Travel Profile"
                      textVariant="gradient"
                      animated
                      variant="h5"
                    />
                  </Box>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 3,
                          bgcolor: `${travelColors.primary.coral}10`,
                          border: `1px solid ${travelColors.primary.coral}50`,
                          '& .MuiAlert-icon': { color: travelColors.primary.coral }
                        }}
                      >
                        {error}
                      </Alert>
                    </motion.div>
                  )}

                  <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="displayName"
                      label="Full Name"
                      name="displayName"
                      autoComplete="name"
                      autoFocus
                      value={formData.displayName}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: (
                          <Person sx={{ color: travelColors.primary.ocean, mr: 1 }} />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: travelColors.primary.ocean,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: travelColors.primary.ocean,
                            borderWidth: '2px',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: travelColors.primary.ocean,
                        },
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: (
                          <Email sx={{ color: travelColors.primary.ocean, mr: 1 }} />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: travelColors.primary.ocean,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: travelColors.primary.ocean,
                            borderWidth: '2px',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: travelColors.primary.ocean,
                        },
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: (
                          <Lock sx={{ color: travelColors.primary.ocean, mr: 1 }} />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: travelColors.primary.ocean,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: travelColors.primary.ocean,
                            borderWidth: '2px',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: travelColors.primary.ocean,
                        },
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: (
                          <Lock sx={{ color: travelColors.primary.ocean, mr: 1 }} />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: travelColors.primary.ocean,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: travelColors.primary.ocean,
                            borderWidth: '2px',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: travelColors.primary.ocean,
                        },
                      }}
                    />

                    <Box sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            sx={{
                              color: travelColors.primary.ocean,
                              '&.Mui-checked': {
                                color: travelColors.primary.ocean,
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ color: travelColors.text.primary }}>
                            I accept the{' '}
                            <Link
                              href="#"
                              sx={{
                                color: travelColors.primary.coral,
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                '&:hover': {
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              Terms of Service
                            </Link>
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={acceptPrivacy}
                            onChange={(e) => setAcceptPrivacy(e.target.checked)}
                            sx={{
                              color: travelColors.primary.ocean,
                              '&.Mui-checked': {
                                color: travelColors.primary.ocean,
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ color: travelColors.text.primary }}>
                            I accept the{' '}
                            <Link
                              href="#"
                              sx={{
                                color: travelColors.primary.coral,
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                '&:hover': {
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              Privacy Policy
                            </Link>
                          </Typography>
                        }
                      />
                    </Box>

                    <AdventureButton
                      type="submit"
                      fullWidth
                      buttonVariant="ocean"
                      disabled={isLoading}
                      sx={{ mt: 3, mb: 2, py: 1.5 }}
                    >
                      {isLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={20} color="inherit" />
                          Creating your travel profile...
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FlightTakeoff sx={{ fontSize: 20 }} />
                          Start Your Adventure
                        </Box>
                      )}
                    </AdventureButton>

                    <Divider sx={{ my: 3 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: travelColors.text.secondary,
                          fontStyle: 'italic'
                        }}
                      >
                        Or continue with
                      </Typography>
                    </Divider>

                    <AdventureButton
                      fullWidth
                      buttonVariant="coral"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      startIcon={<Google />}
                      sx={{ mb: 3 }}
                    >
                      Continue with Google
                    </AdventureButton>

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ color: travelColors.text.secondary }}
                      >
                        Already exploring with us?{' '}
                        <Link
                          component={RouterLink}
                          to="/login"
                          sx={{
                            color: travelColors.primary.ocean,
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            '&:hover': {
                              textDecoration: 'underline',
                              color: travelColors.primary.sunset,
                            },
                          }}
                        >
                          Sign in to continue your journey
                        </Link>
                      </Typography>
                    </Box>
                  </Box>
                </TravelCard>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default RegisterPage;
