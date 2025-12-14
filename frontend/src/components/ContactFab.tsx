import React from 'react';
import { Fab } from '@mui/material';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import { useNavigate } from 'react-router-dom';

const ContactFab: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Fab color="primary" aria-label="contact" onClick={() => navigate('/contact')} sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
      <ContactMailIcon />
    </Fab>
  );
};

export default ContactFab;