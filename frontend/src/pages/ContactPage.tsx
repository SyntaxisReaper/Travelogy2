import React, { useMemo, useState } from 'react';
import { Container, Typography, Box, TextField, Stack, Link, IconButton } from '@mui/material';
import { LinkedIn, Instagram, GitHub, Email } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { travelColors } from '../styles/travelTheme';
import TravelCard from '../components/TravelCard';
import AdventureButton from '../components/AdventureButton';
import TravelText from '../components/TravelText';
import FlipButton from '../components/ui/FlipButton';

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const mailtoHref = useMemo(() => {
    const to = 'mailto:skystackofficial@gmail.com';
    const subject = encodeURIComponent('Contact Team SkyStack');
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    return `${to}?subject=${subject}&body=${body}`;
  }, [name, email, message]);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.sky}08 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${travelColors.primary.coral}15 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '8%',
          width: '180px',
          height: '180px',
          background: `radial-gradient(circle, ${travelColors.primary.forest}12 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      
      <Container maxWidth="md" sx={{ py: 4, position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <TravelText
              text="Contact Team SkyStack"
              textVariant="adventure"
              animated
              variant="h3"
              sx={{ mb: 2 }}
            />
            <Typography 
              variant="h6" 
              sx={{ 
                color: travelColors.text.secondary,
                fontStyle: 'italic'
              }}
            >
              Let&apos;s plan your next adventure together!
            </Typography>
          </Box>

          <TravelCard cardVariant="ocean" cardElevation="medium" borderAccent sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <TravelText
                text="Get in Touch"
                textVariant="gradient"
                variant="h5"
                sx={{ mb: 3 }}
              />
              <Stack spacing={3}>
                <TextField 
                  label="Your Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  fullWidth 
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: travelColors.primary.ocean,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: travelColors.primary.ocean,
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: travelColors.primary.ocean,
                    },
                  }}
                />
                <TextField 
                  label="Your Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  fullWidth 
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: travelColors.primary.ocean,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: travelColors.primary.ocean,
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: travelColors.primary.ocean,
                    },
                  }}
                />
                <TextField 
                  label="Message" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  fullWidth 
                  multiline 
                  minRows={4} 
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: travelColors.primary.ocean,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: travelColors.primary.ocean,
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: travelColors.primary.ocean,
                    },
                  }}
                />
                <Box>
                  <AdventureButton
                    buttonVariant="ocean"
                    startIcon={<Email />}
                    onClick={() => { window.location.href = mailtoHref; }}
                    adventure
                  >
                    Send Message
                  </AdventureButton>
                </Box>
              </Stack>
            </Box>
          </TravelCard>

          <TravelCard cardVariant="sunset" cardElevation="medium" borderAccent>
            <Box sx={{ p: 3 }}>
              <TravelText
                text="Connect With Us"
                textVariant="wanderlust"
                variant="h5"
                sx={{ mb: 3 }}
              />
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <IconButton 
                  component={Link} 
                  href="https://www.linkedin.com/in/ritesh-mishra-16161648lm" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="LinkedIn"
                  sx={{
                    backgroundColor: `${travelColors.primary.ocean}15`,
                    color: travelColors.primary.ocean,
                    '&:hover': {
                      backgroundColor: `${travelColors.primary.ocean}25`,
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <LinkedIn sx={{ fontSize: 28 }} />
                </IconButton>
                <IconButton 
                  component={Link} 
                  href="https://www.instagram.com/skystack_.official/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram"
                  sx={{
                    backgroundColor: `${travelColors.primary.coral}15`,
                    color: travelColors.primary.coral,
                    '&:hover': {
                      backgroundColor: `${travelColors.primary.coral}25`,
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Instagram sx={{ fontSize: 28 }} />
                </IconButton>
                <IconButton 
                  component={Link} 
                  href="https://github.com/Akash943-ct" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="GitHub"
                  sx={{
                    backgroundColor: `${travelColors.primary.forest}15`,
                    color: travelColors.primary.forest,
                    '&:hover': {
                      backgroundColor: `${travelColors.primary.forest}25`,
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <GitHub sx={{ fontSize: 28 }} />
                </IconButton>
              </Stack>
            </Box>
          </TravelCard>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ContactPage;
