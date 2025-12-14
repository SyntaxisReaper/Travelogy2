import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { colors } from '../styles/techTheme';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring here if desired
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          background: `radial-gradient(ellipse at center, ${colors.deepSpace} 0%, ${colors.darkBg} 100%)`
        }}>
          <Typography variant="h4" sx={{ color: colors.neonPink, textAlign: 'center' }}>
            Something went wrong
          </Typography>
          <Typography variant="body1" sx={{ color: '#ccc', maxWidth: 600, textAlign: 'center' }}>
            An unexpected error occurred. You can try reloading the page. If the problem persists, please report it.
          </Typography>
          <Button variant="contained" onClick={this.handleReload}>
            Reload
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
