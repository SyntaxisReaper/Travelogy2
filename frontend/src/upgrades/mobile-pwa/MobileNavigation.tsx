import React, { useState, useEffect } from 'react';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Badge,
  Fab,
  useTheme,
  useMediaQuery,
  Paper,
  Divider
} from '@mui/material';
import {
  Home,
  Explore,
  Book,
  Map,
  Person,
  Menu as MenuIcon,
  Close,
  CameraAlt,
  Navigation,
  TravelExplore,
  Analytics,
  WbSunny as Weather,
  ContactSupport,
  Settings,
  InstallMobile,
  Share,
  CloudOff as Offline
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileNavigationProps {
  onInstallApp?: () => void;
  isInstallable?: boolean;
  isOffline?: boolean;
  newPhotosCount?: number;
}

// Navigation items for bottom nav
const BOTTOM_NAV_ITEMS = [
  { label: 'Home', value: '/', icon: Home },
  { label: 'Trips', value: '/trips', icon: Explore },
  { label: 'Journal', value: '/journal', icon: Book },
  { label: 'Profile', value: '/profile', icon: Person },
];

// Additional menu items for drawer
const DRAWER_MENU_ITEMS = [
  { label: 'Dashboard', value: '/dashboard', icon: TravelExplore },
  { label: 'Analytics', value: '/analytics', icon: Analytics },
  { label: 'Weather', value: '/weather', icon: Weather },
  { label: 'Route Planner', value: '/trips', icon: Map, badge: 'New' },
  { label: 'Contact', value: '/contact', icon: ContactSupport },
];

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onInstallApp,
  isInstallable = false,
  isOffline = false,
  newPhotosCount = 0
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('/');
  const [showQuickCapture, setShowQuickCapture] = useState(false);

  // Update current tab based on location
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingTab = BOTTOM_NAV_ITEMS.find(item => 
      currentPath === item.value || (item.value !== '/' && currentPath.startsWith(item.value))
    );
    setCurrentTab(matchingTab?.value || '/');
  }, [location.pathname]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleBottomNavChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    navigate(newValue);
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event &&
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  // Quick capture for camera/photos
  const handleQuickCapture = () => {
    navigate('/journal');
    // Trigger photo upload panel
    setTimeout(() => {
      const event = new CustomEvent('openPhotoUpload');
      window.dispatchEvent(event);
    }, 500);
  };

  if (!isMobile) {
    return null; // Only show on mobile
  }

  return (
    <>
      {/* Bottom Navigation */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          borderTop: '1px solid rgba(29, 233, 182, 0.2)',
          bgcolor: 'background.paper',
          backdropFilter: 'blur(10px)',
        }} 
        elevation={8}
      >
        <BottomNavigation
          value={currentTab}
          onChange={handleBottomNavChange}
          sx={{
            height: 70,
            '& .MuiBottomNavigationAction-root': {
              color: 'text.secondary',
              '&.Mui-selected': {
                color: '#1de9b6',
              },
              minWidth: 'auto',
              paddingTop: 1
            }
          }}
        >
          {BOTTOM_NAV_ITEMS.map((item) => (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              value={item.value}
              icon={
                item.label === 'Journal' && newPhotosCount > 0 ? (
                  <Badge badgeContent={newPhotosCount} color="error" max={99}>
                    <item.icon />
                  </Badge>
                ) : (
                  <item.icon />
                )
              }
            />
          ))}
        </BottomNavigation>
      </Paper>

      {/* Menu FAB */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <Fab
          sx={{
            position: 'fixed',
            top: 20,
            left: 20,
            bgcolor: '#1de9b6',
            color: '#000',
            width: 48,
            height: 48,
            zIndex: 1001,
            '&:hover': {
              bgcolor: '#00e676',
              transform: 'scale(1.1)'
            },
            boxShadow: '0 4px 12px rgba(29, 233, 182, 0.4)'
          }}
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </Fab>
      </motion.div>

      {/* Quick Capture FAB */}
      <AnimatePresence>
        {location.pathname !== '/journal' && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring' }}
          >
            <Fab
              sx={{
                position: 'fixed',
                bottom: 90, // Above bottom nav
                right: 20,
                bgcolor: '#ff4081',
                color: 'white',
                width: 56,
                height: 56,
                zIndex: 1001,
                '&:hover': {
                  bgcolor: '#f50057',
                  transform: 'scale(1.1)'
                },
                boxShadow: '0 6px 16px rgba(255, 64, 129, 0.4)'
              }}
              onClick={handleQuickCapture}
            >
              <CameraAlt />
            </Fab>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-out Drawer Menu */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: 'background.paper',
            backgroundImage: 'linear-gradient(135deg, rgba(29, 233, 182, 0.05) 0%, rgba(0, 230, 118, 0.05) 100%)',
          }
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            background: 'linear-gradient(135deg, #1de9b6 0%, #00e676 100%)',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                🌐 Travelogy
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Mobile Experience
              </Typography>
            </Box>
            <IconButton onClick={toggleDrawer(false)} sx={{ color: '#000' }}>
              <Close />
            </IconButton>
          </Box>

          {/* Offline Indicator */}
          {isOffline && (
            <Box sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Offline />
                <Typography variant="body2">
                  You're offline. Some features may be limited.
                </Typography>
              </Box>
            </Box>
          )}

          {/* Main Navigation */}
          <List>
            {DRAWER_MENU_ITEMS.map((item) => (
              <ListItem 
                button 
                key={item.value} 
                onClick={() => handleNavigation(item.value)}
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(29, 233, 182, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#1de9b6' }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  sx={{ color: 'text.primary' }}
                />
                {item.badge && (
                  <Badge 
                    badgeContent={item.badge} 
                    color="error" 
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: '#ff4081',
                        animation: 'pulse 2s infinite'
                      }
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>

          <Divider />

          {/* PWA Actions */}
          <List>
            {isInstallable && onInstallApp && (
              <ListItem 
                button 
                onClick={() => {
                  onInstallApp();
                  setDrawerOpen(false);
                }}
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(29, 233, 182, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#00e676' }}>
                  <InstallMobile />
                </ListItemIcon>
                <ListItemText 
                  primary="Install App"
                  secondary="Add to home screen"
                />
                <Badge color="success" variant="dot" />
              </ListItem>
            )}

            <ListItem 
              button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Travelogy',
                    text: 'Check out this amazing travel app!',
                    url: window.location.origin
                  });
                }
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon sx={{ color: '#1de9b6' }}>
                <Share />
              </ListItemIcon>
              <ListItemText primary="Share App" />
            </ListItem>
          </List>
        </Box>
      </SwipeableDrawer>

      {/* Add padding to body content on mobile */}
      <style>
        {`
          @media (max-width: 600px) {
            body {
              padding-bottom: 70px !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default MobileNavigation;