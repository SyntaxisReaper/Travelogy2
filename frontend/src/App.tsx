import React, { useState, useEffect, useCallback, Suspense, lazy, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Typography, Toolbar } from '@mui/material';
import { travelColors, travelMuiTheme } from './styles/travelTheme';
import TechLoader from './components/TechLoader';
import NotificationSystem from './components/NotificationSystem';
import ContactFab from './components/ContactFab';
import { NotifyProvider } from './contexts/NotifyContext';
import ScrollToTop from './components/ScrollToTop';
import AnalyticsModal from './components/AnalyticsModal';
import Navbar from './components/Navbar';
import EmergencySOS from './components/EmergencySOS';
import ThemePanel from './components/ThemePanel';
import ThemeFab from './components/ThemeFab';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPageWrapper = lazy(() => import('./pages/DashboardPageWrapper'));
const TripsPage = lazy(() => import('./pages/TripsPage'));
const TripsListPage = lazy(() => import('./pages/TripsListPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const WeatherPage = lazy(() => import('./pages/WeatherPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LandingPage = lazy(() => import('./pages/LandingPage.simple'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const TripDetailsPage = lazy(() => import('./pages/TripDetailsPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const StoresPage = lazy(() => import('./pages/StoresPage'));
const FeedbackAdminPage = lazy(() => import('./pages/FeedbackAdminPage'));

// Google Fonts for tech typography
const googleFontsLink = document.createElement('link');
googleFontsLink.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto+Mono:wght@300;400;700&family=Inter:wght@300;400;600;800&family=Space+Grotesk:wght@400;600;700&family=Fira+Code:wght@300;400;600&display=swap';
googleFontsLink.rel = 'stylesheet';
document.head.appendChild(googleFontsLink);

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentLoaderType, setCurrentLoaderType] = useState<'circuit' | 'matrix' | 'dna' | 'quantum' | 'neural'>('circuit');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isJourneyActive, setIsJourneyActive] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [systemStatus, setSystemStatus] = useState({
    aiAccuracy: 94.2,
    activeConnections: 1247,
    dataProcessed: 15840,
  });
  
  // Theme controls
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => (localStorage.getItem('themeMode') as 'light' | 'dark') || 'light');
  const [themeFont, setThemeFont] = useState<'tech' | 'system' | 'mono' | 'grotesk'>(() => (localStorage.getItem('themeFont') as any) || 'system');
  const [accent, setAccent] = useState<'cyan' | 'pink' | 'green' | 'orange' | 'purple' | 'blue' | 'teal' | 'amber'>(() => (localStorage.getItem('accent') as any) || 'cyan');
  const [themePanelOpen, setThemePanelOpen] = useState(false);

  const activeTheme = useMemo(() => createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: accent === 'cyan' ? travelColors.primary.ocean :
              accent === 'pink' ? travelColors.primary.coral :
              accent === 'green' ? travelColors.primary.forest :
              accent === 'orange' ? travelColors.primary.sunset :
              travelColors.primary.ocean,
      },
      secondary: {
        main: travelColors.primary.sunset,
      },
      background: themeMode === 'light' ? {
        default: travelColors.backgrounds.cream,
        paper: travelColors.backgrounds.paper,
      } : {
        default: '#0f1419',
        paper: '#1a1f2e',
      },
      text: themeMode === 'light' ? {
        primary: travelColors.text.primary,
        secondary: travelColors.text.secondary,
      } : {
        primary: '#ffffff',
        secondary: '#b0b9c1',
      },
    },
    typography: {
      fontFamily: themeFont === 'tech' ? '"Orbitron", "Roboto Mono", monospace' :
                  themeFont === 'mono' ? '"Fira Code", "Roboto Mono", monospace' :
                  themeFont === 'grotesk' ? '"Space Grotesk", "Inter", sans-serif' :
                  '"Inter", "Roboto", sans-serif',
      h1: { fontWeight: 700, fontFamily: '"Playfair Display", serif' },
      h2: { fontWeight: 600, fontFamily: '"Playfair Display", serif' },
      h3: { fontWeight: 600, fontFamily: '"Playfair Display", serif' },
      button: { textTransform: 'none' },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
    },
  }), [themeMode, themeFont, accent]);

  const handleChangeThemeMode = useCallback((m: 'light'|'dark') => { setThemeMode(m); localStorage.setItem('themeMode', m); }, []);
  const handleChangeThemeFont = useCallback((f: 'tech'|'system'|'mono'|'grotesk') => { setThemeFont(f); localStorage.setItem('themeFont', f); }, []);
  const handleChangeAccent = useCallback((a: 'cyan'|'pink'|'green'|'orange'|'purple'|'blue'|'teal'|'amber') => { setAccent(a); localStorage.setItem('accent', a); }, []);

  useEffect(() => {
    // Simulate loading sequence
    const loadingSequence = [
      { type: 'circuit' as const, duration: 1000 },
      { type: 'quantum' as const, duration: 800 },
      { type: 'neural' as const, duration: 800 },
    ];

    let currentIndex = 0;
    const runSequence = () => {
      if (currentIndex < loadingSequence.length) {
        setCurrentLoaderType(loadingSequence[currentIndex].type);
        setTimeout(() => {
          currentIndex++;
          runSequence();
        }, loadingSequence[currentIndex].duration);
      } else {
        setLoading(false);
      }
    };

    runSequence();

    // Simulate real-time system updates
    const statusInterval = setInterval(() => {
      setSystemStatus(prev => ({
        aiAccuracy: Math.min(100, prev.aiAccuracy + (Math.random() - 0.5) * 0.1),
        activeConnections: prev.activeConnections + Math.floor(Math.random() * 10 - 5),
        dataProcessed: prev.dataProcessed + Math.floor(Math.random() * 50),
      }));
    }, 10000);

    return () => clearInterval(statusInterval);
  }, []);

  // Button handler functions with useCallback for performance
  const handleStartJourney = useCallback(() => {
    if (!isJourneyActive) {
      setIsJourneyActive(true);
      setNotifications(prev => [...prev, 'Journey started! AI tracking activated.']);
      // Simulate journey tracking
      setTimeout(() => {
        setNotifications(prev => [...prev, 'Transport mode detected: Walking']);
      }, 3000);
      setTimeout(() => {
        setNotifications(prev => [...prev, 'Route optimization complete']);
      }, 8000);
    } else {
      setIsJourneyActive(false);
      setNotifications(prev => [...prev, 'Journey completed! Data synced to neural network.']);
    }
  }, [isJourneyActive]);

  const handleViewAnalytics = useCallback(() => {
    setNotifications(prev => [...prev, 'Accessing quantum analytics...']);
    setTimeout(() => {
      setShowAnalytics(true);
    }, 1500);
  }, []);

  // Notification management with useCallback
  const clearNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={activeTheme}>
        <CssBaseline />
        <TechLoader
          type={currentLoaderType}
          size="large"
          text="Loading your travel companion..."
          color={travelColors.primary.ocean}
          fullscreen
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <Router>
        <Navbar
          themeMode={themeMode}
          themeFont={themeFont}
          accent={accent}
          onChangeThemeMode={handleChangeThemeMode}
          onChangeThemeFont={handleChangeThemeFont}
          onChangeAccent={handleChangeAccent}
        />
        <ScrollToTop />
        <Toolbar />
        <Box sx={{ 
          minHeight: '100vh', 
          position: 'relative', 
          overflowX: 'hidden',
          background: themeMode === 'light' ? 
            `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.sky}20 100%)` :
            `linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, ${travelColors.primary.ocean}10 100%)`
        }}>
          
          <NotifyProvider onNotify={(message) => setNotifications(prev => [...prev, message])}>
            <Suspense fallback={
              <TechLoader
                type="circuit"
                size="large"
                text="Loading..."
                color={travelColors.primary.ocean}
                fullscreen
              />
            }>
              <Routes>
                {/* All routes are now public - no authentication required */}
                <Route path="/dashboard" element={<DashboardPageWrapper />} />
                <Route path="/trips" element={<TripsPage />} />
                <Route path="/trips/list" element={<TripsListPage />} />
                <Route path="/trips/:id" element={<TripDetailsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/book" element={<BookingsPage />} />
                <Route path="/stores" element={<StoresPage />} />
                <Route path="/admin/feedback" element={<FeedbackAdminPage />} />
                <Route path="/weather" element={<WeatherPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<LandingPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </NotifyProvider>
        </Box>
        
        {/* Notification System */}
        <NotificationSystem
          notifications={notifications}
          onClearNotification={clearNotification}
          onClearAll={clearAllNotifications}
        />

        {/* Emergency SOS floating button */}
        <EmergencySOS />
        
        {/* Analytics Modal */}
        <AnalyticsModal
          open={showAnalytics}
          onClose={() => setShowAnalytics(false)}
        />

        {/* Theme floating button */}
        <ThemeFab onClick={() => setThemePanelOpen(true)} />

        {/* Contact floating button */}
        <ContactFab />

        {/* Footer */}
        <Box component="footer" sx={{ textAlign: 'center', py: 2, bgcolor: 'background.default', color: 'text.secondary' }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} Travelogy — <a href="/contact" style={{ color: '#1de9b6', textDecoration: 'none' }}>Contact Team SkyStack</a>
          </Typography>
        </Box>
      </Router>

      {/* Theme Panel (app-level) */}
      <ThemePanel
        open={themePanelOpen}
        onClose={() => setThemePanelOpen(false)}
        themeMode={themeMode}
        themeFont={themeFont}
        onChangeThemeMode={handleChangeThemeMode}
        onChangeThemeFont={handleChangeThemeFont}
      />
    </ThemeProvider>
  );
};

export default App;
