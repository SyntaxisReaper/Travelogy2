export const travelColors = {
  // Primary travel colors
  primary: {
    ocean: '#2E86AB',           // Deep ocean blue
    sky: '#87CEEB',             // Sky blue
    sunset: '#F18F01',          // Sunset orange
    coral: '#FF6B6B',           // Coral pink
    sand: '#F4E4BC',            // Sandy beige
    forest: '#4A7A59',          // Forest green
  },

  // Neutral backgrounds
  backgrounds: {
    light: '#FEFEFE',           // Pure white
    cream: '#FDF8F0',           // Warm cream
    lightSand: '#FAF6F0',       // Very light sand
    paper: '#F9F7F4',           // Paper white
    softGray: '#F5F5F5',        // Soft gray
  },

  // Text colors
  text: {
    primary: '#2C3E50',         // Dark blue-gray
    secondary: '#5D6D7E',       // Medium gray
    light: '#85929E',           // Light gray
    white: '#FFFFFF',           // Pure white
    accent: '#E67E22',          // Warm orange
  },

  // Status and accent colors
  accents: {
    success: '#27AE60',         // Forest green
    warning: '#F39C12',         // Warm amber
    error: '#E74C3C',           // Coral red
    info: '#3498DB',            // Ocean blue
    adventure: '#8E44AD',       // Purple for adventure
  },

  // Gradients
  gradients: {
    sunset: 'linear-gradient(135deg, #FF6B6B 0%, #F18F01 50%, #FFE66D 100%)',
    ocean: 'linear-gradient(135deg, #2E86AB 0%, #87CEEB 100%)',
    forest: 'linear-gradient(135deg, #4A7A59 0%, #8BC34A 100%)',
    earth: 'linear-gradient(135deg, #8D4A3B 0%, #D4A574 50%, #F4E4BC 100%)',
    sky: 'linear-gradient(135deg, #87CEEB 0%, #E0F6FF 100%)',
  },

  // Shadows and effects
  shadows: {
    soft: '0 2px 8px rgba(46, 134, 171, 0.1)',
    medium: '0 4px 12px rgba(46, 134, 171, 0.15)',
    large: '0 8px 24px rgba(46, 134, 171, 0.2)',
    warm: '0 4px 12px rgba(241, 143, 1, 0.15)',
    paper: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
};

// Travel-themed component styles
export const travelStyles = {
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '16px',
    round: '50%',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  fonts: {
    primary: '"Inter", "Roboto", sans-serif',
    accent: '"Playfair Display", serif',
    body: '"Open Sans", sans-serif',
  },

  transitions: {
    fast: '0.2s ease',
    medium: '0.3s ease',
    slow: '0.5s ease',
  },
};

// MUI theme overrides for travel theme
export const travelMuiTheme = {
  palette: {
    primary: {
      main: travelColors.primary.ocean,
      light: travelColors.primary.sky,
      dark: travelColors.primary.forest,
    },
    secondary: {
      main: travelColors.primary.sunset,
      light: travelColors.primary.coral,
      dark: travelColors.accents.warning,
    },
    background: {
      default: travelColors.backgrounds.cream,
      paper: travelColors.backgrounds.paper,
    },
    text: {
      primary: travelColors.text.primary,
      secondary: travelColors.text.secondary,
    },
  },
  typography: {
    fontFamily: travelStyles.fonts.primary,
    h1: {
      fontFamily: travelStyles.fonts.accent,
      fontWeight: 700,
    },
    h2: {
      fontFamily: travelStyles.fonts.accent,
      fontWeight: 600,
    },
    h3: {
      fontFamily: travelStyles.fonts.accent,
      fontWeight: 600,
    },
    h4: {
      fontFamily: travelStyles.fonts.accent,
      fontWeight: 500,
    },
    body1: {
      fontFamily: travelStyles.fonts.body,
    },
    body2: {
      fontFamily: travelStyles.fonts.body,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    travelColors.shadows.soft,
    travelColors.shadows.medium,
    travelColors.shadows.large,
    travelColors.shadows.warm,
    // Add more shadows as needed
  ],
};