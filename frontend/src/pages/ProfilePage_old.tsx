import React, { useEffect, useMemo, useState } from 'react';
import { 
  Container, Typography, Paper, Box, Grid, TextField, Button, Stack, Alert, 
  FormGroup, FormControlLabel, Checkbox, Chip, CircularProgress, Avatar,
  Card, CardContent, IconButton, Fab
} from '@mui/material';
import {
  Palette, Warning
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import EmergencySOS from '../components/EmergencySOS';
import AgeGroupThemePanel from '../components/AgeGroupThemePanel';
import { colors } from '../styles/techTheme';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { authAPI, bookingsAPI, gamificationAPI } from '../services/api';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  
  const [consent, setConsent] = useState({
    location_tracking_consent: false,
    data_sharing_consent: false,
    analytics_consent: false,
    marketing_consent: false,
  });
  
  const [savingConsent, setSavingConsent] = useState(false);
  const [fbSubject, setFbSubject] = useState('');
  const [fbMessage, setFbMessage] = useState('');
  const [reservations, setReservations] = useState<any[]>([]);
  const [gami, setGami] = useState<any>(null);
  const [hasGivenConsent, setHasGivenConsent] = useState(false);

  // Set up Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        // Load user profile from Firestore or API
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
            });
            setConsent({
              location_tracking_consent: userData.location_tracking_consent || false,
              data_sharing_consent: userData.data_sharing_consent || false,
              analytics_consent: userData.analytics_consent || false,
              marketing_consent: userData.marketing_consent || false,
            });
            setHasGivenConsent(userData.has_given_consent || false);
          } else {
            // Create user profile if it doesn't exist
            const newUserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              username: firebaseUser.email?.split('@')[0] || '',
              first_name: '',
              last_name: '',
              created_at: serverTimestamp(),
              location_tracking_consent: false,
              data_sharing_consent: false,
              analytics_consent: false,
              marketing_consent: false,
              has_given_consent: false,
            };
            await updateDoc(doc(db, 'users', firebaseUser.uid), newUserData);
            setUserProfile(newUserData);
            setForm({
              username: newUserData.username,
              email: firebaseUser.email || '',
              first_name: '',
              last_name: '',
            });
          }
          
          // Load reservations and gamification data
          loadUserData(firebaseUser.uid);
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

  const loadUserData = async (uid: string) => {
    try {
      // Try to load from API first, fallback to local data
      const [reservationsRes, gamiRes] = await Promise.allSettled([
        bookingsAPI.getReservations().catch(() => []),
        gamificationAPI.getProfile().catch(() => null),
      ]);
      
      setReservations(
        reservationsRes.status === 'fulfilled' ? 
        (Array.isArray(reservationsRes.value?.results) ? reservationsRes.value.results : 
         Array.isArray(reservationsRes.value) ? reservationsRes.value : []) : []
      );
      
      setGami(
        gamiRes.status === 'fulfilled' && gamiRes.value ? gamiRes.value : {
          points: { total: 0, level: 1, current_streak: 0 },
          badges: []
        }
      );
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setSuccess(null);
    setError(null);
    
    try {
      // Update in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const updateData = {
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
        updated_at: serverTimestamp(),
      };
      
      await updateDoc(userDocRef, updateData);
      
      // Try to update via API as well (if backend is available)
      try {
        await authAPI.updateProfile({
          username: form.username,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
        });
      } catch (apiError) {
        console.log('API update failed, using Firestore only:', apiError);
      }
      
      setUserProfile((prev: any) => ({ ...prev, ...updateData }));
      setSuccess('Profile updated successfully');
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
    
    setSavingConsent(true);
    setSuccess(null);
    setError(null);
    
    try {
      // Update in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const consentData = {
        ...consent,
        has_given_consent: Object.values(consent).some(v => v === true),
        consent_updated_at: serverTimestamp(),
      };
      
      await updateDoc(userDocRef, consentData);
      
      // Try to update via API as well
      try {
        await authAPI.updateProfile(consentData);
      } catch (apiError) {
        console.log('API consent update failed, using Firestore only:', apiError);
      }
      
      setHasGivenConsent(consentData.has_given_consent);
      setUserProfile((prev: any) => ({ ...prev, ...consentData }));
      setSuccess('Consent preferences saved successfully');
    } catch (error) {
      console.error('Consent update failed:', error);
      setError('Failed to save consent preferences. Please try again.');
    } finally {
      setSavingConsent(false);
    }
  };

  const metaChips = useMemo(() => {
    if (!user || !userProfile) return null;
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip label={`User: ${userProfile.username || user.displayName || 'Anonymous'}`} />
        <Chip label={`Email: ${user.email}`} />
        {userProfile.created_at && <Chip label={`Joined: ${new Date(userProfile.created_at.toDate()).toLocaleDateString()}`} />}
        {user.metadata?.lastSignInTime && <Chip label={`Last active: ${new Date(user.metadata.lastSignInTime).toLocaleString()}`} />}
      </Stack>
    );
  }, [user, userProfile]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ 
            background: 'linear-gradient(45deg, #2196f3, #9c27b0)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            👤 Profile Dashboard
          </Typography>
          <Stack direction="row" spacing={2}>
            <IconButton
              onClick={() => setThemeDialogOpen(true)}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Palette />
            </IconButton>
          </Stack>
        </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

        {/* Header with Avatar and basic info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card sx={{ 
            mb: 3, 
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(156, 39, 176, 0.1))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar 
                  src={user?.photoURL || undefined}
                  sx={{ width: 64, height: 64, bgcolor: colors.neonCyan }}
                >
                  {!user?.photoURL && (user?.displayName?.[0] || userProfile?.username?.[0] || user?.email?.[0] || 'U')}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ lineHeight: 1 }}>
                    {user?.displayName || userProfile?.first_name + ' ' + userProfile?.last_name || userProfile?.username || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || 'No email provided'}
                  </Typography>
                </Box>
        </Box>
        <Typography variant="h6" gutterBottom>
          Account Details
        </Typography>

        {!user && loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSave}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
              {metaChips}
            </Stack>
          </Box>
        )}
            </CardContent>
          </Card>
        </motion.div>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Privacy & Consent
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox name="location_tracking_consent" checked={consent.location_tracking_consent} onChange={handleConsentChange} />}
            label="Allow location tracking"
          />
          <FormControlLabel
            control={<Checkbox name="data_sharing_consent" checked={consent.data_sharing_consent} onChange={handleConsentChange} />}
            label="Allow data sharing for research"
          />
          <FormControlLabel
            control={<Checkbox name="analytics_consent" checked={consent.analytics_consent} onChange={handleConsentChange} />}
            label="Allow analytics personalization"
          />
          <FormControlLabel
            control={<Checkbox name="marketing_consent" checked={consent.marketing_consent} onChange={handleConsentChange} />}
            label="Allow marketing communication"
          />
        </FormGroup>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleSaveConsent} disabled={savingConsent}>
            {savingConsent ? 'Saving…' : 'Save Preferences'}
          </Button>
          {hasGivenConsent && <Chip label="Basic Consent: Given" color="success" />}
        </Stack>
      </Paper>

      {/* Change Password */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        <ChangePasswordForm />
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Linked Accounts
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Connect external accounts for easier login and data sync.
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Chip label="Google: Demo Account" color="success" />
          <Chip label="Facebook: Not connected" color="default" />
          <Button 
            variant="outlined" 
            onClick={() => setSuccess('Account linking is available in the full version!')}
            disabled
          >
            Manage Connections
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Reservations
        </Typography>
        {!reservations.length && (
          <Typography variant="body2" color="text.secondary">No reservations yet.</Typography>
        )}
        <Stack spacing={1}>
          {reservations.map((r) => (
            <Stack key={r.id} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
              <Typography variant="body2">
                [{(r.type || '').toUpperCase()}] {r.name} • {r.date ? new Date(r.date).toLocaleString() : ''}
              </Typography>
              {/* Future: add cancel/manage buttons */}
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Gamification
        </Typography>
        {!gami && (
          <Typography variant="body2" color="text.secondary">No gamification data yet.</Typography>
        )}
        {gami && (
          <>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Chip label={`Level ${gami.points?.level ?? 1}`} />
              <Chip label={`${gami.points?.total ?? 0} pts`} />
              <Chip label={`Streak: ${gami.points?.current_streak ?? 0} days`} color="success" />
            </Stack>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Badges</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {(gami.badges || []).map((b: any, i: number) => (
                <Chip key={i} label={`${b.icon || '🏅'} ${b.name}`} sx={{ mb: 1 }} />
              ))}
            </Stack>
          </>
        )}
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Safety & Emergency
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Use the red emergency button at the bottom-right anytime. Or click below to open the same emergency dialog.
        </Typography>
        <Box>
          <EmergencySOS mode="inline" />
        </Box>
      </Paper>

      {/* Feedback Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Feedback
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Tell Team SkyStack what you think. Share bugs, ideas, or general comments.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Subject" fullWidth value={fbSubject} onChange={(e) => setFbSubject(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Message" fullWidth multiline minRows={4} value={fbMessage} onChange={(e) => setFbMessage(e.target.value)} />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={async () => {
            if (!fbSubject || !fbMessage) {
              setError('Please fill in both subject and message');
              return;
            }
            
            if (!user) {
              setError('Please log in to send feedback');
              return;
            }
            
            setSaving(true);
            try {
              // Save feedback to Firestore
              await addDoc(collection(db, 'feedback'), {
                subject: fbSubject,
                message: fbMessage,
                user_email: user.email,
                user_id: user.uid,
                user_name: user.displayName || userProfile?.username || 'Anonymous',
                created_at: serverTimestamp(),
                status: 'new'
              });
              
              setSuccess('Feedback sent successfully! Thank you.');
              setFbSubject('');
              setFbMessage('');
            } catch (error) {
              console.error('Feedback submission failed:', error);
              
              // Fallback to mailto
              const to = 'mailto:team@skystack.dev';
              const subject = encodeURIComponent(fbSubject);
              const from = user.email || 'unknown@user.com';
              const body = encodeURIComponent(`${fbMessage}\n\nFrom: ${from}\nUser ID: ${user.uid}`);
              window.location.href = `${to}?subject=${subject}&body=${body}`;
              
              setSuccess('Feedback prepared! Your email client should open.');
              setFbSubject('');
              setFbMessage('');
            } finally {
              setSaving(false);
            }
          }}>
            Send Feedback
          </Button>
          <Button variant="text" onClick={() => {
            setFbSubject('');
            setFbMessage('');
          }}>Clear</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Download My Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Export a JSON bundle of your profile, trips, reservations, and gamification.
        </Typography>
        <Button variant="outlined" onClick={async () => {
          if (!user) {
            setError('Please log in to download your data');
            return;
          }
          
          setSaving(true);
          try {
            // Collect all user data
            const [tripsData] = await Promise.allSettled([
              import('../services/api').then(({ tripsAPI }) => tripsAPI.getTrips()).catch(() => [])
            ]);
            
            const bundle = {
              profile: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
                ...userProfile
              },
              trips: tripsData.status === 'fulfilled' ? tripsData.value : [],
              reservations: reservations,
              gamification: gami,
              consent: consent,
              exported_at: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `travelogy-data-${user.uid}-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            setSuccess('Your data has been exported successfully!');
          } catch (error) {
            console.error('Data export failed:', error);
            setError('Failed to export data. Please try again.');
          } finally {
            setSaving(false);
          }
        }}>Download JSON</Button>
      </Paper>
      
      {/* Theme Settings Dialog */}
      <AgeGroupThemePanel 
        open={themeDialogOpen}
        onClose={() => setThemeDialogOpen(false)}
      />
      
      {/* Emergency Floating Action Button */}
      <Fab
        color="error"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          '&:hover': {
            transform: 'scale(1.1)',
          },
          transition: 'all 0.2s ease'
        }}
        onClick={() => {
          // Trigger emergency SOS
          document.dispatchEvent(new CustomEvent('emergency-activate'));
        }}
      >
        <Warning />
      </Fab>
      </motion.div>
    </Container>
  );
};

const ChangePasswordForm: React.FC = () => {
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newPwd2, setNewPwd2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async () => {
    setError(null); setSuccess(null); setLoading(true);
    
    // Basic validation
    if (newPwd !== newPwd2) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }
    
    if (newPwd.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setSuccess('Password changed successfully (demo mode)');
      setOldPwd(''); setNewPwd(''); setNewPwd2('');
      setLoading(false);
    }, 1000);
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField label="Current Password" type="password" fullWidth value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField label="New Password" type="password" fullWidth value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField label="Confirm New Password" type="password" fullWidth value={newPwd2} onChange={(e) => setNewPwd2(e.target.value)} />
        </Grid>
      </Grid>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" onClick={submit} disabled={loading || !oldPwd || !newPwd || !newPwd2}>
          {loading ? 'Updating…' : 'Update Password'}
        </Button>
      </Stack>
    </Box>
  );
};

export default ProfilePage;
