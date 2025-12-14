import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
  LinearProgress,
  Chip,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import {
  InstallMobile,
  CloudOff as Offline,
  CloudDone,
  Update,
  GetApp,
  Smartphone,
  Speed,
  Storage
} from '@mui/icons-material';

interface PWAManagerProps {
  children: React.ReactNode;
  onInstallStatusChange?: (isInstallable: boolean) => void;
  onOfflineStatusChange?: (isOffline: boolean) => void;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAManager: React.FC<PWAManagerProps> = ({
  children,
  onInstallStatusChange,
  onOfflineStatusChange
}) => {
  // PWA States
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showUpdateAvailable, setShowUpdateAvailable] = useState(false);
  const [installResult, setInstallResult] = useState<string | null>(null);

  // Service Worker States
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [cachingProgress, setCachingProgress] = useState(0);
  const [showCachingProgress, setShowCachingProgress] = useState(false);

  // Check if app is already installed
  useEffect(() => {
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSInstalled = (window.navigator as any).standalone === true;
      const isInstalled = isStandalone || isIOSInstalled;
      setIsInstalled(isInstalled);
    };

    checkIfInstalled();
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
      onInstallStatusChange?.(true);
      
      // Auto-show install dialog after some delay if not installed
      if (!isInstalled) {
        setTimeout(() => {
          setShowInstallDialog(true);
        }, 10000); // Show after 10 seconds
      }
    };

    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setInstallResult('App installed successfully! 🎉');
      onInstallStatusChange?.(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled, onInstallStatusChange]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      onOfflineStatusChange?.(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      onOfflineStatusChange?.(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOfflineStatusChange]);

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW: Service Worker registered', registration);
          setSwRegistration(registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            console.log('SW: Update found');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('SW: Update available');
                  setUpdateAvailable(true);
                  setShowUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('SW: Service Worker registration failed', error);
        });
    }
  }, []);

  // Install PWA
  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`PWA: User choice: ${outcome}`);
      
      if (outcome === 'accepted') {
        setInstallResult('Installing app... Please wait.');
      } else {
        setInstallResult('Installation cancelled.');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowInstallDialog(false);
    } catch (error) {
      console.error('PWA: Installation failed', error);
      setInstallResult('Installation failed. Please try again.');
    }
  }, [deferredPrompt]);

  // Update app
  const handleUpdate = useCallback(() => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdateAvailable(false);
      window.location.reload();
    }
  }, [swRegistration]);

  // Simulate caching progress for demo
  useEffect(() => {
    if (showCachingProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setCachingProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowCachingProgress(false);
            setCachingProgress(0);
          }, 1000);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [showCachingProgress]);

  return (
    <>
      {children}

      {/* Install Dialog */}
      <Dialog open={showInstallDialog} onClose={() => setShowInstallDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <InstallMobile sx={{ fontSize: 48, color: '#1de9b6' }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Install Travelogy
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            Get the full app experience! Install Travelogy for faster access, offline support, and native mobile features.
          </Typography>
          
          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Speed color="primary" />
                  <Box>
                    <Typography variant="subtitle2">Faster Loading</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Launch instantly from your home screen
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Offline color="primary" />
                  <Box>
                    <Typography variant="subtitle2">Offline Support</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Access your journal and data without internet
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Smartphone color="primary" />
                  <Box>
                    <Typography variant="subtitle2">Native Feel</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Full-screen experience without browser UI
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowInstallDialog(false)} color="inherit">
            Not Now
          </Button>
          <Button 
            onClick={handleInstallClick} 
            variant="contained"
            startIcon={<GetApp />}
            sx={{ 
              bgcolor: '#1de9b6', 
              color: '#000',
              '&:hover': { bgcolor: '#00e676' }
            }}
          >
            Install App
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Available Dialog */}
      <Dialog open={showUpdateAvailable} onClose={() => setShowUpdateAvailable(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Update color="primary" />
          App Update Available
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            A new version of Travelogy is available with improvements and new features.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpdateAvailable(false)} color="inherit">
            Later
          </Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Update Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Caching Progress */}
      {showCachingProgress && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 10000,
          bgcolor: '#1de9b6',
          color: '#000',
          p: 2
        }}>
          <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
            Caching app for offline use...
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={cachingProgress}
            sx={{
              bgcolor: 'rgba(0,0,0,0.2)',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#000'
              }
            }}
          />
        </Box>
      )}

      {/* Status Indicators */}
      <Box sx={{ position: 'fixed', top: 10, right: 10, zIndex: 1000, display: 'flex', gap: 1 }}>
        {isOffline && (
          <Chip 
            icon={<Offline />} 
            label="Offline" 
            size="small" 
            sx={{ 
              bgcolor: '#ff9800', 
              color: '#000',
              fontWeight: 'bold'
            }}
          />
        )}
        
        {isInstalled && (
          <Chip 
            icon={<CloudDone />} 
            label="Installed" 
            size="small" 
            sx={{ 
              bgcolor: '#4caf50', 
              color: '#fff'
            }}
          />
        )}
      </Box>

      {/* Install Result Snackbar */}
      <Snackbar
        open={!!installResult}
        autoHideDuration={4000}
        onClose={() => setInstallResult(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setInstallResult(null)} 
          severity={installResult?.includes('success') ? 'success' : 'info'}
          variant="filled"
        >
          {installResult}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PWAManager;