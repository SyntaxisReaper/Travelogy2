import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Box, Grid, TextField, Alert, 
  FormGroup, FormControlLabel, Checkbox, Chip, CircularProgress, Avatar,
  Skeleton, Divider
} from '@mui/material';
import {
  Person, Email, Badge, LocationOn, Settings, Security, 
  TravelExplore, PhotoCamera, EmojiEvents, Timeline,
  Edit, Save
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { travelColors } from '../styles/travelTheme';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { authAPI, gamificationAPI } from '../services/api';
import TravelText from '../components/TravelText';
import TravelCard from '../components/TravelCard';
import AdventureButton from '../components/AdventureButton';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    location: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [consent, setConsent] = useState({
    location_tracking_consent: false,
    data_sharing_consent: false,
    analytics_consent: false,
    marketing_consent: false,
  });
  
  const [gamification, setGamification] = useState<any>(null);

  // Set up Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile(userData);
            setForm({
              username: userData.username || '',
              email: firebaseUser.email || '',
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              bio: userData.bio || '',
              location: userData.location || '',
            });
            setConsent({
              location_tracking_consent: userData.location_tracking_consent || false,
              data_sharing_consent: userData.data_sharing_consent || false,
              analytics_consent: userData.analytics_consent || false,
              marketing_consent: userData.marketing_consent || false,
            });
          }
          
          // Load gamification data
          try {
            const gamiRes = await gamificationAPI.getProfile();
            setGamification(gamiRes || {
              points: { total: 0, level: 1, current_streak: 0 },
              badges: []
            });
          } catch {
            setGamification({
              points: { total: 0, level: 1, current_streak: 0 },
              badges: []
            });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setError('Failed to load user data');
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setSuccess(null);
    setError(null);
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updateData = {
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
        bio: form.bio,
        location: form.location,
        updated_at: serverTimestamp(),
      };
      
      await updateDoc(userDocRef, updateData);
      setUserProfile((prev: any) => ({ ...prev, ...updateData }));
      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setConsent((c) => ({ ...c, [name]: checked }));
  };

  const handleSaveConsent = async () => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...consent,
        has_given_consent: true,
        consent_updated_at: serverTimestamp(),
      });
      setSuccess('Privacy preferences updated successfully');
    } catch (error) {
      setError('Failed to update privacy preferences');
    }
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 100%)`,
        py: 4
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {[1, 2, 3].map(i => (
              <Grid item xs={12} md={6} key={i}>
                <Skeleton 
                  variant="rectangular" 
                  height={300} 
                  sx={{ borderRadius: 2, bgcolor: `${travelColors.primary.ocean}10` }} 
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.sky}08 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          right: '8%',
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, ${travelColors.primary.coral}08 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '250px',
          height: '250px',
          background: `radial-gradient(circle, ${travelColors.primary.forest}06 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Person sx={{ fontSize: 40, color: travelColors.primary.ocean, mr: 2 }} />
              <TravelText
                text="Travel Profile"
                textVariant="adventure"
                animated
                variant="h3"
              />
            </Box>
            <AdventureButton
              buttonVariant={editing ? "forest" : "ocean"}
              startIcon={editing ? <Save /> : <Edit />}
              onClick={editing ? handleSave : () => setEditing(true)}
              disabled={saving}
              adventure={!editing}
            >
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
            </AdventureButton>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, backgroundColor: `${travelColors.primary.coral}15` }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, backgroundColor: `${travelColors.primary.forest}15` }}>
              {success}
            </Alert>
          )}
          
          {editing && (
            <Alert severity="info" sx={{ mb: 3, backgroundColor: `${travelColors.primary.ocean}15` }}>
              📝 Edit mode is active - you can now modify your profile information
            </Alert>
          )}

          <Grid container spacing={4}>
            {/* Profile Information */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <TravelCard cardVariant="ocean" cardElevation="medium" borderAccent>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Badge sx={{ fontSize: 28, color: travelColors.primary.ocean, mr: 2 }} />
                      <TravelText
                        text="Personal Information"
                        textVariant="gradient"
                        variant="h6"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar 
                        src={user?.photoURL || undefined}
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          mr: 3,
                          bgcolor: travelColors.primary.ocean,
                          fontSize: '2rem'
                        }}
                      >
                        {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ color: travelColors.text.primary, fontWeight: 'bold' }}>
                          {form.first_name || form.last_name 
                            ? `${form.first_name} ${form.last_name}`.trim()
                            : user?.displayName || 'Traveler'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: travelColors.text.secondary }}>
                          @{form.username || user?.email?.split('@')[0]}
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="first_name"
                          value={form.first_name}
                          onChange={handleChange}
                          disabled={!editing}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              backgroundColor: editing ? travelColors.backgrounds.paper : 'transparent',
                              '&.Mui-disabled': {
                                opacity: 0.7,
                                '& .MuiOutlinedInput-input': {
                                  color: travelColors.text.secondary,
                                  WebkitTextFillColor: travelColors.text.secondary
                                }
                              }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': {
                              color: travelColors.text.secondary
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="last_name"
                          value={form.last_name}
                          onChange={handleChange}
                          disabled={!editing}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              backgroundColor: editing ? travelColors.backgrounds.paper : 'transparent',
                              '&.Mui-disabled': {
                                opacity: 0.7,
                                '& .MuiOutlinedInput-input': {
                                  color: travelColors.text.secondary,
                                  WebkitTextFillColor: travelColors.text.secondary
                                }
                              }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': {
                              color: travelColors.text.secondary
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Username"
                          name="username"
                          value={form.username}
                          onChange={handleChange}
                          disabled={!editing}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              backgroundColor: editing ? travelColors.backgrounds.paper : 'transparent',
                              '&.Mui-disabled': {
                                opacity: 0.7,
                                '& .MuiOutlinedInput-input': {
                                  color: travelColors.text.secondary,
                                  WebkitTextFillColor: travelColors.text.secondary
                                }
                              }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': {
                              color: travelColors.text.secondary
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Location"
                          name="location"
                          value={form.location}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Where are you based?"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              backgroundColor: editing ? travelColors.backgrounds.paper : 'transparent',
                              '&.Mui-disabled': {
                                opacity: 0.7,
                                '& .MuiOutlinedInput-input': {
                                  color: travelColors.text.secondary,
                                  WebkitTextFillColor: travelColors.text.secondary
                                }
                              }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': {
                              color: travelColors.text.secondary
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Travel Bio"
                          name="bio"
                          value={form.bio}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Tell us about your travel adventures..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              backgroundColor: editing ? travelColors.backgrounds.paper : 'transparent',
                              '&.Mui-disabled': {
                                opacity: 0.7,
                                '& .MuiOutlinedInput-input': {
                                  color: travelColors.text.secondary,
                                  WebkitTextFillColor: travelColors.text.secondary
                                }
                              }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': {
                              color: travelColors.text.secondary
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </TravelCard>
              </motion.div>
            </Grid>

            {/* Travel Stats */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <TravelCard cardVariant="sunset" cardElevation="medium" borderAccent>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <EmojiEvents sx={{ fontSize: 28, color: travelColors.primary.sunset, mr: 2 }} />
                      <TravelText
                        text="Adventure Statistics"
                        textVariant="gradient"
                        variant="h6"
                      />
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" sx={{ color: travelColors.primary.sunset, fontWeight: 'bold' }}>
                            {gamification?.points?.level || 1}
                          </Typography>
                          <Typography variant="body2" sx={{ color: travelColors.text.secondary }}>
                            Adventure Level
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" sx={{ color: travelColors.primary.coral, fontWeight: 'bold' }}>
                            {gamification?.points?.total || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: travelColors.text.secondary }}>
                            Total Points
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" sx={{ color: travelColors.primary.forest, fontWeight: 'bold' }}>
                            {gamification?.badges?.length || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: travelColors.text.secondary }}>
                            Badges Earned
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" sx={{ color: travelColors.primary.ocean, fontWeight: 'bold' }}>
                            {gamification?.points?.current_streak || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: travelColors.text.secondary }}>
                            Current Streak
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {gamification?.badges && gamification.badges.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: travelColors.text.primary }}>
                          Recent Achievements
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {gamification.badges.slice(0, 6).map((badge: any, index: number) => (
                            <Chip
                              key={index}
                              label={badge.name}
                              icon={<span>{badge.icon}</span>}
                              sx={{
                                bgcolor: `${travelColors.primary.coral}20`,
                                color: travelColors.primary.coral,
                                fontWeight: 'bold'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </TravelCard>
              </motion.div>
            </Grid>

            {/* Privacy Settings */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <TravelCard cardVariant="forest" cardElevation="medium" borderAccent>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Security sx={{ fontSize: 28, color: travelColors.primary.forest, mr: 2 }} />
                        <TravelText
                          text="Privacy & Consent Settings"
                          textVariant="gradient"
                          variant="h6"
                        />
                      </Box>
                      <AdventureButton
                        buttonVariant="forest"
                        size="small"
                        onClick={handleSaveConsent}
                      >
                        Save Preferences
                      </AdventureButton>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="location_tracking_consent"
                              checked={consent.location_tracking_consent}
                              onChange={handleConsentChange}
                              sx={{ color: travelColors.primary.forest }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Location Tracking
                              </Typography>
                              <Typography variant="caption" sx={{ color: travelColors.text.secondary }}>
                                Allow location tracking for better travel recommendations
                              </Typography>
                            </Box>
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="analytics_consent"
                              checked={consent.analytics_consent}
                              onChange={handleConsentChange}
                              sx={{ color: travelColors.primary.forest }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Analytics & Insights
                              </Typography>
                              <Typography variant="caption" sx={{ color: travelColors.text.secondary }}>
                                Help us improve your travel experience
                              </Typography>
                            </Box>
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="data_sharing_consent"
                              checked={consent.data_sharing_consent}
                              onChange={handleConsentChange}
                              sx={{ color: travelColors.primary.forest }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Data Sharing
                              </Typography>
                              <Typography variant="caption" sx={{ color: travelColors.text.secondary }}>
                                Share anonymized data to improve travel services
                              </Typography>
                            </Box>
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="marketing_consent"
                              checked={consent.marketing_consent}
                              onChange={handleConsentChange}
                              sx={{ color: travelColors.primary.forest }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Marketing Communications
                              </Typography>
                              <Typography variant="caption" sx={{ color: travelColors.text.secondary }}>
                                Receive personalized travel offers and updates
                              </Typography>
                            </Box>
                          }
                        />
                      </Grid>
                    </Grid>
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

export default ProfilePage;