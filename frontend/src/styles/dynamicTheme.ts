import { createTheme, alpha } from '@mui/material/styles';

// Vibrant, dynamic variant (a bit more lively than calm, still tasteful)
const colors = {
  neonCyan: '#06b6d4',    // cyan-500
  neonPink: '#e11d48',    // rose-600
  neonGreen: '#22c55e',   // green-500
  neonBlue: '#3b82f6',    // blue-500
  neonPurple: '#8b5cf6',  // violet-500
  neonOrange: '#fb923c',  // orange-400
  darkBg: '#0b1220',
  darkSurface: '#111827',
  darkCard: '#0f172a',    // slate-900
};

export const dynamicTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: colors.neonCyan },
    secondary: { main: colors.neonPink },
    background: { default: colors.darkBg, paper: colors.darkCard },
    success: { main: colors.neonGreen },
    info: { main: colors.neonBlue },
    warning: { main: colors.neonOrange },
    error: { main: '#ef4444' },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
    button: {
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase' as const,
    },
  },
  shadows: [
    'none',
    `0 0 10px ${alpha(colors.neonCyan, 0.3)}`,
    `0 0 15px ${alpha(colors.neonCyan, 0.4)}`,
    `0 0 20px ${alpha(colors.neonPink, 0.4)}`,
    `0 0 20px ${alpha(colors.neonBlue, 0.35)}`,
    ...Array(20).fill('0 0 10px rgba(0,0,0,0.1)')
  ] as any,
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${alpha(colors.darkBg, 0.95)} 0%, ${alpha(colors.darkSurface, 0.95)} 100%)`,
          borderBottom: `1px solid ${alpha(colors.neonCyan, 0.3)}`,
        },
      },
    },
  },
});