import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  LinearProgress, 
  Chip,
  IconButton,
  Badge,
  Tooltip
} from '@mui/material';
import { 
  Speed,
  Timeline,
  TrendingUp,
  Map,
  Psychology,
  Refresh,
  Settings,
  Notifications,
  Palette,
  AccessibilityNew,
  TravelExplore,
  Warning,
  Analytics
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import HolographicCard from './HolographicCard';
import NeonButton from './NeonButton';
import GlitchText from './GlitchText';
import TechLoader from './TechLoader';
import AgeGroupThemePanel from './AgeGroupThemePanel';
import { colors } from '../styles/techTheme';
import { signOutUser } from '../services/authService';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import type { Auth } from 'firebase/auth';

interface TechDashboardProps {
  onClose?: () => void;
}

// Mock data for visualizations
const travelData = [
  { month: 'Jan', trips: 12, distance: 450, co2: 120 },
  { month: 'Feb', trips: 18, distance: 670, co2: 180 },
  { month: 'Mar', trips: 25, distance: 890, co2: 240 },
  { month: 'Apr', trips: 22, distance: 760, co2: 210 },
  { month: 'May', trips: 31, distance: 1200, co2: 320 },
  { month: 'Jun', trips: 28, distance: 980, co2: 280 },
];

const transportModes = [
  { mode: 'Walking', value: 45, color: colors.neonGreen },
  { mode: 'Cycling', value: 25, color: colors.neonCyan },
  { mode: 'Public', value: 20, color: colors.neonBlue },
  { mode: 'Car', value: 10, color: colors.neonOrange },
];

const aiPredictions = [
  { category: 'Efficiency', current: 85, predicted: 92 },
  { category: 'Sustainability', current: 78, predicted: 88 },
  { category: 'Cost', current: 65, predicted: 75 },
  { category: 'Time', current: 90, predicted: 94 },
  { category: 'Comfort', current: 82, predicted: 89 },
  { category: 'Safety', current: 95, predicted: 97 },
];

const TechDashboardBase: React.FC<TechDashboardProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [currentView, setCurrentView] = useState<'dashboard' | 'maps' | 'insights' | 'emergency'>('dashboard');
  const authInstance = auth as Auth; // With configured Firebase, this is defined
  const [user] = useAuthState(authInstance);
  const [realTimeData, setRealTimeData] = useState({
    currentTrips: 156,
    todayDistance: 12.4,
    weeklyGoal: 75,
    aiAccuracy: 94.2,
    dataProcessed: 15840,
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 2000);

    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        currentTrips: prev.currentTrips + Math.floor(Math.random() * 3),
        todayDistance: prev.todayDistance + (Math.random() * 0.5),
        weeklyGoal: Math.min(100, prev.weeklyGoal + Math.random() * 2),
        aiAccuracy: Math.min(100, prev.aiAccuracy + (Math.random() - 0.5) * 0.1),
        dataProcessed: prev.dataProcessed + Math.floor(Math.random() * 50),
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Button handlers
  const handleSyncData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setRealTimeData(prev => ({
        ...prev,
        aiAccuracy: Math.min(100, prev.aiAccuracy + 0.5),
        dataProcessed: prev.dataProcessed + 147,
      }));
    }, 3000);
  };

  const handleTrainAI = () => {
    setIsTraining(true);
    setTimeout(() => {
      setIsTraining(false);
      setRealTimeData(prev => ({
        ...prev,
        aiAccuracy: Math.min(100, prev.aiAccuracy + 1.2),
      }));
    }, 5000);
  };

  const handleExportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      stats: realTimeData,
      summary: 'Neural network analysis complete',
    };
    console.log('📈 Report exported:', reportData);
    // In a real app, this would download a file
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleNotificationClick = () => {
    setNotificationCount(0);
    console.log('🔔 Neural notifications center opened');
    // In a real app, this would open a notifications panel
  };

  const handleThemeSettings = () => {
    setThemeDialogOpen(true);
  };

  const handleViewChange = (view: 'dashboard' | 'maps' | 'insights' | 'emergency') => {
    setCurrentView(view);
    console.log(`🌐 Switched to ${view} view`);
    // In a real app, this would navigate or change the main content
  };

  const handleEmergencyMode = () => {
    console.log('🚨 Emergency mode activated - getting location and finding nearest help');
    // Would integrate with emergency SOS feature
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('📍 Current position:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // Find nearest hospital/emergency services
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  if (loading) {
    return (
      <TechLoader
        type="neural"
        size="large"
        text="Loading Neural Dashboard..."
        color={colors.neonPink}
        fullscreen
      />
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `
        radial-gradient(ellipse at top left, ${colors.deepSpace} 0%, transparent 50%),
        radial-gradient(ellipse at bottom right, ${colors.darkBg} 0%, transparent 50%),
        ${colors.deepSpace}
      `,
      p: 3,
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          background: `linear-gradient(135deg, ${colors.darkCard}40, ${colors.carbonFiber}40)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.neonCyan}40`,
          borderRadius: 2,
          p: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <GlitchText 
              text="🌐 NEURAL COMMAND CENTER"
              variant="h4"
              glitchIntensity="low"
            />
            {user && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="body2" sx={{ 
                  color: colors.neonCyan, 
                  opacity: 0.8,
                  fontFamily: '"Roboto Mono", monospace'
                }}>
                  {user.displayName || user.email}
                </Typography>
                <Chip
                  size="small"
                  label={`Mode: ${currentView.toUpperCase()}`}
                  sx={{
                    mt: 0.5,
                    backgroundColor: 'transparent',
                    border: `1px solid ${colors.neonGreen}`,
                    color: colors.neonGreen,
                    fontSize: '0.7em',
                    fontFamily: '"Roboto Mono", monospace'
                  }}
                />
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Quick Navigation Buttons */}
            <Tooltip title="Travel Maps">
              <IconButton 
                onClick={() => handleViewChange('maps')}
                sx={{ 
                  color: currentView === 'maps' ? colors.neonGreen : colors.neonGreen + '80',
                  border: `1px solid ${colors.neonGreen}40`,
                  '&:hover': { 
                    boxShadow: `0 0 15px ${colors.neonGreen}`,
                    border: `1px solid ${colors.neonGreen}`
                  }
                }}
              >
                <TravelExplore />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="AI Insights">
              <IconButton 
                onClick={() => handleViewChange('insights')}
                sx={{ 
                  color: currentView === 'insights' ? colors.neonPurple : colors.neonPurple + '80',
                  border: `1px solid ${colors.neonPurple}40`,
                  '&:hover': { 
                    boxShadow: `0 0 15px ${colors.neonPurple}`,
                    border: `1px solid ${colors.neonPurple}`
                  }
                }}
              >
                <Analytics />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Emergency SOS">
              <IconButton 
                onClick={handleEmergencyMode}
                sx={{ 
                  color: colors.neonOrange,
                  border: `1px solid ${colors.neonOrange}40`,
                  '&:hover': { 
                    boxShadow: `0 0 20px ${colors.neonOrange}`,
                    border: `1px solid ${colors.neonOrange}`,
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Warning />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton 
                onClick={handleNotificationClick}
                sx={{ 
                  color: colors.neonCyan,
                  border: `1px solid ${colors.neonCyan}40`,
                  '&:hover': { 
                    boxShadow: `0 0 15px ${colors.neonCyan}`,
                    border: `1px solid ${colors.neonCyan}`
                  }
                }}
              >
                <Badge badgeContent={notificationCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Age Group & Theme Settings">
              <IconButton 
                onClick={handleThemeSettings}
                sx={{ 
                  color: colors.neonPink,
                  border: `1px solid ${colors.neonPink}40`,
                  '&:hover': { 
                    boxShadow: `0 0 15px ${colors.neonPink}`,
                    border: `1px solid ${colors.neonPink}`
                  }
                }}
              >
                <Palette />
              </IconButton>
            </Tooltip>
            <NeonButton
              glowColor={colors.neonOrange}
              size="small"
              onClick={handleLogout}
            >
              🚪 Logout
            </NeonButton>
            {onClose && (
              <NeonButton
                glowColor={colors.neonGreen}
                size="small"
                onClick={onClose}
              >
                Close
              </NeonButton>
            )}
          </Box>
        </Box>
      </motion.div>

      {/* Real-time Stats Row */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { 
              title: 'Active Trips', 
              value: realTimeData.currentTrips, 
              unit: '',
              color: colors.neonCyan,
              icon: <Map />
            },
            { 
              title: 'Distance Today', 
              value: realTimeData.todayDistance.toFixed(1), 
              unit: 'km',
              color: colors.neonGreen,
              icon: <Speed />
            },
            { 
              title: 'Weekly Goal', 
              value: realTimeData.weeklyGoal.toFixed(0), 
              unit: '%',
              color: colors.neonOrange,
              icon: <TrendingUp />
            },
            { 
              title: 'AI Accuracy', 
              value: realTimeData.aiAccuracy.toFixed(1), 
              unit: '%',
              color: colors.neonPink,
              icon: <Psychology />
            },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <HolographicCard
                glowColor={stat.color}
                intensity="medium"
                animated
                sx={{ p: 3, textAlign: 'center', height: '140px' }}
              >
                <Box sx={{ position: 'relative', zIndex: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 1,
                    color: stat.color
                  }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h3" sx={{ 
                    color: stat.color,
                    mb: 0.5,
                    textShadow: `0 0 10px ${stat.color}`
                  }}>
                    {stat.value}<small style={{ fontSize: '0.6em' }}>{stat.unit}</small>
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {stat.title}
                  </Typography>
                </Box>
              </HolographicCard>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Travel Trends Chart */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <HolographicCard
              glowColor={colors.neonBlue}
              intensity="high"
              sx={{ p: 3, height: '400px' }}
            >
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: colors.neonBlue,
                  mb: 3
                }}>
                  📈 Neural Travel Analytics
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={travelData}>
                    <defs>
                      <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.neonCyan} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={colors.neonCyan} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.neonPink} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={colors.neonPink} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.neonCyan} opacity={0.3} />
                    <XAxis dataKey="month" stroke={colors.neonCyan} />
                    <YAxis stroke={colors.neonCyan} />
                    <RechartsTooltip 
                      contentStyle={{ 
                        background: colors.darkCard, 
                        border: `1px solid ${colors.neonCyan}`,
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                    <Area
                      type="monotone"
                      dataKey="trips"
                      stroke={colors.neonCyan}
                      fillOpacity={1}
                      fill="url(#colorTrips)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="distance"
                      stroke={colors.neonPink}
                      fillOpacity={1}
                      fill="url(#colorDistance)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </HolographicCard>
          </motion.div>
        </Grid>

        {/* Transport Mode Distribution */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <HolographicCard
              glowColor={colors.neonGreen}
              intensity="high"
              sx={{ p: 3, height: '400px' }}
            >
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: colors.neonGreen,
                  mb: 3
                }}>
                  🚶 Transport Modes
                </Typography>
                {transportModes.map((mode, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ color: mode.color }}>
                        {mode.mode}
                      </Typography>
                      <Typography variant="body1" sx={{ color: mode.color }}>
                        {mode.value}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={mode.value}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: `${mode.color}20`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: mode.color,
                          borderRadius: 4,
                          boxShadow: `0 0 10px ${mode.color}`,
                        },
                      }}
                    />
                  </Box>
                ))}
                <Chip
                  label="🎯 Sustainability Score: 87%"
                  sx={{
                    mt: 2,
                    color: colors.neonGreen,
                    border: `1px solid ${colors.neonGreen}`,
                    backgroundColor: 'transparent',
                    '& .MuiChip-label': {
                      color: colors.neonGreen,
                    },
                  }}
                />
              </Box>
            </HolographicCard>
          </motion.div>
        </Grid>

        {/* AI Predictions Radar */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          >
            <HolographicCard
              glowColor={colors.neonPurple}
              intensity="high"
              sx={{ p: 3, height: '400px' }}
            >
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: colors.neonPurple,
                  mb: 3
                }}>
                  🧠 AI Performance Matrix
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={aiPredictions}>
                    <PolarGrid stroke={colors.neonPurple} opacity={0.4} />
                    <PolarAngleAxis dataKey="category" stroke={colors.neonPurple} />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      stroke={colors.neonPurple}
                      tick={false}
                    />
                    <Radar
                      name="Current"
                      dataKey="current"
                      stroke={colors.neonCyan}
                      fill={colors.neonCyan}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Predicted"
                      dataKey="predicted"
                      stroke={colors.neonPink}
                      fill={colors.neonPink}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <RechartsTooltip 
                      contentStyle={{ 
                        background: colors.darkCard, 
                        border: `1px solid ${colors.neonPurple}`,
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </HolographicCard>
          </motion.div>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
          >
            <HolographicCard
              glowColor={colors.neonOrange}
              intensity="high"
              sx={{ p: 3, height: '400px', overflow: 'auto' }}
            >
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: colors.neonOrange,
                  mb: 3
                }}>
                  ⚡ Neural Activity Feed
                </Typography>
                {[
                  { time: '14:32', event: 'Trip detected: Home → Office', type: 'detection' },
                  { time: '13:45', event: 'New achievement unlocked: Speed Demon', type: 'achievement' },
                  { time: '12:20', event: 'AI prediction accuracy improved', type: 'improvement' },
                  { time: '11:15', event: 'Weekly goal progress: 78%', type: 'progress' },
                  { time: '10:30', event: 'Sustainable route suggested', type: 'suggestion' },
                  { time: '09:45', event: 'Data sync completed', type: 'system' },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05, ease: "easeOut" }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      p: 2,
                      border: `1px solid ${colors.neonOrange}30`,
                      borderRadius: 2,
                      background: `${colors.darkCard}40`,
                      '&:hover': {
                        border: `1px solid ${colors.neonOrange}60`,
                        background: `${colors.darkCard}60`,
                      }
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: colors.neonOrange,
                        minWidth: '50px',
                        fontFamily: '"Roboto Mono", monospace'
                      }}>
                        {activity.time}
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 2, flex: 1 }}>
                        {activity.event}
                      </Typography>
                      <Chip
                        size="small"
                        label={activity.type}
                        sx={{
                          color: colors.neonOrange,
                          border: `1px solid ${colors.neonOrange}`,
                          backgroundColor: 'transparent',
                          fontSize: '0.7em',
                        }}
                      />
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </HolographicCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* Action Panel */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 3, 
          mt: 4, 
          flexWrap: 'wrap' 
        }}>
          <NeonButton
            glowColor={colors.neonCyan}
            borderAnimation={isSyncing}
            disabled={isSyncing}
            startIcon={<Refresh />}
            onClick={handleSyncData}
          >
            {isSyncing ? 'Syncing...' : 'Sync Data'}
          </NeonButton>
          <NeonButton
            glowColor={colors.neonPink}
            pulseAnimation={isTraining}
            disabled={isTraining}
            startIcon={<Psychology />}
            onClick={handleTrainAI}
          >
            {isTraining ? 'Training...' : 'Train AI'}
          </NeonButton>
          <NeonButton
            glowColor={colors.neonGreen}
            startIcon={<Timeline />}
            onClick={handleExportReport}
          >
            Export Report
          </NeonButton>
        </Box>
      </motion.div>
      
      {/* Theme Settings Dialog */}
      <AgeGroupThemePanel 
        open={themeDialogOpen}
        onClose={() => setThemeDialogOpen(false)}
      />
    </Box>
  );
};

const TechDashboard = React.memo(TechDashboardBase);
TechDashboard.displayName = 'TechDashboard';

export default TechDashboard;
