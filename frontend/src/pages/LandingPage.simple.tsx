import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  FlightTakeoff,
  PhotoCamera,
  Explore,
  TravelExplore,
  Public,
  GpsFixed,
  Map,
  Timeline,
  CloudQueue,
  StarRate,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { travelColors } from '../styles/travelTheme';

const SimpleLandingPage: React.FC = () => {
  const navigate = useNavigate();

  const typewriterMessages = [
    'Track Every Step of Your Journey 🚶‍♂️',
    'Discover Hidden Gems Around the World 🌍',
    'Map Your Adventures in Real-Time 🗺️',
    'Share Your Travel Stories 📸',
    'Create Memories That Last Forever ✨'
  ];

  const features = [
    {
      icon: <GpsFixed fontSize="large" />,
      title: 'Live GPS Tracking',
      description: 'Track your adventures in real-time with precise GPS coordinates and route mapping.',
      color: travelColors.primary.ocean,
      badge: 'NEW'
    },
    {
      icon: <Map fontSize="large" />,
      title: 'Interactive Route Maps', 
      description: 'Visualize your journey with FROM/TO markers and complete route paths on interactive maps.',
      color: travelColors.primary.forest,
      badge: 'FEATURED'
    },
    {
      icon: <CloudQueue fontSize="large" />,
      title: 'Weather Integration',
      description: 'Get real-time weather data for your destinations and plan the perfect adventure.',
      color: travelColors.primary.sky,
      badge: null
    },
    {
      icon: <Timeline fontSize="large" />,
      title: 'Adventure Timeline',
      description: 'Document every step of your journey with timestamps and detailed location data.',
      color: travelColors.primary.sunset,
      badge: null
    },
  ];

  const stats = [
    { number: '10K+', label: 'Adventures Tracked', icon: '🗺️' },
    { number: '50K+', label: 'Miles Explored', icon: '🚶‍♂️' },
    { number: '25+', label: 'Countries Visited', icon: '🌍' },
    { number: '99%', label: 'Happy Travelers', icon: '⭐' },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      position: 'relative',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.sky}15 100%)`,
    }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
        }}>
          {/* Travel Icons Background */}
          <Box sx={{
            position: 'absolute',
            top: -20,
            right: { xs: 10, md: 50 },
            fontSize: { xs: '2rem', md: '3rem' },
            opacity: 0.4,
            animation: 'float 4s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '25%': { transform: 'translateY(-15px) rotate(2deg)' },
              '50%': { transform: 'translateY(-20px) rotate(0deg)' },
              '75%': { transform: 'translateY(-10px) rotate(-2deg)' }
            }
          }}>
            ✈️🏔️🌍
          </Box>
          
          {/* Additional Floating Icons */}
          <Box sx={{
            position: 'absolute',
            top: -10,
            left: { xs: 10, md: 50 },
            fontSize: { xs: '1.5rem', md: '2.5rem' },
            opacity: 0.3,
            animation: 'floatReverse 5s ease-in-out infinite',
            '@keyframes floatReverse': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '33%': { transform: 'translateY(-10px) rotate(-3deg)' },
              '66%': { transform: 'translateY(-18px) rotate(3deg)' }
            }
          }}>
            🗺️📸✨
          </Box>

          {/* Main Title */}
          <Typography variant="h1" gutterBottom sx={{ 
            fontSize: { xs: '3.5rem', md: '5.5rem' },
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            color: travelColors.primary.ocean,
            mb: 2,
            position: 'relative',
            animation: 'titleGlow 3s ease-in-out infinite alternate',
            '@keyframes titleGlow': {
              '0%': {
                textShadow: `0 0 20px ${travelColors.primary.ocean}40`,
                transform: 'scale(1)'
              },
              '100%': {
                textShadow: `0 0 30px ${travelColors.primary.ocean}60, 0 0 40px ${travelColors.primary.sunset}30`,
                transform: 'scale(1.02)'
              }
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 100,
              height: 4,
              background: `linear-gradient(90deg, ${travelColors.primary.ocean}, ${travelColors.primary.forest})`,
              borderRadius: 2,
              animation: 'underlineGlow 2s ease-in-out infinite alternate',
              '@keyframes underlineGlow': {
                '0%': { width: 100, opacity: 0.8 },
                '100%': { width: 120, opacity: 1 }
              }
            }
          }}>
            🌍 Travelogy
          </Typography>

          {/* Beautiful Subtitle */}
          <Typography variant="h4" gutterBottom sx={{ 
            mb: 3, 
            color: travelColors.primary.forest,
            fontFamily: '"Inter", sans-serif',
            fontWeight: 300
          }}>
            Your Adventure Starts Here
          </Typography>

          <Typography variant="body1" sx={{ 
            mb: 4, 
            color: travelColors.text.primary,
            opacity: 0.8,
            maxWidth: 700,
            mx: 'auto',
            lineHeight: 1.8,
            fontSize: '1.1rem'
          }}>
            Experience the future of travel with real-time GPS tracking, interactive maps, and seamless weather integration. 
            Every step of your journey matters. 🌟
          </Typography>

          {/* New Stats Row */}
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 2, md: 4 }, 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            mb: 6,
            px: 2
          }}>
            {stats.map((stat, index) => (
              <Box key={index} sx={{ 
                textAlign: 'center',
                minWidth: { xs: '120px', md: '140px' }
              }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  color: travelColors.primary.ocean,
                  mb: 0.5
                }}>
                  {stat.icon} {stat.number}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: travelColors.text.secondary,
                  fontSize: '0.85rem'
                }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            mb: 4 
          }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<GpsFixed />}
              onClick={() => navigate('/adventures')}
              sx={{
                px: 6,
                py: 2,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 600,
                backgroundColor: travelColors.primary.ocean,
                boxShadow: `0 8px 32px ${travelColors.primary.ocean}40`,
                animation: 'buttonPulse 3s ease-in-out infinite',
                '@keyframes buttonPulse': {
                  '0%, 100%': {
                    transform: 'scale(1)',
                    boxShadow: `0 8px 32px ${travelColors.primary.ocean}40`
                  },
                  '50%': {
                    transform: 'scale(1.05)',
                    boxShadow: `0 12px 40px ${travelColors.primary.ocean}60`
                  }
                },
                '&:hover': {
                  backgroundColor: travelColors.primary.forest,
                  transform: 'translateY(-3px) scale(1.1)',
                  boxShadow: `0 16px 50px ${travelColors.primary.ocean}80`,
                  animation: 'none'
                },
                transition: 'all 0.3s ease'
              }}
            >
              🚀 Start GPS Tracking
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Map />}
              onClick={() => navigate('/weather')}
              sx={{
                px: 6,
                py: 2,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderColor: travelColors.primary.forest,
                color: travelColors.primary.forest,
                borderWidth: 2,
                '&:hover': {
                  borderColor: travelColors.primary.ocean,
                  backgroundColor: `${travelColors.primary.ocean}10`,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 8px 24px ${travelColors.primary.forest}20`,
                },
                transition: 'all 0.3s ease'
              }}
            >
              🌤️ Explore Weather
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Features Grid */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ 
            color: travelColors.primary.ocean,
            fontFamily: '"Playfair Display", serif',
            fontWeight: 600,
            mb: 3
          }}>
            🌟 Why Choose Travelogy?
          </Typography>
          <Typography variant="h6" sx={{
            color: travelColors.text.secondary,
            maxWidth: 600,
            mx: 'auto',
            opacity: 0.9
          }}>
            Experience the future of travel tracking with cutting-edge GPS technology
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <Card sx={{ 
                height: '100%',
                textAlign: 'center',
                p: 3,
                position: 'relative',
                borderRadius: 3,
                border: `2px solid ${feature.color}20`,
                background: `linear-gradient(135deg, ${feature.color}08 0%, transparent 100%)`,
                transition: 'all 0.4s ease',
                '&:hover': {
                  transform: 'translateY(-12px) scale(1.02)',
                  boxShadow: `0 20px 40px ${feature.color}30`,
                  border: `2px solid ${feature.color}40`,
                },
              }}>
                {feature.badge && (
                  <Chip 
                    label={feature.badge}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      backgroundColor: feature.color,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                )}
                
                <CardContent sx={{ pt: feature.badge ? 3 : 2 }}>
                  <Avatar sx={{ 
                    bgcolor: `${feature.color}20`,
                    color: feature.color,
                    width: 70,
                    height: 70,
                    mx: 'auto',
                    mb: 3,
                    fontSize: '2rem'
                  }}>
                    {feature.icon}
                  </Avatar>
                  
                  <Typography variant="h6" gutterBottom sx={{
                    color: travelColors.text.primary,
                    fontWeight: 600,
                    mb: 2
                  }}>
                    {feature.title}
                  </Typography>
                  
                  <Typography variant="body2" sx={{
                    color: travelColors.text.secondary,
                    lineHeight: 1.6,
                    px: 1
                  }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ 
            color: travelColors.primary.ocean,
            fontFamily: '"Playfair Display", serif',
            fontWeight: 600,
            mb: 2
          }}>
            💬 What Travelers Say
          </Typography>
          <Typography variant="h6" sx={{
            color: travelColors.text.secondary,
            maxWidth: 600,
            mx: 'auto',
            opacity: 0.9
          }}>
            Join thousands of adventurers who trust Travelogy for their journeys
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              textAlign: 'center',
              p: 3,
              borderRadius: 3,
              border: `2px solid ${travelColors.primary.sky}30`,
              background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.primary.sky}08 100%)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: `0 16px 32px ${travelColors.primary.sky}20`,
              },
            }}>
              <CardContent>
                <Avatar sx={{ 
                  bgcolor: travelColors.primary.sky,
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 3,
                  fontSize: '1.5rem'
                }}>
                  😊
                </Avatar>
                <Typography variant="body1" sx={{
                  color: travelColors.text.primary,
                  mb: 2,
                  fontStyle: 'italic',
                  lineHeight: 1.6
                }}>
                  "Amazing GPS tracking! I never lose track of my hiking routes anymore. The map visualization is incredible."
                </Typography>
                <Typography variant="h6" sx={{
                  color: travelColors.primary.ocean,
                  fontWeight: 600,
                  mb: 1
                }}>
                  Sarah Chen
                </Typography>
                <Typography variant="body2" sx={{
                  color: travelColors.text.secondary
                }}>
                  🏄‍♀️ Adventure Photographer
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              textAlign: 'center',
              p: 3,
              borderRadius: 3,
              border: `2px solid ${travelColors.primary.sunset}30`,
              background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.primary.sunset}08 100%)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: `0 16px 32px ${travelColors.primary.sunset}20`,
              },
            }}>
              <CardContent>
                <Avatar sx={{ 
                  bgcolor: travelColors.primary.sunset,
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 3,
                  fontSize: '1.5rem'
                }}>
                  😄
                </Avatar>
                <Typography variant="body1" sx={{
                  color: travelColors.text.primary,
                  mb: 2,
                  fontStyle: 'italic',
                  lineHeight: 1.6
                }}>
                  "The weather integration saved my camping trip! Real-time alerts helped me avoid a storm."
                </Typography>
                <Typography variant="h6" sx={{
                  color: travelColors.primary.ocean,
                  fontWeight: 600,
                  mb: 1
                }}>
                  Mike Rodriguez
                </Typography>
                <Typography variant="body2" sx={{
                  color: travelColors.text.secondary
                }}>
                  🏅 Mountain Climber
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              textAlign: 'center',
              p: 3,
              borderRadius: 3,
              border: `2px solid ${travelColors.primary.forest}30`,
              background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.primary.forest}08 100%)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: `0 16px 32px ${travelColors.primary.forest}20`,
              },
            }}>
              <CardContent>
                <Avatar sx={{ 
                  bgcolor: travelColors.primary.forest,
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 3,
                  fontSize: '1.5rem'
                }}>
                  😍
                </Avatar>
                <Typography variant="body1" sx={{
                  color: travelColors.text.primary,
                  mb: 2,
                  fontStyle: 'italic',
                  lineHeight: 1.6
                }}>
                  "Perfect for documenting family road trips. The kids love seeing our route on the map!"
                </Typography>
                <Typography variant="h6" sx={{
                  color: travelColors.primary.ocean,
                  fontWeight: 600,
                  mb: 1
                }}>
                  Emily Parker
                </Typography>
                <Typography variant="body2" sx={{
                  color: travelColors.text.secondary
                }}>
                  🚗 Family Traveler
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{
          textAlign: 'center',
          background: `linear-gradient(135deg, ${travelColors.primary.ocean}15 0%, ${travelColors.primary.forest}15 100%)`,
          borderRadius: 4,
          p: { xs: 6, md: 8 },
          border: `2px solid ${travelColors.primary.ocean}20`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <Box sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            fontSize: '4rem',
            opacity: 0.05,
            transform: 'rotate(15deg)'
          }}>
            🏎️🗺️🌍
          </Box>
          
          <Typography variant="h3" gutterBottom sx={{
            color: travelColors.primary.ocean,
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            mb: 3
          }}>
            🎆 Ready for Your Next Adventure?
          </Typography>
          
          <Typography variant="h6" sx={{ 
            mb: 6, 
            color: travelColors.text.primary,
            opacity: 0.9,
            maxWidth: 700,
            mx: 'auto',
            lineHeight: 1.6
          }}>
            Join thousands of travelers who trust Travelogy to track, map, and cherish their adventures. 
            Start your GPS-powered journey today! 🚀
          </Typography>
          
          <Box sx={{
            display: 'flex',
            gap: 3,
            justifyContent: 'center',
            flexWrap: 'wrap',
            mb: 4
          }}>
            <Button
              variant="contained"
              size="large" 
              startIcon={<TravelExplore />}
              onClick={() => navigate('/adventures')}
              sx={{
                px: 8,
                py: 2.5,
                borderRadius: 4,
                fontSize: '1.2rem',
                fontWeight: 700,
                backgroundColor: travelColors.primary.ocean,
                boxShadow: `0 12px 40px ${travelColors.primary.ocean}40`,
                '&:hover': {
                  backgroundColor: travelColors.primary.forest,
                  transform: 'translateY(-4px) scale(1.05)',
                  boxShadow: `0 16px 50px ${travelColors.primary.ocean}60`,
                },
                transition: 'all 0.3s ease'
              }}
            >
              🚀 Start Adventure Now
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowForward />}
              onClick={() => navigate('/dashboard')}
              sx={{
                px: 8,
                py: 2.5,
                borderRadius: 4,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderColor: travelColors.primary.sunset,
                color: travelColors.primary.sunset,
                borderWidth: 2,
                '&:hover': {
                  borderColor: travelColors.primary.ocean,
                  backgroundColor: `${travelColors.primary.sunset}10`,
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 30px ${travelColors.primary.sunset}30`,
                },
                transition: 'all 0.3s ease'
              }}
            >
              🏠 View Dashboard
            </Button>
          </Box>
          
          {/* Trust indicators */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 4,
            flexWrap: 'wrap',
            mt: 4,
            pt: 3,
            borderTop: `1px solid ${travelColors.primary.ocean}20`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarRate sx={{ color: travelColors.primary.sunset, fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ color: travelColors.text.secondary, fontWeight: 600 }}>
                4.9/5 Rating
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GpsFixed sx={{ color: travelColors.primary.ocean, fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ color: travelColors.text.secondary, fontWeight: 600 }}>
                Real-time GPS
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Public sx={{ color: travelColors.primary.forest, fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ color: travelColors.text.secondary, fontWeight: 600 }}>
                Global Coverage
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
      
      {/* Footer */}
      <Box sx={{
        backgroundColor: travelColors.primary.ocean,
        color: 'white',
        py: 6,
        mt: 8
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" gutterBottom sx={{ 
                fontFamily: '"Playfair Display", serif',
                fontWeight: 600,
                mb: 3
              }}>
                🌍 Travelogy
              </Typography>
              <Typography variant="body1" sx={{ 
                opacity: 0.9,
                lineHeight: 1.6,
                mb: 3
              }}>
                Your ultimate companion for tracking, planning, and sharing unforgettable travel adventures around the world.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}>
                  📱
                </Box>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}>
                  📧
                </Box>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}>
                  🌐
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Features
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                  GPS Tracking
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                  Route Maps
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                  Weather Data
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                  Photo Memories
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Support
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography 
                  variant="body2" 
                  sx={{ opacity: 0.8, cursor: 'pointer', '&:hover': { opacity: 1 } }}
                  onClick={() => navigate('/contact')}
                >
                  Contact Us
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                  Help Center
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                  Privacy Policy
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                  Terms of Service
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Start Your Journey
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                Ready to begin tracking your adventures? Join thousands of travelers worldwide.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/adventures')}
                  sx={{
                    backgroundColor: travelColors.primary.sunset,
                    color: 'white',
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: travelColors.primary.coral,
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  🚀 Get Started
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/weather')}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    px: 3,
                    py: 1,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  🌤️ Check Weather
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © 2024 Travelogy. Made with ❤️ for adventurers worldwide. 🌍
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default SimpleLandingPage;