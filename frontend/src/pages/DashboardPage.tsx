import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  DirectionsCar,
  DirectionsWalk,
  DirectionsBike,
  DirectionsTransit,
  NaturePeople,
  LocationOn,
  TrendingUp,
  Add as AddIcon,
  FlightTakeoff,
  PhotoCamera,
  Explore,
  Map,
  EmojiEvents,
  Timeline,
  TravelExplore,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { tripsAPI, gamificationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { travelColors } from '../styles/travelTheme';
import TravelCard from '../components/TravelCard';
import AdventureButton from '../components/AdventureButton';
import TravelText from '../components/TravelText';

interface DashboardStats {
  total_trips: number;
  total_distance: number;
  total_duration: number;
  most_used_mode: string;
  trips_this_week: number;
  eco_score: number;
  mode_breakdown: Record<string, number>;
}

interface GamificationProfile {
  points: {
    total: number;
    level: number;
    current_streak: number;
    longest_streak: number;
  };
  badges: Array<{
    name: string;
    description: string;
    icon: string;
    color: string;
  }>;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [gamification, setGamification] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTrip, setActiveTrip] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, gamificationRes] = await Promise.all([
          tripsAPI.getStats(),
          gamificationAPI.getProfile(),
        ]);
        
        setStats(statsRes);
        setGamification(gamificationRes);

        // Check for active trip
        try {
          const activeTripRes = await tripsAPI.getActiveTrip();
          setActiveTrip(activeTripRes);
        } catch (error) {
          // No active trip, which is fine
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'walk': return <DirectionsWalk />;
      case 'cycle': return <DirectionsBike />;
      case 'car': return <DirectionsCar />;
      case 'bus':
      case 'metro': return <DirectionsTransit />;
      default: return <LocationOn />;
    }
  };

  const handleStartTrip = () => {
    navigate('/trips?action=start');
  };

  const handleCompleteTrip = () => {
    navigate('/trips?action=complete');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.sky}10 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, ${travelColors.primary.sunset}08 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '3%',
          width: '250px',
          height: '250px',
          background: `radial-gradient(circle, ${travelColors.primary.ocean}08 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <TravelText
                text="Travel Dashboard"
                textVariant="adventure"
                animated
                variant="h3"
                sx={{ mb: 1 }}
              />
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: travelColors.text.secondary,
                  fontStyle: 'italic' 
                }}
              >
                Your journey statistics and adventures await
              </Typography>
            </Box>
            {activeTrip ? (
              <AdventureButton
                buttonVariant="coral"
                startIcon={<LocationOn />}
                onClick={handleCompleteTrip}
                size="large"
                adventure
              >
                Complete Active Trip
              </AdventureButton>
            ) : (
              <AdventureButton
                buttonVariant="ocean"
                startIcon={<FlightTakeoff />}
                onClick={handleStartTrip}
                size="large"
                adventure
              >
                Start New Adventure
              </AdventureButton>
            )}
          </Box>

          {/* Active Trip Alert */}
          {activeTrip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <TravelCard 
                cardVariant="sunset"
                cardElevation="high"
                borderAccent
                sx={{ p: 3, mb: 4 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TravelExplore sx={{ fontSize: 40, color: travelColors.primary.sunset, mr: 2 }} />
                  <TravelText
                    text="Adventure in Progress!"
                    textVariant="wanderlust"
                    animated
                    variant="h5"
                  />
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ color: travelColors.text.primary, mb: 1 }}
                >
                  Started: {new Date(activeTrip.start_time).toLocaleTimeString()}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ color: travelColors.text.primary }}
                >
                  Mode: {activeTrip.transport_mode}
                </Typography>
              </TravelCard>
            </motion.div>
          )}

          <Grid container spacing={3}>
            {/* Quick Stats */}
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <TravelCard cardVariant="ocean" cardElevation="medium" borderAccent>
                  <Box sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Map sx={{ fontSize: 32, color: travelColors.primary.ocean, mr: 1 }} />
                      <Typography 
                        variant="h6" 
                        sx={{ color: travelColors.text.primary, fontWeight: 'bold' }}
                      >
                        Total Adventures
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h2" 
                      component="div" 
                      sx={{ 
                        color: travelColors.primary.ocean, 
                        fontWeight: 'bold',
                        mb: 1 
                      }}
                    >
                      {stats?.total_trips || 0}
                    </Typography>
                    <Typography sx={{ color: travelColors.text.secondary }}>
                      {stats?.trips_this_week || 0} this week
                    </Typography>
                  </Box>
                </TravelCard>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <TravelCard cardVariant="sunset" cardElevation="medium" borderAccent>
                  <Box sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Timeline sx={{ fontSize: 32, color: travelColors.primary.sunset, mr: 1 }} />
                      <Typography 
                        variant="h6" 
                        sx={{ color: travelColors.text.primary, fontWeight: 'bold' }}
                      >
                        Distance
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h2" 
                      component="div" 
                      sx={{ 
                        color: travelColors.primary.sunset, 
                        fontWeight: 'bold',
                        mb: 1 
                      }}
                    >
                      {Math.round(stats?.total_distance || 0)}
                    </Typography>
                    <Typography sx={{ color: travelColors.text.secondary }}>
                      kilometers traveled
                    </Typography>
                  </Box>
                </TravelCard>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <TravelCard cardVariant="forest" cardElevation="medium" borderAccent>
                  <Box sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <NaturePeople sx={{ fontSize: 32, color: travelColors.primary.forest, mr: 1 }} />
                      <Typography 
                        variant="h6" 
                        sx={{ color: travelColors.text.primary, fontWeight: 'bold' }}
                      >
                        Eco Score
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h2" 
                      component="div" 
                      sx={{ 
                        color: travelColors.primary.forest, 
                        fontWeight: 'bold',
                        mb: 1 
                      }}
                    >
                      {stats?.eco_score || 0}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats?.eco_score || 0} 
                      sx={{ 
                        mt: 1, 
                        bgcolor: `${travelColors.primary.forest}20`,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: travelColors.primary.forest
                        }
                      }}
                    />
                  </Box>
                </TravelCard>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <TravelCard cardVariant="default" cardElevation="medium" borderAccent>
                  <Box sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <EmojiEvents sx={{ fontSize: 32, color: travelColors.primary.coral, mr: 1 }} />
                      <Typography 
                        variant="h6" 
                        sx={{ color: travelColors.text.primary, fontWeight: 'bold' }}
                      >
                        Level {gamification?.points.level || 1}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h2" 
                      component="div" 
                      sx={{ 
                        color: travelColors.primary.coral, 
                        fontWeight: 'bold',
                        mb: 1 
                      }}
                    >
                      {gamification?.points.total || 0}
                    </Typography>
                    <Typography sx={{ color: travelColors.text.secondary }}>
                      adventure points
                    </Typography>
                  </Box>
                </TravelCard>
              </motion.div>
            </Grid>

            {/* Transport Mode Breakdown */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <TravelCard cardVariant="ocean" cardElevation="medium" borderAccent>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <DirectionsTransit sx={{ fontSize: 28, color: travelColors.primary.sky, mr: 2 }} />
                      <TravelText
                        text="Travel Modes"
                        textVariant="gradient"
                        variant="h6"
                      />
                    </Box>
                    <Box>
                      {stats?.mode_breakdown && Object.entries(stats.mode_breakdown).map(([mode, count]) => (
                        <Box key={mode} display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                          <Box display="flex" alignItems="center">
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: '8px',
                                bgcolor: `${travelColors.primary.ocean}15`,
                                mr: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {getModeIcon(mode)}
                            </Box>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                textTransform: 'capitalize',
                                color: travelColors.text.primary,
                                fontWeight: 500
                              }}
                            >
                              {mode}
                            </Typography>
                          </Box>
                          <Chip 
                            label={count} 
                            size="small" 
                            sx={{
                              bgcolor: travelColors.primary.ocean,
                              color: travelColors.text.white,
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                      ))}
                      {!stats?.mode_breakdown && (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <Explore sx={{ fontSize: 48, color: travelColors.primary.sky, mb: 2 }} />
                          <Typography 
                            sx={{ 
                              color: travelColors.text.secondary,
                              fontStyle: 'italic'
                            }}
                          >
                            No adventures recorded yet. Start your first journey to see your travel patterns!
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </TravelCard>
              </motion.div>
            </Grid>

            {/* Recent Achievements */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <TravelCard cardVariant="sunset" cardElevation="medium" borderAccent>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <EmojiEvents sx={{ fontSize: 28, color: travelColors.primary.coral, mr: 2 }} />
                      <TravelText
                        text="Recent Achievements"
                        textVariant="wanderlust"
                        variant="h6"
                      />
                    </Box>
                    <Box>
                      {gamification?.badges && gamification.badges.slice(0, 3).map((badge, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.7 + (index * 0.1) }}
                        >
                          <Box display="flex" alignItems="center" mb={3}>
                            <Box 
                              sx={{
                                width: 50,
                                height: 50,
                                borderRadius: '50%',
                                bgcolor: badge.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 3,
                                boxShadow: travelColors.shadows.soft
                              }}
                            >
                              <Typography variant="h5">{badge.icon}</Typography>
                            </Box>
                            <Box>
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  color: travelColors.text.primary,
                                  fontWeight: 'bold',
                                  mb: 0.5
                                }}
                              >
                                {badge.name}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ color: travelColors.text.secondary }}
                              >
                                {badge.description}
                              </Typography>
                            </Box>
                          </Box>
                        </motion.div>
                      ))}
                      {!gamification?.badges?.length && (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <PhotoCamera sx={{ fontSize: 48, color: travelColors.primary.coral, mb: 2 }} />
                          <Typography 
                            sx={{ 
                              color: travelColors.text.secondary,
                              fontStyle: 'italic'
                            }}
                          >
                            Complete more adventures to unlock achievements!
                          </Typography>
                        </Box>
                      )}
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

export default DashboardPage;