import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Palette,
  AccessibilityNew,
  TextIncrease,
  Animation,
  ChildCare,
  School,
  Work,
  Elderly,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import firebaseThemeService, { ThemeConfig } from '../services/firebaseThemeService';
import { colors } from '../styles/techTheme';

interface AgeGroupThemePanelProps {
  open: boolean;
  onClose: () => void;
}

const AgeGroupThemePanel: React.FC<AgeGroupThemePanelProps> = ({ open, onClose }) => {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);
  const [availableOptions, setAvailableOptions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load current theme config and available options
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [config, options] = await Promise.all([
        firebaseThemeService.getThemeConfig().catch(() => null),
        firebaseThemeService.getAvailableOptions(),
      ]);
      
      if (config) {
        setThemeConfig(config);
      }
      setAvailableOptions(options);
    } catch (err: any) {
      console.error('Theme load error:', err);
      setError(err.message || 'Failed to load theme data. Please make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const handleAgeGroupChange = async (ageGroup: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await firebaseThemeService.setAgeGroup(ageGroup);
      setThemeConfig(result.theme_config);
      setSuccess(`Age group updated to ${ageGroup}. Theme recommendations applied!`);
      
      // Auto-close success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Age group update error:', err);
      setError(err.message || 'Failed to update age group. Please make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (theme: string) => {
    setLoading(true);
    setError(null);
    try {
      const config = await firebaseThemeService.updateThemeConfig({ theme });
      setThemeConfig(config);
      setSuccess(`Theme updated to ${theme}!`);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      console.error('Theme update error:', err);
      setError(err.message || 'Failed to update theme. Please make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const handleColorSchemeChange = async (colorScheme: string) => {
    setLoading(true);
    setError(null);
    try {
      const config = await firebaseThemeService.updateThemeConfig({ color_scheme: colorScheme });
      setThemeConfig(config);
      setSuccess(`Color scheme updated!`);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      console.error('Color scheme update error:', err);
      setError(err.message || 'Failed to update color scheme. Please make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessibilityToggle = async (feature: 'accessibility_mode' | 'large_text' | 'reduced_motion', enabled: boolean) => {
    try {
      const config = await firebaseThemeService.toggleAccessibility(feature, enabled);
      setThemeConfig(config);
      setSuccess(`${feature.replace('_', ' ')} ${enabled ? 'enabled' : 'disabled'}!`);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      console.error('Accessibility toggle error:', err);
      setError(err.message || 'Failed to toggle accessibility feature. Please make sure you are logged in.');
    }
  };

  const handleQuickTheme = async (scenario: 'kids' | 'accessibility' | 'dark' | 'professional') => {
    setLoading(true);
    setError(null);
    try {
      const config = await firebaseThemeService.quickTheme(scenario);
      setThemeConfig(config);
      setSuccess(`Applied ${scenario} theme!`);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      console.error('Quick theme error:', err);
      setError(err.message || 'Failed to apply quick theme. Please make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const ageGroupIcons = {
    children: <ChildCare color="primary" />,
    teenagers: <School color="primary" />,
    young_adults: <Work color="primary" />,
    adults: <Work color="primary" />,
    older_adults: <Work color="primary" />,
    seniors: <Elderly color="primary" />,
  };

  const getAgeGroupDescription = (ageGroup: string) => {
    const descriptions: Record<string, string> = {
      children: 'Bright colors, large text, simple navigation',
      teenagers: 'Modern design, vibrant themes, social features',
      young_adults: 'Balanced design with professional and fun elements',
      adults: 'Clean, professional interface for work and travel',
      older_adults: 'Classic design with enhanced readability',
      seniors: 'Large text, high contrast, simplified interface',
    };
    return descriptions[ageGroup] || '';
  };

  if (loading && !themeConfig) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Theme Settings...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ 
        background: `linear-gradient(45deg, ${colors.neonCyan}, ${colors.neonPink})`,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Palette />
        🎨 Age Group Themes & Accessibility
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
                {success}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {themeConfig && availableOptions && (
          <Grid container spacing={3}>
            {/* Age Group Selection */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChildCare color="primary" />
                    Age Group Selection
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Age Group</InputLabel>
                    <Select
                      value={themeConfig.age_group}
                      onChange={(e) => handleAgeGroupChange(e.target.value)}
                      disabled={loading}
                    >
                      {Object.entries(availableOptions.age_groups).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {ageGroupIcons[key as keyof typeof ageGroupIcons]}
                            {label as string}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {getAgeGroupDescription(themeConfig.age_group)}
                  </Typography>

                  <Chip 
                    label={`Current: ${availableOptions.age_groups[themeConfig.age_group]}`}
                    color="primary"
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Theme Options */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🚀 Quick Themes
                  </Typography>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleQuickTheme('kids')}
                        disabled={loading}
                        startIcon={<ChildCare />}
                        sx={{ mb: 1 }}
                      >
                        Kids Mode
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleQuickTheme('accessibility')}
                        disabled={loading}
                        startIcon={<AccessibilityNew />}
                        sx={{ mb: 1 }}
                      >
                        Accessibility
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleQuickTheme('dark')}
                        disabled={loading}
                        sx={{ mb: 1 }}
                      >
                        🌙 Dark Mode
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleQuickTheme('professional')}
                        disabled={loading}
                        startIcon={<Work />}
                        sx={{ mb: 1 }}
                      >
                        Professional
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Theme Selection */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🎨 Theme Style
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={themeConfig.theme}
                      onChange={(e) => handleThemeChange(e.target.value)}
                      disabled={loading}
                    >
                      {Object.entries(availableOptions.themes).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                          {label as string}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Color Scheme</InputLabel>
                    <Select
                      value={themeConfig.color_scheme}
                      onChange={(e) => handleColorSchemeChange(e.target.value)}
                      disabled={loading}
                    >
                      {Object.entries(availableOptions.color_schemes).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                          {label as string}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>

            {/* Accessibility Features */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessibilityNew color="primary" />
                    Accessibility Features
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={themeConfig.accessibility_mode}
                          onChange={(e) => handleAccessibilityToggle('accessibility_mode', e.target.checked)}
                          disabled={loading}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessibilityNew fontSize="small" />
                          High Contrast Mode
                        </Box>
                      }
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={themeConfig.large_text}
                          onChange={(e) => handleAccessibilityToggle('large_text', e.target.checked)}
                          disabled={loading}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextIncrease fontSize="small" />
                          Large Text
                        </Box>
                      }
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={themeConfig.reduced_motion}
                          onChange={(e) => handleAccessibilityToggle('reduced_motion', e.target.checked)}
                          disabled={loading}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Animation fontSize="small" />
                          Reduce Motion
                        </Box>
                      }
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Current Configuration Display */}
            <Grid item xs={12}>
              <Card sx={{ background: `linear-gradient(45deg, ${colors.deepSpace}, ${colors.darkBg})` }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: colors.neonCyan }}>
                    🌟 Current Configuration
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`Age: ${availableOptions.age_groups[themeConfig.age_group]}`}
                      sx={{ backgroundColor: colors.neonCyan, color: colors.darkBg }}
                    />
                    <Chip 
                      label={`Theme: ${availableOptions.themes[themeConfig.theme]}`}
                      sx={{ backgroundColor: colors.neonPink, color: colors.darkBg }}
                    />
                    <Chip 
                      label={`Colors: ${availableOptions.color_schemes[themeConfig.color_scheme]}`}
                      sx={{ backgroundColor: colors.neonGreen, color: colors.darkBg }}
                    />
                    {themeConfig.accessibility_mode && (
                      <Chip 
                        label="Accessibility"
                        sx={{ backgroundColor: colors.neonOrange, color: colors.darkBg }}
                      />
                    )}
                    {themeConfig.large_text && (
                      <Chip 
                        label="Large Text"
                        sx={{ backgroundColor: colors.neonPurple, color: colors.darkBg }}
                      />
                    )}
                    {themeConfig.reduced_motion && (
                      <Chip 
                        label="Reduced Motion"
                        sx={{ backgroundColor: colors.neonBlue, color: colors.darkBg }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          onClick={() => handleQuickTheme('professional')}
          variant="outlined"
          color="warning"
          disabled={loading}
        >
          Reset to Default
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgeGroupThemePanel;