import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider as MDivider,
} from '@mui/material';
import {
  Dashboard,
  Book,
  Map,
  Cloud,
  FlightTakeoff,
  Hotel,
  TravelExplore,
  Analytics,
  Person,
  ContactMail,
  Menu as MenuIcon,
  Login,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { travelColors } from '../styles/travelTheme';
import TravelText from './TravelText';

interface NavbarProps {
  themeMode?: 'light' | 'dark';
  themeFont?: 'tech' | 'system' | 'mono' | 'grotesk';
  accent?: 'cyan' | 'pink' | 'green' | 'orange' | 'purple' | 'blue' | 'teal' | 'amber';
  onChangeThemeMode?: (m: 'light' | 'dark') => void;
  onChangeThemeFont?: (f: 'tech' | 'system' | 'mono' | 'grotesk') => void;
  onChangeAccent?: (a: 'cyan' | 'pink' | 'green' | 'orange' | 'purple' | 'blue' | 'teal' | 'amber') => void;
}

const Navbar: React.FC<NavbarProps> = ({ themeMode = 'dark', themeFont = 'tech', accent = 'cyan', onChangeThemeMode, onChangeThemeFont, onChangeAccent }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [themeAnchor, setThemeAnchor] = React.useState<null | HTMLElement>(null);

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { label: 'Adventures', path: '/trips', icon: <FlightTakeoff /> },
    { label: 'Weather', path: '/weather', icon: <Cloud /> },
    { label: 'Journal', path: '/journal', icon: <Book /> },
    { label: 'Analytics', path: '/analytics', icon: <Analytics /> },
    // New (additive): Rajasthan Tourism Intelligence section
    { label: 'Tourism Intel', path: '/ti', icon: <Map /> },
    { label: 'Bookings', path: '/book', icon: <Hotel /> },
    { label: 'Explore', path: '/stores', icon: <TravelExplore /> },
    { label: 'Profile', path: '/profile', icon: <Person /> },
    { label: 'Contact', path: '/contact', icon: <ContactMail /> },
  ];

  return (
    <>
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: `linear-gradient(135deg, ${travelColors.primary.ocean} 0%, ${travelColors.primary.sky} 50%, ${travelColors.primary.sunset} 100%)`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${travelColors.primary.ocean}30`,
        boxShadow: travelColors.shadows.medium
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        {/* Mobile menu button (left) */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
          <IconButton 
            color="inherit" 
            aria-label="Open navigation menu" 
            onClick={() => setMobileOpen(true)}
            sx={{
              '&:hover': {
                backgroundColor: `${travelColors.text.white}15`,
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        <Box 
          component={RouterLink}
          to="/"
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            cursor: 'pointer', 
            ml: { xs: 1, md: 0 },
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <TravelExplore sx={{ fontSize: 32, color: travelColors.text.white, mr: 1 }} />
          <TravelText
            text="TraveLogy"
            textVariant="wanderlust"
            variant="h5"
            sx={{ 
              color: travelColors.text.white,
              fontWeight: 'bold',
              textShadow: `0 2px 4px ${travelColors.primary.ocean}50`
            }}
          />
        </Box>

        {/* Desktop / tablet nav (scrollable if overflow) */}
        <Box sx={{
          display: { xs: 'none', md: 'flex' },
          gap: 0.5,
          maxWidth: '100%',
          overflowX: 'auto',
          flexWrap: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          '::-webkit-scrollbar': { height: 6 },
          '::-webkit-scrollbar-thumb': { 
            background: `${travelColors.text.white}40`, 
            borderRadius: 3 
          },
        }}>
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  whiteSpace: 'nowrap',
                  backgroundColor: isActive 
                    ? `${travelColors.text.white}20` 
                    : 'transparent',
                  color: travelColors.text.white,
                  borderRadius: '12px',
                  px: 2,
                  py: 1,
                  mx: 0.5,
                  fontWeight: isActive ? 'bold' : 'medium',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  border: isActive 
                    ? `1px solid ${travelColors.text.white}30` 
                    : '1px solid transparent',
                  '&:hover': { 
                    backgroundColor: `${travelColors.text.white}25`,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 8px ${travelColors.primary.ocean}30`
                  },
                  '& .MuiButton-startIcon': {
                    color: isActive ? travelColors.accents.warning : travelColors.text.white
                  },
                  flex: '0 0 auto',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
          {/* Auth buttons (always visible in public app) */}
          <Button
            component={RouterLink}
            to="/login"
            startIcon={<Login />}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              backgroundColor: 'transparent',
              color: travelColors.text.white,
              borderRadius: '12px',
              px: 2,
              py: 1,
              textTransform: 'none',
              fontWeight: 'medium',
              border: `1px solid ${travelColors.text.white}30`,
              '&:hover': { 
                backgroundColor: `${travelColors.text.white}15`,
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 8px ${travelColors.primary.ocean}30`
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Sign In
          </Button>
          <Button
            component={RouterLink}
            to="/register"
            startIcon={<PersonAdd />}
            variant="contained"
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              backgroundColor: travelColors.accents.warning,
              color: travelColors.primary.ocean,
              borderRadius: '12px',
              px: 2,
              py: 1,
              textTransform: 'none',
              fontWeight: 'bold',
              border: `1px solid ${travelColors.accents.warning}`,
              boxShadow: `0 2px 8px ${travelColors.accents.warning}30`,
              '&:hover': { 
                backgroundColor: travelColors.accents.warning,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 12px ${travelColors.accents.warning}40`
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Start Adventure
          </Button>
        </Box>
      </Toolbar>

      {/* Mobile drawer */}
      <Drawer 
        anchor="left" 
        open={mobileOpen} 
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            background: `linear-gradient(180deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 100%)`,
            borderRight: `1px solid ${travelColors.primary.ocean}20`
          }
        }}
      >
        <Box 
          sx={{ width: 280 }} 
          role="presentation" 
          onClick={() => setMobileOpen(false)} 
          onKeyDown={() => setMobileOpen(false)}
        >
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <TravelExplore sx={{ fontSize: 40, color: travelColors.primary.ocean, mb: 1 }} />
            <TravelText
              text="TraveLogy"
              textVariant="adventure"
              variant="h5"
              sx={{ color: travelColors.primary.ocean }}
            />
          </Box>
          <MDivider sx={{ borderColor: `${travelColors.primary.ocean}20` }} />
          <List>
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItemButton 
                  key={item.path} 
                  onClick={() => navigate(item.path)} 
                  selected={isActive}
                  sx={{
                    mx: 1,
                    mb: 0.5,
                    borderRadius: '12px',
                    backgroundColor: isActive ? `${travelColors.primary.ocean}15` : 'transparent',
                    '&:hover': {
                      backgroundColor: `${travelColors.primary.ocean}10`,
                      transform: 'translateX(4px)'
                    },
                    '&.Mui-selected': {
                      backgroundColor: `${travelColors.primary.ocean}20`,
                      border: `1px solid ${travelColors.primary.ocean}30`
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActive ? travelColors.primary.ocean : travelColors.text.secondary,
                    minWidth: '40px'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    sx={{ 
                      color: isActive ? travelColors.primary.ocean : travelColors.text.primary,
                      fontWeight: isActive ? 'bold' : 'medium'
                    }}
                  />
                </ListItemButton>
              );
            })}
            <MDivider sx={{ my: 2, borderColor: `${travelColors.primary.ocean}20` }} />
            <ListItemButton 
              onClick={() => navigate('/login')} 
              selected={location.pathname === '/login'}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: `${travelColors.primary.sunset}10`,
                  transform: 'translateX(4px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ListItemIcon sx={{ color: travelColors.primary.sunset, minWidth: '40px' }}>
                <Login />
              </ListItemIcon>
              <ListItemText 
                primary="Sign In" 
                sx={{ color: travelColors.text.primary }}
              />
            </ListItemButton>
            <ListItemButton 
              onClick={() => navigate('/register')} 
              selected={location.pathname === '/register'}
              sx={{
                mx: 1,
                borderRadius: '12px',
                backgroundColor: `${travelColors.accents.warning}20`,
                border: `1px solid ${travelColors.accents.warning}30`,
                '&:hover': {
                  backgroundColor: `${travelColors.accents.warning}30`,
                  transform: 'translateX(4px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ListItemIcon sx={{ color: travelColors.accents.warning, minWidth: '40px' }}>
                <PersonAdd />
              </ListItemIcon>
              <ListItemText 
                primary="Start Adventure" 
                sx={{ 
                  color: travelColors.primary.ocean,
                  fontWeight: 'bold'
                }}
              />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

    </AppBar>
    </>
  );
};

export default Navbar;
