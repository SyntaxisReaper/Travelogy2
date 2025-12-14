import React from 'react';
import { Box } from '@mui/material';
import { colors } from '../styles/techTheme';

const LightweightBackgroundBase: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        background: `
          radial-gradient(circle at 20% 80%, ${colors.neonCyan}15 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${colors.neonPink}15 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, ${colors.neonGreen}10 0%, transparent 50%),
          ${colors.darkBg}
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            ${colors.neonCyan}08 2px,
            ${colors.neonCyan}08 4px
          )`,
          animation: 'scan 4s linear infinite',
        },
        '@keyframes scan': {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(100vw)',
          },
        },
      }}
    />
  );
};

const LightweightBackground: React.FC = React.memo(LightweightBackgroundBase);
LightweightBackground.displayName = 'LightweightBackground';

export default LightweightBackground;
