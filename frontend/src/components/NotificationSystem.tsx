import React, { useEffect } from 'react';
import { Box, Alert, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '../styles/techTheme';

interface NotificationSystemProps {
  notifications: string[];
  onClearNotification: (index: number) => void;
  onClearAll: () => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onClearNotification,
  onClearAll,
}) => {
  // Auto-clear notifications after 5 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        onClearNotification(0);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications, onClearNotification]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 10000,
        width: 400,
        maxWidth: '90vw',
      }}
    >
      <AnimatePresence>
        {notifications.slice(0, 4).map((notification, index) => (
          <motion.div
            key={`${notification}-${index}`}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
            style={{ marginBottom: '10px' }}
          >
            <Alert
              severity="info"
              sx={{
                background: `linear-gradient(135deg, ${colors.darkCard}e6 0%, ${colors.carbonFiber}e6 100%)`,
                backdropFilter: 'blur(15px)',
                border: `1px solid ${colors.neonCyan}60`,
                borderRadius: '12px',
                color: colors.neonCyan,
                boxShadow: `0 4px 20px ${colors.neonCyan}20`,
                '& .MuiAlert-icon': {
                  color: colors.neonCyan,
                },
                '& .MuiAlert-message': {
                  color: '#ffffff',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '0.875rem',
                },
              }}
              action={
                <IconButton
                  size="small"
                  onClick={() => onClearNotification(index)}
                  sx={{ color: colors.neonPink }}
                >
                  <Close fontSize="small" />
                </IconButton>
              }
            >
              {notification}
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default NotificationSystem;