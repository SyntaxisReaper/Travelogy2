import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import TypewriterText from '../components/TypewriterText';
import {
  DirectionsWalk,
  FlightTakeoff,
  PhotoCamera,
  Explore,
  TravelExplore,
  Public,
  Security,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { travelColors } from '../styles/travelTheme';
import TravelText from '../components/TravelText';
import TravelCard from '../components/TravelCard';
import AdventureButton from '../components/AdventureButton';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <PhotoCamera fontSize="large" />,
      title: 'Capture Every Moment',
      description: 'Document your adventures with photos and create lasting memories of your journeys.',
    },
    {
      icon: <TravelExplore fontSize="large" />,
      title: 'Discover New Places',
      description: 'Find hidden gems and must-see destinations recommended by fellow travelers.',
    },
    {
      icon: <FlightTakeoff fontSize="large" />,
      title: 'Plan Your Adventures',
      description: 'Organize trips, track itineraries, and never miss a travel opportunity.',
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Safe & Secure',
      description: 'Your travel data and memories are protected with industry-leading security.',
    },
  ];

  const stats = [
    { label: 'Countries', value: '120+', icon: <Public /> },
    { label: 'Adventures', value: '50k+', icon: <Explore /> },
    { label: 'Travelers', value: '10k+', icon: <DirectionsWalk /> },
    { label: 'Photos', value: '1M+', icon: <PhotoCamera /> },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.sky}20 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
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
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            py: 4
          }}>
            {/* Main Title */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <TravelText
                text="Travelogy"
                textVariant="wanderlust"
                animated
                variant="h1"
                sx={{ mb: 2, fontSize: { xs: '3rem', md: '4.5rem' } }}
              />
            </motion.div>

            {/* Subtitle */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            >
              <TravelText
                text="Your Personal Travel Journal"
                textVariant="gradient"
                animated
                variant="h3"
                sx={{ mb: 4 }}
              />
            </motion.div>

            {/* Typewriter Effect */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            >
              <Box sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}>
                <TypewriterText
                  lines={[
                    'Capture memories from every adventure...',
                    'Plan trips. Share stories. Inspire others.',
                    'Your journey starts here.',
                    'Create your travelogue today!'
                  ]}
                  variant="h5"
                  typingSpeedMs={50}
                  pauseMs={2000}
                  sx={{ color: travelColors.text.secondary, fontStyle: 'italic' }}
                />
              </Box>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            >
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', mb: 4 }}>
                <AdventureButton
                  buttonVariant="sunset"
                  adventure
                  size="large"
                  onClick={() => navigate('/register')}
                  startIcon={<TravelExplore />}
                >
                  Start Your Journey
                </AdventureButton>
                <AdventureButton
                  buttonVariant="ocean"
                  size="large"
                  onClick={() => navigate('/login')}
                  startIcon={<DirectionsWalk />}
                >
                  Continue Adventure
                </AdventureButton>
              </Box>
            </motion.div>
          </Box>
        </motion.div>
      </Container>

      {/* Travel Stats Grid */}
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <TravelCard
                  cardVariant={(['ocean', 'sunset', 'forest', 'paper'][index] as 'ocean' | 'sunset' | 'forest' | 'paper')}
                  cardElevation="medium"
                  borderAccent
                  sx={{ textAlign: 'center', p: 3, height: '150px' }}
                >
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Box sx={{ 
                      color: [travelColors.primary.ocean, travelColors.primary.sunset, travelColors.primary.forest, travelColors.primary.coral][index], 
                      mb: 1, 
                      fontSize: '2rem' 
                    }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: travelColors.text.primary }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: travelColors.text.secondary }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </TravelCard>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Travel Features */}
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <TravelText
            text="Explore Amazing Features"
            textVariant="adventure"
            animated
            variant="h3"
            sx={{ textAlign: 'center', mb: 2 }}
          />
          <Typography variant="h6" textAlign="center" sx={{ mb: 6, color: travelColors.text.secondary }}>
            Everything you need to document and share your travel adventures
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <TravelCard
                    cardVariant={(['ocean', 'sunset', 'forest', 'coral'][index] as 'ocean' | 'sunset' | 'forest' | 'coral')}
                    cardElevation="high"
                    borderAccent
                    sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <Box sx={{ 
                        color: [travelColors.primary.ocean, travelColors.primary.sunset, travelColors.primary.forest, travelColors.primary.coral][index], 
                        mb: 2, 
                        fontSize: '3rem' 
                      }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: travelColors.text.primary }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" sx={{ flexGrow: 1, color: travelColors.text.secondary }}>
                        {feature.description}
                      </Typography>
                    </Box>
                  </TravelCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* How It Works */}
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <TravelText
            text="How It Works"
            textVariant="adventure"
            animated
            variant="h3"
            sx={{ textAlign: 'center', mb: 6 }}
          />
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Box textAlign="center">
                  <TravelCard
                    cardVariant="ocean"
                    cardElevation="high"
                    borderAccent
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <Typography variant="h3" fontWeight="bold" sx={{ color: travelColors.primary.ocean, position: 'relative', zIndex: 2 }}>
                      01
                    </Typography>
                  </TravelCard>
                  <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: travelColors.text.primary }}>
                    Plan Your Trip
                  </Typography>
                  <Typography variant="body1" sx={{ color: travelColors.text.secondary }}>
                    Create your travel itinerary and set your adventure goals. Plan destinations and activities.
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <Box textAlign="center">
                  <TravelCard
                    cardVariant="sunset"
                    cardElevation="high"
                    borderAccent
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <Typography variant="h3" fontWeight="bold" sx={{ color: travelColors.primary.sunset, position: 'relative', zIndex: 2 }}>
                      02
                    </Typography>
                  </TravelCard>
                  <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: travelColors.text.primary }}>
                    Document Journey
                  </Typography>
                  <Typography variant="body1" sx={{ color: travelColors.text.secondary }}>
                    Capture photos, write diary entries, and record memories from every moment of your adventure.
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <Box textAlign="center">
                  <TravelCard
                    cardVariant="forest"
                    cardElevation="high"
                    borderAccent
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <Typography variant="h3" fontWeight="bold" sx={{ color: travelColors.primary.forest, position: 'relative', zIndex: 2 }}>
                      03
                    </Typography>
                  </TravelCard>
                  <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: travelColors.text.primary }}>
                    Share & Inspire
                  </Typography>
                  <Typography variant="body1" sx={{ color: travelColors.text.secondary }}>
                    Share your travel stories and inspire others to explore the world through your experiences.
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>

      {/* Final CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <TravelCard
            cardVariant="ocean"
            cardElevation="high"
            borderAccent
            sx={{ p: 6, background: travelColors.gradients.sky }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <TravelText
                text="Start Your Adventure Today"
                textVariant="wanderlust"
                animated
                variant="h3"
                sx={{ mb: 3 }}
              />
              <Typography variant="h6" sx={{ mb: 4, color: travelColors.text.primary }}>
                Join thousands of travelers sharing their stories. Your next great adventure is just a click away...
              </Typography>
              <AdventureButton
                buttonVariant="sunset"
                adventure
                size="large"
                onClick={() => navigate('/register')}
                startIcon={<FlightTakeoff />}
              >
                Begin Your Journey - Create Your Account
              </AdventureButton>
            </Box>
          </TravelCard>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LandingPage;
