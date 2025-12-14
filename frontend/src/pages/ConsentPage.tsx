import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const ConsentPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        🔒 Privacy & Consent
      </Typography>
      <Paper sx={{ p: 4 }}>
        <Box textAlign="center">
          <Typography variant="body1" color="text.secondary">
            Privacy consent management interface will be implemented here.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ConsentPage;