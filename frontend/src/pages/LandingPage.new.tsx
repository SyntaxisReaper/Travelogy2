import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  keyframes,
} from '@mui/material';
import {
  FlightTakeoff,
  PhotoCamera,
  Explore,
  TravelExplore,
  Public,
  GpsFixed,
  Map,
  CloudQueue,
  StarRate,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { travelColors } from '../styles/travelTheme';

// Typewriter Effect Component
const TypewriterEffect: React.FC<{ texts: string[]; speed?: number; delay?: number }> = ({ 
  texts, 
  speed = 50, 
  delay = 2000 
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fullText = texts[currentTextIndex];
      
      if (isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length - 1));
      } else {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      }

      if (!isDeleting && currentText === fullText) {
        setTimeout(() => setIsDeleting(true), delay);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentTextIndex, texts, speed, delay]);

  return (
    <Typography variant="h5" sx={{
      color: travelColors.primary.forest,
      fontWeight: 500,
      minHeight: '2em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {currentText}
      <Box component="span" sx={{
        borderRight: `2px solid ${travelColors.primary.forest}`,
        marginLeft: '2px',
        animation: 'blink 1s infinite',
        '@keyframes blink': {
          '0%, 50%': { opacity: 1 },
          '51%, 100%': { opacity: 0 },
        }
      }} />
    </Typography>
  );
};

const NewLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [flippedCard, setFlippedCard] = useState<number | null>(null);

  const typewriterTexts = [
    "🚀 Start Your Next Adventure!",
    "🗺️ Track Every Step of Your Journey", 
    "🌤️ Get Real-Time Weather Updates",
    "📸 Capture Unforgettable Memories",
    "🌍 Explore the World with Confidence"
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.sky}15 100%)`,
    }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h1" sx={{
            fontSize: { xs: '3rem', md: '4.5rem' },
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            background: `linear-gradient(45deg, ${travelColors.primary.ocean}, ${travelColors.primary.sunset}, ${travelColors.primary.forest})`,
            backgroundSize: '300% 300%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            animation: 'gradientShift 4s ease-in-out infinite, logoFloat 3s ease-in-out infinite',
            textShadow: `0 0 20px ${travelColors.primary.ocean}40, 0 0 30px ${travelColors.primary.sunset}30`,
            filter: 'drop-shadow(0 4px 8px rgba(46, 134, 171, 0.3))',
            '@keyframes gradientShift': {
              '0%, 100%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' }
            },
            '@keyframes logoFloat': {
              '0%, 100%': { transform: 'translateY(0px) scale(1)' },
              '50%': { transform: 'translateY(-10px) scale(1.02)' }
            },
            '&:hover': {
              animation: 'gradientShift 1s ease-in-out infinite, logoFloat 0.5s ease-in-out infinite',
              filter: `drop-shadow(0 8px 16px rgba(46, 134, 171, 0.5)) drop-shadow(0 0 40px ${travelColors.primary.sunset}60)`,
            }
          }}>
            🌍 Travelogy
          </Typography>
          
          <Typography variant="h4" sx={{
            mb: 3,
            color: travelColors.primary.forest,
            fontWeight: 300
          }}>
            Your Ultimate Travel Companion
          </Typography>
          
          <Typography variant="h6" sx={{
            mb: 4,
            color: travelColors.text.primary,
            opacity: 0.8,
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.6
          }}>
            Track your adventures with real-time GPS • Map every journey • Get weather updates • Create lasting memories
          </Typography>

          {/* Typewriter Effect */}
          <Box sx={{ mb: 6, minHeight: '3rem' }}>
            <TypewriterEffect texts={typewriterTexts} speed={80} delay={2500} />
          </Box>

          {/* Stats Row */}
          <Grid container spacing={2} sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  color: travelColors.primary.ocean,
                  mb: 0.5
                }}>
                  🗺️ 10K+
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: travelColors.text.secondary,
                  fontSize: '0.85rem'
                }}>
                  Adventures Tracked
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  color: travelColors.primary.sunset,
                  mb: 0.5
                }}>
                  🚶‍♂️ 50K+
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: travelColors.text.secondary,
                  fontSize: '0.85rem'
                }}>
                  Miles Explored
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  color: travelColors.primary.forest,
                  mb: 0.5
                }}>
                  🌍 25+
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: travelColors.text.secondary,
                  fontSize: '0.85rem'
                }}>
                  Countries Visited
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  color: travelColors.primary.coral,
                  mb: 0.5
                }}>
                  ⭐ 99%
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: travelColors.text.secondary,
                  fontSize: '0.85rem'
                }}>
                  Happy Travelers
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
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
                '&:hover': {
                  backgroundColor: travelColors.primary.forest,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 40px ${travelColors.primary.ocean}60`,
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

      {/* Features Section */}
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
            Experience the future of travel tracking with cutting-edge GPS technology
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              id: 0,
              icon: <GpsFixed fontSize="large" />,
              title: 'Live GPS Tracking',
              description: 'Track your adventures in real-time with precise GPS coordinates and route mapping.',
              color: travelColors.primary.ocean,
              backContent: 'Start tracking your location instantly with our advanced GPS technology. Never lose track of your path again!'
            },
            {
              id: 1,
              icon: <Map fontSize="large" />,
              title: 'Interactive Route Maps',
              description: 'Visualize your journey with FROM/TO markers and complete route paths on interactive maps.',
              color: travelColors.primary.forest,
              backContent: 'See your entire journey mapped out beautifully with start/end markers and full route visualization.'
            },
            {
              id: 2,
              icon: <CloudQueue fontSize="large" />,
              title: 'Weather Integration',
              description: 'Get real-time weather data for your destinations and plan the perfect adventure.',
              color: travelColors.primary.sky,
              backContent: 'Stay ahead of weather changes with real-time updates and forecasts for your travel destinations.'
            },
            {
              id: 3,
              icon: <PhotoCamera fontSize="large" />,
              title: 'Photo Memories',
              description: 'Capture and organize your travel photos with location data and timeline views.',
              color: travelColors.primary.sunset,
              backContent: 'Create lasting memories by organizing photos with GPS coordinates and timestamps automatically.'
            }
          ].map((feature) => (
            <Grid item xs={12} md={6} lg={3} key={feature.id}>
              <Box
                className="flip-card"
                sx={{
                  backgroundColor: 'transparent',
                  width: '100%',
                  height: '300px',
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
                    textAlign: 'center',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  }}>
                
                  {/* Front of Card */}
                  <Card sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden',
                    p: 3,
                    borderRadius: 3,
                    border: `2px solid ${feature.color}20`,
                    background: `linear-gradient(135deg, ${feature.color}08 0%, transparent 100%)`,
                    boxShadow: `0 8px 32px ${feature.color}20`,
                    transform: 'rotateY(0deg)',
                    transition: 'box-shadow 0.3s ease'
                  }}>
                    <CardContent>
                      <Avatar sx={{
                        bgcolor: `${feature.color}20`,
                        color: feature.color,
                        width: 70,
                        height: 70,
                        mx: 'auto',
                        mb: 3,
                        fontSize: '2rem',
                        animation: 'iconPulse 2s ease-in-out infinite',
                        '@keyframes iconPulse': {
                          '0%, 100%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.1)' }
                        }
                      }}>
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{
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

                  {/* Back of Card */}
                  <Card sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    p: 3,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}DD 100%)`,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 16px 64px ${feature.color}40`,
                  }}>
                    <Box>
                      <Typography variant="h5" sx={{
                        fontWeight: 700,
                        mb: 3,
                        textAlign: 'center'
                      }}>
                        🎆 Amazing!
                      </Typography>
                      <Typography variant="body1" sx={{
                        lineHeight: 1.8,
                        textAlign: 'center',
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

      {/* Final CTA Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{
          textAlign: 'center',
          background: `linear-gradient(135deg, ${travelColors.primary.ocean}15 0%, ${travelColors.primary.forest}15 100%)`,
          borderRadius: 4,
          p: { xs: 6, md: 8 },
          border: `2px solid ${travelColors.primary.ocean}20`,
        }}>
          <Typography variant="h3" sx={{
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

          {/* Trust Indicators */}
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

      {/* Simple Footer */}
      <Box sx={{
        backgroundColor: travelColors.primary.ocean,
        color: 'white',
        py: 6,
        mt: 8
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 600,
                mb: 2
              }}>
                🌍 Travelogy
              </Typography>
              <Typography variant="body1" sx={{
                opacity: 0.9,
                lineHeight: 1.6
              }}>
                Your ultimate companion for tracking and sharing travel adventures worldwide.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-end' }, flexWrap: 'wrap' }}>
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
                  onClick={() => navigate('/contact')}
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
                  📧 Contact
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

export default NewLandingPage;