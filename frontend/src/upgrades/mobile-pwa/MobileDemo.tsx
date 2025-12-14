import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Alert,
  Chip,
  Stack,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Smartphone,
  TouchApp,
  InstallMobile,
  CloudOff as Offline,
  SwipeDown,
  Vibration,
  CameraAlt,
  Navigation,
  Speed,
  CloudDone
} from '@mui/icons-material';
import PWAManager from './PWAManager';
import MobileNavigation from './MobileNavigation';
import { SwipeGesture, PullToRefresh, HapticButton } from './TouchGestures';

const MobileDemo: React.FC = () => {
  const [swipeCount, setSwipeCount] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastGesture, setLastGesture] = useState<string>('');

  const handleRefresh = async () => {
    setRefreshCount(prev => prev + 1);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const handleSwipe = (direction: string) => {
    setSwipeCount(prev => prev + 1);
    setLastGesture(`Swiped ${direction}`);
  };

  const handleTap = () => {
    setTapCount(prev => prev + 1);
    setLastGesture('Tapped');
  };

  const handleDoubleTap = () => {
    setLastGesture('Double Tapped');
  };

  const handleLongPress = () => {
    setLastGesture('Long Pressed');
  };

  return (
    <PWAManager 
      onInstallStatusChange={setIsInstallable}
      onOfflineStatusChange={setIsOffline}
    >
      <MobileNavigation 
        isInstallable={isInstallable}
        isOffline={isOffline}
        newPhotosCount={3}
      />
      
      <PullToRefresh onRefresh={handleRefresh}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Header */}
          <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1de9b6 0%, #00e676 100%)', color: 'black' }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Smartphone fontSize="large" />
              Enhanced Mobile Experience
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.8 }}>
              📱 PWA Features, Touch Gestures & Mobile Navigation
            </Typography>
          </Paper>

          {/* Pull to Refresh Info */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>📱 Pull down to refresh!</strong> This page supports pull-to-refresh gesture. 
              Refreshed {refreshCount} times.
            </Typography>
          </Alert>

          {/* PWA Features */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InstallMobile />
                    PWA Features
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Speed color="primary" />
                      <Typography variant="body2">Fast loading & caching</Typography>
                      <Chip label="Active" size="small" color="success" />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Offline color="primary" />
                      <Typography variant="body2">Offline support</Typography>
                      <Chip 
                        label={isOffline ? "Offline" : "Online"} 
                        size="small" 
                        color={isOffline ? "warning" : "success"} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CloudDone color="primary" />
                      <Typography variant="body2">App installation</Typography>
                      <Chip 
                        label={isInstallable ? "Available" : "Not Ready"} 
                        size="small" 
                        color={isInstallable ? "success" : "default"} 
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Navigation />
                    Mobile Navigation
                  </Typography>
                  <Stack spacing={2}>
                    <Typography variant="body2">• Bottom tab navigation (mobile only)</Typography>
                    <Typography variant="body2">• Swipeable drawer menu</Typography>
                    <Typography variant="body2">• Quick camera capture FAB</Typography>
                    <Typography variant="body2">• Context-aware navigation</Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="caption">
                        📱 Mobile navigation only appears on small screens. 
                        Try resizing your browser or use mobile device!
                      </Typography>
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Touch Gestures Demo */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TouchApp />
              Touch Gestures Demo
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <SwipeGesture
                  onSwipeLeft={() => handleSwipe('Left')}
                  onSwipeRight={() => handleSwipe('Right')}
                  onSwipeUp={() => handleSwipe('Up')}
                  onSwipeDown={() => handleSwipe('Down')}
                  onTap={handleTap}
                  onDoubleTap={handleDoubleTap}
                  onLongPress={handleLongPress}
                >
                  <Paper 
                    sx={{ 
                      p: 4, 
                      textAlign: 'center',
                      minHeight: 200,
                      background: 'linear-gradient(45deg, rgba(29, 233, 182, 0.1) 0%, rgba(0, 230, 118, 0.1) 100%)',
                      border: '2px dashed #1de9b6',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <TouchApp sx={{ fontSize: 48, color: '#1de9b6', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Touch Interaction Zone
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Try: Tap, Double-tap, Long press, Swipe in any direction
                    </Typography>
                    {lastGesture && (
                      <Chip 
                        label={`Last: ${lastGesture}`} 
                        color="success"
                        sx={{ animation: 'pulse 1s ease-in-out' }}
                      />
                    )}
                  </Paper>
                </SwipeGesture>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Gesture Stats
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Swipes:</Typography>
                        <Chip label={swipeCount} size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Taps:</Typography>
                        <Chip label={tapCount} size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Last Action:</Typography>
                        <Typography variant="body2" color="primary">
                          {lastGesture || 'None'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Haptic Feedback Demo */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Vibration />
              Haptic Feedback
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              Test different haptic feedback intensities (requires mobile device):
            </Typography>
            
            <Stack direction="row" spacing={2}>
              <HapticButton hapticType="light">
                <Button variant="outlined" size="small">
                  Light Vibration
                </Button>
              </HapticButton>
              
              <HapticButton hapticType="medium">
                <Button variant="outlined" size="small">
                  Medium Vibration
                </Button>
              </HapticButton>
              
              <HapticButton hapticType="heavy">
                <Button variant="outlined" size="small">
                  Heavy Vibration
                </Button>
              </HapticButton>
            </Stack>
          </Paper>

          {/* Mobile Features List */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📱 Mobile Enhancement Features
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Touch & Gestures:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><SwipeDown /></ListItemIcon>
                    <ListItemText primary="Swipe gestures (left, right, up, down)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><TouchApp /></ListItemIcon>
                    <ListItemText primary="Tap, double-tap, long press detection" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Vibration /></ListItemIcon>
                    <ListItemText primary="Haptic feedback with different intensities" />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>PWA Features:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><InstallMobile /></ListItemIcon>
                    <ListItemText primary="App installation prompt" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Offline /></ListItemIcon>
                    <ListItemText primary="Offline mode detection" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Speed /></ListItemIcon>
                    <ListItemText primary="Service worker caching" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>

          {/* Development Notes */}
          <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              🛠️ Development Notes
            </Typography>
            <Typography variant="body2" paragraph>
              These mobile enhancements are built as standalone components that can be integrated 
              into any part of your app. They provide native-like mobile experience with:
            </Typography>
            <Typography variant="body2" component="div">
              • <strong>PWA capabilities:</strong> App installation, offline support, service worker
              <br />
              • <strong>Touch gestures:</strong> Swipe, tap, pinch, pull-to-refresh
              <br />
              • <strong>Mobile navigation:</strong> Bottom tabs, drawer menu, quick actions
              <br />
              • <strong>Haptic feedback:</strong> Vibration patterns for better UX
              <br />
              • <strong>Responsive design:</strong> Mobile-first approach with touch-optimized UI
            </Typography>
          </Paper>
        </Container>
      </PullToRefresh>
    </PWAManager>
  );
};

export default MobileDemo;