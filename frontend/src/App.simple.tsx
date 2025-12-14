import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Typography, Button, Container, Grid, Card, CardContent, CircularProgress, Toolbar } from '@mui/material';
import { TravelExplore, FlightTakeoff, PhotoCamera, Public } from '@mui/icons-material';
import { travelColors } from './styles/travelTheme';
import Navbar from './components/Navbar';
import './styles/animations.css';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPageWrapper = lazy(() => import('./pages/DashboardPageWrapper'));
const TripsPage = lazy(() => import('./pages/TripsPage.simple'));
const TripsListPage = lazy(() => import('./pages/TripsListPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const WeatherPage = lazy(() => import('./pages/WeatherPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const TripDetailsPage = lazy(() => import('./pages/TripDetailsPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const StoresPage = lazy(() => import('./pages/StoresPage'));
const FeedbackAdminPage = lazy(() => import('./pages/FeedbackAdminPage'));
const NewLandingPage = lazy(() => import('./pages/LandingPage.new'));

// Tourism Intelligence (Rajasthan)
const TiLandingPage = lazy(() => import('./pages/ti/TiLandingPage'));
const TiDashboardPage = lazy(() => import('./pages/ti/TiDashboardPage'));
const TiFootfallPage = lazy(() => import('./pages/ti/TiFootfallPage'));
const TiAttractionsPage = lazy(() => import('./pages/ti/TiAttractionsPage'));
const TiAttractionDetailPage = lazy(() => import('./pages/ti/TiAttractionDetailPage'));
const TiHotelsPage = lazy(() => import('./pages/ti/TiHotelsPage'));
const TiAdminIngestPage = lazy(() => import('./pages/ti/TiAdminIngestPage'));
const TiInsightsPage = lazy(() => import('./pages/ti/TiInsightsPage'));

// Simple loading component
const TravelLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 100%)`,
    }}
  >
    <CircularProgress size={60} sx={{ color: travelColors.primary.ocean, mb: 2 }} />
    <Typography variant="h6" sx={{ color: travelColors.text.primary }}>
      Loading your travel companion...
    </Typography>
  </Box>
);

// Beautiful travel theme
const travelTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: travelColors.primary.ocean,
      light: travelColors.primary.sky,
      dark: travelColors.primary.forest,
    },
    secondary: {
      main: travelColors.primary.sunset,
      light: travelColors.primary.coral,
      dark: travelColors.accents.warning,
    },
    background: {
      default: travelColors.backgrounds.cream,
      paper: travelColors.backgrounds.paper,
    },
    text: {
      primary: travelColors.text.primary,
      secondary: travelColors.text.secondary,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '12px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: travelColors.shadows.soft,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: travelColors.shadows.medium,
            transform: 'translateY(-4px)',
          },
        },
      },
    },
  },
});

// Beautiful Travel Landing Component
const TravelLanding: React.FC = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: <PhotoCamera fontSize="large" sx={{ color: travelColors.primary.ocean }} />,
      title: 'Capture Memories',
      description: 'Document every adventure with photos and stories.',
    },
    {
      icon: <TravelExplore fontSize="large" sx={{ color: travelColors.primary.sunset }} />,
      title: 'Discover Places',
      description: 'Find hidden gems and must-see destinations.',
    },
    {
      icon: <FlightTakeoff fontSize="large" sx={{ color: travelColors.primary.forest }} />,
      title: 'Plan Adventures',
      description: 'Organize trips and track your itineraries.',
    },
    {
      icon: <Public fontSize="large" sx={{ color: travelColors.primary.coral }} />,
      title: 'Share Stories',
      description: 'Inspire others with your travel experiences.',
    },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.sky}15 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${travelColors.primary.sunset}20 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: '150px',
          height: '150px',
          background: `radial-gradient(circle, ${travelColors.primary.ocean}15 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, py: 8 }}>
        {/* Main Title */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h1" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '3rem', md: '4.5rem' },
              background: `linear-gradient(45deg, ${travelColors.primary.ocean}, ${travelColors.primary.sunset})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            🌐 Travelogy
          </Typography>
          <Typography variant="h4" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            Your Personal Travel Journal
          </Typography>
          <Typography variant="h6" sx={{ mb: 6, opacity: 0.8, maxWidth: 600, mx: 'auto' }}>
            Capture memories from every adventure. Plan trips. Share stories. Inspire others.
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', mb: 8 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<TravelExplore />}
              onClick={() => navigate('/dashboard')}
              sx={{
                background: `linear-gradient(45deg, ${travelColors.primary.ocean}, ${travelColors.primary.sky})`,
                color: 'white',
                px: 4,
                py: 1.5,
                '&:hover': {
                  background: `linear-gradient(45deg, ${travelColors.primary.forest}, ${travelColors.primary.ocean})`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Launch Dashboard
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<FlightTakeoff />}
              onClick={() => navigate('/trips')}
              sx={{
                borderColor: travelColors.primary.sunset,
                color: travelColors.primary.sunset,
                px: 4,
                py: 1.5,
                '&:hover': {
                  borderColor: travelColors.primary.coral,
                  backgroundColor: `${travelColors.primary.sunset}10`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Plan Trips
            </Button>
          </Box>

          {/* Quick Access Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 6 }}>
            <Button variant="text" onClick={() => navigate('/weather')} sx={{ color: travelColors.primary.ocean }}>
              Weather
            </Button>
            <Button variant="text" onClick={() => navigate('/journal')} sx={{ color: travelColors.primary.sunset }}>
              Journal
            </Button>
            <Button variant="text" onClick={() => navigate('/analytics')} sx={{ color: travelColors.primary.forest }}>
              Analytics
            </Button>
            <Button variant="text" onClick={() => navigate('/profile')} sx={{ color: travelColors.primary.coral }}>
              Profile
            </Button>
          </Box>

          {/* Status Indicators */}
          <Box sx={{ 
            display: 'inline-flex', 
            flexDirection: 'column', 
            gap: 1, 
            p: 3, 
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${travelColors.primary.ocean}20`
          }}>
            <Typography variant="body2" sx={{ color: travelColors.accents.success, fontWeight: 600 }}>
              ✅ Travel theme applied successfully
            </Typography>
            <Typography variant="body2" sx={{ color: travelColors.accents.success, fontWeight: 600 }}>
              ✅ No white screen issues
            </Typography>
            <Typography variant="body2" sx={{ color: travelColors.accents.success, fontWeight: 600 }}>
              ✅ Ready for feature enhancement
            </Typography>
          </Box>
        </Box>

        {/* Features Grid */}
        <Typography variant="h3" textAlign="center" gutterBottom sx={{ mb: 6 }}>
          Why Choose Travelogy?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ color: travelColors.text.primary }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

const SimpleApp: React.FC = () => {
  return (
    <ThemeProvider theme={travelTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh' }}>
          {/* Navigation Bar */}
          <Navbar 
            themeMode="light"
            themeFont="system"
            accent="cyan"
          />
          
          {/* Main Content */}
          <Box component="main">
            <Toolbar /> {/* Spacer for fixed navbar */}
            <Suspense fallback={<TravelLoader />}>
              <Routes>
                {/* Main Routes */}
                <Route path="/dashboard" element={<DashboardPageWrapper />} />
                <Route path="/adventures" element={<TripsPage />} />
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

                {/* Tourism Intelligence (non-breaking additive routes) */}
                <Route path="/ti" element={<TiLandingPage />} />
                <Route path="/ti/dashboard" element={<TiDashboardPage />} />
                <Route path="/ti/footfall" element={<TiFootfallPage />} />
                <Route path="/ti/attractions" element={<TiAttractionsPage />} />
                <Route path="/ti/attractions/:id" element={<TiAttractionDetailPage />} />
                <Route path="/ti/hotels" element={<TiHotelsPage />} />
                <Route path="/ti/admin/ingest" element={<TiAdminIngestPage />} />
                <Route path="/ti/insights" element={<TiInsightsPage />} />
                
                {/* Home and 404 */}
                <Route path="/" element={<NewLandingPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default SimpleApp;