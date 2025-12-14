import { createTheme, alpha } from '@mui/material/styles';

// Modern, age-inclusive palette (subtle, high-contrast, reduced neon)
const colors = {
  neonCyan: '#0891b2',      // teal-700
  neonPink: '#db2777',      // rose-600
  neonGreen: '#16a34a',     // green-600
  neonBlue: '#2563eb',      // blue-600
  neonPurple: '#7c3aed',    // violet-600
  neonOrange: '#f97316',    // orange-500
  darkBg: '#111827',        // gray-900
  darkSurface: '#1f2937',   // gray-800
  darkCard: '#111827',      // gray-900 (card darker)
  matrixGreen: '#16a34a',
  glitchRed: '#dc2626',     // red-600 (softer)
  deepSpace: '#0b1220',
  carbonFiber: '#1f2937',
  textSecondary: '#9ca3af', // gray-400
};

// Create tech theme
export const techTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.neonCyan,
      light: alpha(colors.neonCyan, 0.8),
      dark: alpha(colors.neonCyan, 0.6),
      contrastText: colors.darkBg,
    },
    secondary: {
      main: colors.neonPink,
      light: alpha(colors.neonPink, 0.8),
      dark: alpha(colors.neonPink, 0.6),
      contrastText: colors.darkBg,
    },
    error: {
      main: colors.glitchRed,
      light: alpha(colors.glitchRed, 0.8),
      dark: alpha(colors.glitchRed, 0.6),
    },
    warning: {
      main: colors.neonOrange,
      light: alpha(colors.neonOrange, 0.8),
      dark: alpha(colors.neonOrange, 0.6),
    },
    success: {
      main: colors.neonGreen,
      light: alpha(colors.neonGreen, 0.8),
      dark: alpha(colors.neonGreen, 0.6),
    },
    info: {
      main: colors.neonBlue,
      light: alpha(colors.neonBlue, 0.8),
      dark: alpha(colors.neonBlue, 0.6),
    },
    background: {
      default: colors.deepSpace,
      paper: colors.darkCard,
    },
    text: {
      primary: '#ffffff',
      secondary: alpha('#ffffff', 0.7),
      disabled: alpha('#ffffff', 0.5),
    },
    divider: alpha(colors.neonCyan, 0.2),
  },
  typography: {
    // Accessible, familiar stack; slightly larger defaults for readability
    fontFamily: 'Inter, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 600,
      letterSpacing: '0.015em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.005em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: '0.04em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.03em',
    },
    body1: {
      fontFamily: '"Roboto", "Arial", sans-serif',
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Roboto", "Arial", sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'none' as const,
    },
    caption: {
      fontFamily: '"Roboto Mono", monospace',
      fontSize: '0.75rem',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  // Reduce glow-heavy shadows for a calmer aesthetic
  shadows: Array(25).fill('none') as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.neonCyan} ${colors.darkBg}`,
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: colors.darkBg,
        },
        '*::-webkit-scrollbar-thumb': {
          background: colors.neonCyan,
          borderRadius: '4px',
          boxShadow: `0 0 5px ${colors.neonCyan}`,
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: colors.neonPink,
          boxShadow: `0 0 8px ${colors.neonPink}`,
        },
        body: {
          background: colors.darkBg,
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
        '@keyframes neonGlow': {
          '0%': {
            textShadow: `0 0 5px ${colors.neonCyan}, 0 0 10px ${colors.neonCyan}, 0 0 15px ${colors.neonCyan}`,
          },
          '50%': {
            textShadow: `0 0 10px ${colors.neonCyan}, 0 0 20px ${colors.neonCyan}, 0 0 30px ${colors.neonCyan}`,
          },
          '100%': {
            textShadow: `0 0 5px ${colors.neonCyan}, 0 0 10px ${colors.neonCyan}, 0 0 15px ${colors.neonCyan}`,
          },
        },
        '@keyframes glitch': {
          '0%': {
            transform: 'translate(0)',
            filter: 'hue-rotate(0deg)',
          },
          '10%': {
            transform: 'translate(-2px, 2px)',
            filter: 'hue-rotate(90deg)',
          },
          '20%': {
            transform: 'translate(-4px, 0px)',
            filter: 'hue-rotate(180deg)',
          },
          '30%': {
            transform: 'translate(2px, -2px)',
            filter: 'hue-rotate(270deg)',
          },
          '40%': {
            transform: 'translate(-2px, 0px)',
            filter: 'hue-rotate(360deg)',
          },
          '50%': {
            transform: 'translate(2px, 2px)',
            filter: 'hue-rotate(0deg)',
          },
          '60%': {
            transform: 'translate(-2px, -2px)',
            filter: 'hue-rotate(90deg)',
          },
          '70%': {
            transform: 'translate(2px, 0px)',
            filter: 'hue-rotate(180deg)',
          },
          '80%': {
            transform: 'translate(-2px, 2px)',
            filter: 'hue-rotate(270deg)',
          },
          '90%': {
            transform: 'translate(2px, -2px)',
            filter: 'hue-rotate(360deg)',
          },
          '100%': {
            transform: 'translate(0)',
            filter: 'hue-rotate(0deg)',
          },
        },
        '@keyframes matrixRain': {
          '0%': {
            transform: 'translateY(-100vh)',
            opacity: 1,
          },
          '100%': {
            transform: 'translateY(100vh)',
            opacity: 0,
          },
        },
        '@keyframes hologram': {
          '0%': {
            boxShadow: `
              0 0 5px ${colors.neonCyan},
              inset 0 0 10px ${alpha(colors.neonCyan, 0.1)}
            `,
          },
          '50%': {
            boxShadow: `
              0 0 20px ${colors.neonCyan},
              inset 0 0 20px ${alpha(colors.neonCyan, 0.2)}
            `,
          },
          '100%': {
            boxShadow: `
              0 0 5px ${colors.neonCyan},
              inset 0 0 10px ${alpha(colors.neonCyan, 0.1)}
            `,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          border: `1px solid ${colors.neonCyan}`,
          background: `linear-gradient(135deg, ${alpha(colors.neonCyan, 0.1)} 0%, ${alpha(colors.neonPink, 0.1)} 100%)`,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            border: `1px solid ${colors.neonPink}`,
            boxShadow: `0 0 20px ${alpha(colors.neonPink, 0.5)}`,
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${alpha(colors.neonCyan, 0.2)}, transparent)`,
            transition: 'left 0.5s',
          },
          '&:hover::before': {
            left: '100%',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${alpha(colors.darkCard, 0.9)} 0%, ${alpha(colors.carbonFiber, 0.9)} 100%)`,
          border: `1px solid ${alpha(colors.neonCyan, 0.3)}`,
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: `1px solid ${alpha(colors.neonCyan, 0.6)}`,
            boxShadow: `0 8px 32px ${alpha(colors.neonCyan, 0.2)}`,
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${alpha(colors.darkCard, 0.9)} 0%, ${alpha(colors.carbonFiber, 0.9)} 100%)`,
          border: `1px solid ${alpha(colors.neonCyan, 0.2)}`,
          backdropFilter: 'blur(15px)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${alpha(colors.darkBg, 0.95)} 0%, ${alpha(colors.carbonFiber, 0.95)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: 'none',
          borderBottom: `1px solid ${alpha(colors.neonCyan, 0.3)}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            background: alpha(colors.darkCard, 0.5),
            backdropFilter: 'blur(5px)',
            '& fieldset': {
              borderColor: alpha(colors.neonCyan, 0.3),
            },
            '&:hover fieldset': {
              borderColor: alpha(colors.neonCyan, 0.6),
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.neonCyan,
              boxShadow: `0 0 10px ${alpha(colors.neonCyan, 0.3)}`,
            },
          },
        },
      },
    },
  },
});

export { colors };