import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Paper,
  Stack,
  alpha
} from '@mui/material';
import {
  GpsFixed,
  Map,
  CloudQueue,
  PhotoCamera,
  FlightTakeoff,
  Timeline,
  Star,
  ArrowForward,
  PlayArrow
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// Color scheme
const travelColors = {
  primary: {
    ocean: '#1976d2',
    sky: '#03a9f4',
    forest: '#388e3c',
    sunset: '#ff5722'
  },
  text: {
    primary: '#1a1a1a',
    secondary: '#666666'
  }
};

// Styled components for flip cards with pure CSS
const FlipCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'transparent',
  width: '100%',
  height: '100%',
  perspective: '1000px',
  cursor: 'pointer'
}));

const FlipCardInner = styled(Box)(() => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  textAlign: 'center',
  transformStyle: 'preserve-3d',
  transition: 'transform 0.6s cubic-bezier(0.15, 0.85, 0.35, 1)',
  // Ensure the inner container fills the space to maintain hover area
  transformOrigin: 'center center'
}));

const FlipCardFace = styled(Card)(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  WebkitBackfaceVisibility: 'hidden',
  backfaceVisibility: 'hidden',
  borderRadius: '16px',
  // Prevent text selection to avoid hover issues
  userSelect: 'none',
  WebkitUserSelect: 'none',
  // Ensure proper layering
  zIndex: 1
}));

const FlipCardFront = styled(FlipCardFace)(() => ({
  transform: 'rotateY(0deg)',
  zIndex: 2
}));

const FlipCardBack = styled(FlipCardFace)(() => ({
  transform: 'rotateY(180deg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1
}));

// Animated background
const AnimatedBackground = styled(Box)(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  zIndex: -1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: `conic-gradient(from 0deg at 50% 50%, 
      ${alpha(travelColors.primary.ocean, 0.1)} 0deg, 
      ${alpha(travelColors.primary.sky, 0.1)} 90deg, 
      ${alpha(travelColors.primary.forest, 0.1)} 180deg, 
      ${alpha(travelColors.primary.sunset, 0.1)} 270deg, 
      ${alpha(travelColors.primary.ocean, 0.1)} 360deg)`,
    animation: 'rotate 20s linear infinite'
  },
  '@keyframes rotate': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  }
}));

// Floating animation for hero elements
const FloatingBox = styled(Box)(() => ({
  animation: 'float 6s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' }
  }
}));

const PulsingAvatar = styled(Avatar)(({ color }: { color: string }) => ({
  animation: 'pulse 2s ease-in-out infinite',
  '@keyframes pulse': {
    '0%, 100%': { transform: 'scale(1)', boxShadow: `0 0 0 0 ${alpha(color, 0.4)}` },
    '50%': { transform: 'scale(1.05)', boxShadow: `0 0 0 20px ${alpha(color, 0)}` }
  }
}));

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      id: 0,
      icon: <GpsFixed fontSize="large" />,
      title: 'Live GPS Tracking',
      description: 'Track your adventures in real-time with precise GPS coordinates and route mapping.',
      color: travelColors.primary.ocean,
      backTitle: 'Real-Time Precision',
      backContent: 'Start tracking your location instantly with our advanced GPS technology. Never lose track of your path again!'
    },
    {
      id: 1,
      icon: <Map fontSize="large" />,
      title: 'Interactive Route Maps',
      description: 'Visualize your journey with FROM/TO markers and complete route paths on interactive maps.',
      color: travelColors.primary.forest,
      backTitle: 'Beautiful Visualization',
      backContent: 'See your entire journey mapped out beautifully with start/end markers and full route visualization.'
    },
    {
      id: 2,
      icon: <CloudQueue fontSize="large" />,
      title: 'Weather Integration',
      description: 'Get real-time weather data for your destinations and plan the perfect adventure.',
      color: travelColors.primary.sky,
      backTitle: 'Weather Intelligence',
      backContent: 'Stay ahead of weather changes with real-time updates and forecasts for your travel destinations.'
    },
    {
      id: 3,
      icon: <PhotoCamera fontSize="large" />,
      title: 'Photo Memories',
      description: 'Capture and organize your travel photos with location data and timeline views.',
      color: travelColors.primary.sunset,
      backTitle: 'Memory Keeper',
      backContent: 'Create lasting memories by organizing photos with GPS coordinates and timestamps automatically.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Adventure Photographer',
      content: 'Travelogy transformed how I document my adventures. The GPS tracking is incredibly accurate!',
      rating: 5,
      avatar: '👩‍📸'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Solo Traveler',
      content: 'Best travel tracking app I\'ve ever used. The maps are beautiful and the interface is intuitive.',
      rating: 5,
      avatar: '🧑‍💻'
    },
    {
      name: 'Emma Wilson',
      role: 'Travel Blogger',
      content: 'The photo organization with location data is a game-changer for my travel blog content.',
      rating: 5,
      avatar: '✍️'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, 
        ${alpha(travelColors.primary.ocean, 0.05)} 0%, 
        ${alpha(travelColors.primary.sky, 0.05)} 25%,
        ${alpha(travelColors.primary.forest, 0.05)} 50%,
        ${alpha(travelColors.primary.sunset, 0.05)} 75%,
        ${alpha(travelColors.primary.ocean, 0.05)} 100%)`
    }}>
      <AnimatedBackground />
      
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 12, pb: 8, position: 'relative' }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <FloatingBox>
            <Typography variant="h1" sx={{
              fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              background: `linear-gradient(45deg, ${travelColors.primary.ocean}, ${travelColors.primary.sky})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
              lineHeight: 1.1
            }}>
              ✈️ Travelogy
            </Typography>
          </FloatingBox>
          
          <Typography variant="h4" sx={{
            color: travelColors.text.primary,
            fontWeight: 300,
            mb: 4,
            maxWidth: 800,
            mx: 'auto',
            lineHeight: 1.4,
            animation: 'fadeInUp 1s ease-out 0.3s both',
            '@keyframes fadeInUp': {
              'from': { opacity: 0, transform: 'translateY(30px)' },
              'to': { opacity: 1, transform: 'translateY(0)' }
            }
          }}>
            Track, Map, and Cherish Every Mile of Your Journey
          </Typography>
          
          <Typography variant="h6" sx={{
            color: travelColors.text.secondary,
            mb: 6,
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.6,
            animation: 'fadeInUp 1s ease-out 0.6s both'
          }}>
            Experience next-generation travel tracking with real-time GPS, beautiful route visualization, and intelligent photo organization.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center"
            sx={{ animation: 'fadeInUp 1s ease-out 0.9s both' }}
          >
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/signup')}
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                borderRadius: 3,
                background: `linear-gradient(45deg, ${travelColors.primary.ocean}, ${travelColors.primary.sky})`,
                boxShadow: `0 8px 32px ${alpha(travelColors.primary.ocean, 0.3)}`,
                transform: 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 48px ${alpha(travelColors.primary.ocean, 0.4)}`,
                  background: `linear-gradient(45deg, ${travelColors.primary.sky}, ${travelColors.primary.ocean})`
                }
              }}
            >
              Start Your Journey
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<PlayArrow />}
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                borderRadius: 3,
                borderColor: travelColors.primary.ocean,
                color: travelColors.primary.ocean,
                borderWidth: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: travelColors.primary.sky,
                  color: travelColors.primary.sky,
                  backgroundColor: alpha(travelColors.primary.sky, 0.05),
                  borderWidth: 2,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Watch Demo
            </Button>
          </Stack>
        </Box>

        {/* Stats showcase */}
        <Grid container spacing={4} sx={{ mt: 8 }}>
          {[
            { label: 'Active Travelers', value: '10K+', icon: '🌍' },
            { label: 'Countries Tracked', value: '150+', icon: '🗺️' },
            { label: 'Miles Recorded', value: '2M+', icon: '📏' },
            { label: 'Photos Organized', value: '500K+', icon: '📸' }
          ].map((stat, index) => (
            <Grid item xs={6} md={3} key={stat.label}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  animation: `slideInUp 0.8s ease-out ${index * 0.1}s both`,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)'
                  },
                  '@keyframes slideInUp': {
                    'from': { opacity: 0, transform: 'translateY(30px)' },
                    'to': { opacity: 1, transform: 'translateY(0)' }
                  }
                }}
              >
                <Typography variant="h3" sx={{ mb: 1, fontSize: '2rem' }}>
                  {stat.icon}
                </Typography>
                <Typography variant="h4" sx={{
                  color: travelColors.primary.ocean,
                  fontWeight: 700,
                  mb: 1
                }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{
                  color: travelColors.text.secondary,
                  fontWeight: 500
                }}>
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section with Flip Cards */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" sx={{
            color: travelColors.primary.ocean,
            fontFamily: '"Playfair Display", serif',
            fontWeight: 600,
            mb: 2
          }}>
            🌟 Why Choose Travelogy?
          </Typography>
          <Typography variant="h6" sx={{
            color: travelColors.text.secondary,
            maxWidth: 600,
            mx: 'auto',
            opacity: 0.9
          }}>
            Experience the future of travel tracking with cutting-edge technology
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item xs={12} md={6} lg={3} key={feature.id}>
              <Box
                sx={{
                  height: '300px',
                  width: '100%',
                  perspective: '1000px',
                  cursor: 'pointer',
                  '&:hover .flip-card-inner': {
                    transform: 'rotateY(180deg)'
                  }
                }}
              >
                <Box 
                  className="flip-card-inner"
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s ease-in-out'
                  }}
                >
                  {/* Front of Card */}
                  <Card
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      WebkitBackfaceVisibility: 'hidden',
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(0deg)',
                      borderRadius: '16px',
                      p: 3,
                      border: `2px solid ${alpha(feature.color, 0.2)}`,
                      background: `linear-gradient(135deg, ${alpha(feature.color, 0.08)} 0%, transparent 100%)`,
                      boxShadow: `0 8px 32px ${alpha(feature.color, 0.15)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 0 }}>
                      <PulsingAvatar
                        color={feature.color}
                        sx={{
                          bgcolor: alpha(feature.color, 0.2),
                          color: feature.color,
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 3,
                          fontSize: '2.5rem'
                        }}
                      >
                        {feature.icon}
                      </PulsingAvatar>
                      <Typography variant="h6" sx={{
                        color: travelColors.text.primary,
                        fontWeight: 600,
                        mb: 2
                      }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: travelColors.text.secondary,
                        lineHeight: 1.6
                      }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Back of Card */}
                  <Card
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      WebkitBackfaceVisibility: 'hidden',
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${feature.color} 0%, ${alpha(feature.color, 0.8)} 100%)`,
                      color: 'white',
                      boxShadow: `0 16px 64px ${alpha(feature.color, 0.3)}`,
                      p: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{
                        fontWeight: 700,
                        mb: 3
                      }}>
                        ✨ {feature.backTitle}
                      </Typography>
                      <Typography variant="body1" sx={{
                        lineHeight: 1.7,
                        fontSize: '1.1rem'
                      }}>
                        {feature.backContent}
                      </Typography>
                    </Box>
                  </Card>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" sx={{
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
            mx: 'auto'
          }}>
            Join thousands of happy adventurers worldwide
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={testimonial.name}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 4,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeInUp 0.8s ease-out ${index * 0.2}s both`,
                  '&:hover': {
                    transform: 'translateY(-8px) rotateX(2deg)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    borderColor: alpha(travelColors.primary.ocean, 0.3)
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" sx={{ mr: 2 }}>
                    {testimonial.avatar}
                  </Typography>
                  <Box>
                    <Typography variant="h6" sx={{
                      fontWeight: 600,
                      color: travelColors.text.primary
                    }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: travelColors.text.secondary
                    }}>
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', mb: 2 }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} sx={{ color: '#ffc107', fontSize: '1.2rem' }} />
                  ))}
                </Box>
                
                <Typography variant="body1" sx={{
                  color: travelColors.text.secondary,
                  lineHeight: 1.7,
                  fontStyle: 'italic'
                }}>
                  "{testimonial.content}"
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Final CTA Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            background: `linear-gradient(135deg, 
              ${alpha(travelColors.primary.ocean, 0.1)} 0%, 
              ${alpha(travelColors.primary.forest, 0.1)} 100%)`,
            borderRadius: 6,
            p: { xs: 6, md: 10 },
            border: `2px solid ${alpha(travelColors.primary.ocean, 0.2)}`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '150%',
              height: '150%',
              background: `conic-gradient(from 0deg, 
                transparent 0deg, 
                ${alpha(travelColors.primary.ocean, 0.03)} 90deg, 
                transparent 180deg, 
                ${alpha(travelColors.primary.sky, 0.03)} 270deg, 
                transparent 360deg)`,
              animation: 'slowRotate 30s linear infinite',
              zIndex: 0,
              '@keyframes slowRotate': {
                '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
              }
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h2" sx={{
              color: travelColors.primary.ocean,
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '2rem', md: '3rem' }
            }}>
              🚀 Ready for Your Next Adventure?
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
              Start your journey today with our free plan!
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                endIcon={<FlightTakeoff />}
                onClick={() => navigate('/signup')}
                sx={{
                  px: 6,
                  py: 3,
                  fontSize: '1.2rem',
                  borderRadius: 4,
                  background: `linear-gradient(45deg, ${travelColors.primary.ocean}, ${travelColors.primary.sky})`,
                  boxShadow: `0 12px 48px ${alpha(travelColors.primary.ocean, 0.3)}`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-3px) scale(1.02)',
                    boxShadow: `0 16px 64px ${alpha(travelColors.primary.ocean, 0.4)}`
                  }
                }}
              >
                Start Free Today
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<Timeline />}
                onClick={() => navigate('/login')}
                sx={{
                  px: 6,
                  py: 3,
                  fontSize: '1.2rem',
                  borderRadius: 4,
                  borderColor: travelColors.primary.ocean,
                  color: travelColors.primary.ocean,
                  borderWidth: 2,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: travelColors.primary.sky,
                    color: travelColors.primary.sky,
                    backgroundColor: alpha(travelColors.primary.sky, 0.05),
                    borderWidth: 2,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Sign In
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>

      {/* Footer */}
      <Box sx={{ 
        py: 4, 
        borderTop: `1px solid ${alpha(travelColors.primary.ocean, 0.1)}`,
        backgroundColor: alpha(travelColors.primary.ocean, 0.02)
      }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center" sx={{
            color: travelColors.text.secondary,
            mb: 2
          }}>
            © 2024 Travelogy. Built with ❤️ for adventurers worldwide.
          </Typography>
          <Stack direction="row" spacing={3} justifyContent="center">
            {['Privacy', 'Terms', 'Support', 'About'].map((link) => (
              <Button
                key={link}
                variant="text"
                size="small"
                sx={{
                  color: travelColors.text.secondary,
                  '&:hover': {
                    color: travelColors.primary.ocean
                  }
                }}
              >
                {link}
              </Button>
            ))}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}