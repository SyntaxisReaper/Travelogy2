import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography } from '@mui/material';

// Simple test theme
const testTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2196f3' },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
});

// Simple test component
const TestPage: React.FC = () => (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Typography variant="h2" gutterBottom>
      Test Page - App is Working!
    </Typography>
    <Typography variant="body1">
      If you can see this, the React app is mounting correctly.
    </Typography>
  </Container>
);

// Minimal App component
const TestApp: React.FC = () => {
  return (
    <ThemeProvider theme={testTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/*" element={<TestPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default TestApp;