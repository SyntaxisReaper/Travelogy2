/**
 * Enhanced Theme Service with Age Group Support
 * Connects all theme buttons to backend functionality
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/env';

// API instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ThemeConfig {
  age_group: string;
  theme: string;
  color_scheme: string;
  accessibility_mode: boolean;
  large_text: boolean;
  reduced_motion: boolean;
  animation_speed?: string;
  high_contrast?: boolean;
}

export interface AgeGroup {
  id: string;
  label: string;
}

export interface ThemeOption {
  id: string;
  label: string;
}

export interface ColorScheme {
  id: string;
  label: string;
}

// Theme Service Class
class ThemeService {
  private themeConfig: ThemeConfig | null = null;
  private listeners: Array<(config: ThemeConfig) => void> = [];

  /**
   * Subscribe to theme changes
   */
  subscribe(callback: (config: ThemeConfig) => void) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of theme changes
   */
  private notifyListeners(config: ThemeConfig) {
    this.themeConfig = config;
    this.listeners.forEach(callback => callback(config));
  }

  /**
   * Get current theme configuration from backend
   */
  async getThemeConfig(): Promise<ThemeConfig> {
    try {
      const response = await api.get('/auth/theme/');
      const config = response.data.theme_config;
      this.notifyListeners(config);
      return config;
    } catch (error) {
      console.error('Failed to get theme config:', error);
      
      // Return default theme config
      const defaultConfig: ThemeConfig = {
        age_group: 'adults',
        theme: 'default',
        color_scheme: 'default',
        accessibility_mode: false,
        large_text: false,
        reduced_motion: false,
      };
      
      this.notifyListeners(defaultConfig);
      return defaultConfig;
    }
  }

  /**
   * Update theme configuration
   */
  async updateThemeConfig(updates: Partial<ThemeConfig>): Promise<ThemeConfig> {
    try {
      const response = await api.post('/auth/theme/', updates);
      const config = response.data.theme_config;
      this.notifyListeners(config);
      
      // Apply theme immediately
      this.applyTheme(config);
      
      return config;
    } catch (error) {
      console.error('Failed to update theme config:', error);
      throw error;
    }
  }

  /**
   * Set age group and get recommended theme
   */
  async setAgeGroup(ageGroup: string, dateOfBirth?: string): Promise<{
    age_group: string;
    recommended_theme: string;
    theme_config: ThemeConfig;
    is_minor: boolean;
    requires_parental_consent: boolean;
  }> {
    try {
      const payload: any = { age_group: ageGroup };
      if (dateOfBirth) {
        payload.date_of_birth = dateOfBirth;
      }

      const response = await api.post('/auth/age-group/', payload);
      const config = response.data.theme_config;
      this.notifyListeners(config);
      
      // Apply theme immediately
      this.applyTheme(config);
      
      return response.data;
    } catch (error) {
      console.error('Failed to set age group:', error);
      throw error;
    }
  }

  /**
   * Get available themes and age groups
   */
  async getAvailableOptions(): Promise<{
    themes: Record<string, string>;
    age_groups: Record<string, string>;
    color_schemes: Record<string, string>;
  }> {
    try {
      const response = await api.get('/auth/themes/available/');
      return response.data;
    } catch (error) {
      console.error('Failed to get available themes:', error);
      
      // Return default options
      return {
        themes: {
          default: 'Default',
          kids: 'Kids Mode',
          teen: 'Teen Mode',
          professional: 'Professional',
          classic: 'Classic',
          high_contrast: 'High Contrast',
          large_text: 'Large Text',
        },
        age_groups: {
          children: 'Children (0-12)',
          teenagers: 'Teenagers (13-17)',
          young_adults: 'Young Adults (18-24)',
          adults: 'Adults (25-45)',
          older_adults: 'Older Adults (46-64)',
          seniors: 'Seniors (65+)',
        },
        color_schemes: {
          default: 'Default',
          bright: 'Bright Colors',
          pastel: 'Soft Pastels',
          dark: 'Dark Mode',
          high_contrast: 'High Contrast',
          monochrome: 'Monochrome',
        },
      };
    }
  }

  /**
   * Toggle accessibility features
   */
  async toggleAccessibility(feature: 'accessibility_mode' | 'large_text' | 'reduced_motion', enabled: boolean): Promise<ThemeConfig> {
    try {
      const response = await api.post('/auth/accessibility/toggle/', {
        feature,
        enabled,
      });
      
      const config = response.data.theme_config;
      this.notifyListeners(config);
      
      // Apply theme immediately
      this.applyTheme(config);
      
      return config;
    } catch (error) {
      console.error('Failed to toggle accessibility:', error);
      throw error;
    }
  }

  /**
   * Apply theme to the DOM
   */
  applyTheme(config: ThemeConfig) {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove(
      'theme-default', 'theme-kids', 'theme-teen', 'theme-professional', 
      'theme-classic', 'theme-high-contrast', 'theme-large-text',
      'scheme-default', 'scheme-bright', 'scheme-pastel', 'scheme-dark',
      'scheme-high-contrast', 'scheme-monochrome',
      'age-children', 'age-teenagers', 'age-young-adults', 'age-adults',
      'age-older-adults', 'age-seniors'
    );
    
    // Apply theme classes
    root.classList.add(`theme-${config.theme}`);
    root.classList.add(`scheme-${config.color_scheme}`);
    root.classList.add(`age-${config.age_group}`);
    
    // Apply accessibility settings
    if (config.accessibility_mode) {
      root.classList.add('accessibility-mode');
    } else {
      root.classList.remove('accessibility-mode');
    }
    
    if (config.large_text) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    if (config.reduced_motion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Set CSS custom properties for dynamic theming
    root.style.setProperty('--theme-name', config.theme);
    root.style.setProperty('--age-group', config.age_group);
    root.style.setProperty('--color-scheme', config.color_scheme);
    
    // Animation speed based on age group
    if (config.age_group === 'children' || config.age_group === 'teenagers') {
      root.style.setProperty('--animation-duration', '0.2s');
      root.style.setProperty('--animation-easing', 'ease-out');
    } else if (config.age_group === 'older_adults' || config.age_group === 'seniors') {
      root.style.setProperty('--animation-duration', '0.5s');
      root.style.setProperty('--animation-easing', 'ease-in-out');
    } else {
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--animation-easing', 'ease');
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('theme_config', JSON.stringify(config));
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: config 
    }));
  }

  /**
   * Load theme from localStorage
   */
  loadStoredTheme(): ThemeConfig | null {
    try {
      const stored = localStorage.getItem('theme_config');
      if (stored) {
        const config = JSON.parse(stored);
        this.applyTheme(config);
        return config;
      }
    } catch (error) {
      console.error('Failed to load stored theme:', error);
    }
    return null;
  }

  /**
   * Get age-appropriate theme suggestions
   */
  getAgeAppropriateSuggestions(ageGroup: string): {
    themes: string[];
    colorSchemes: string[];
    features: string[];
  } {
    const suggestions: Record<string, any> = {
      children: {
        themes: ['kids', 'default'],
        colorSchemes: ['bright', 'pastel'],
        features: ['large_text', 'reduced_motion'],
      },
      teenagers: {
        themes: ['teen', 'default'],
        colorSchemes: ['bright', 'dark'],
        features: [],
      },
      young_adults: {
        themes: ['default', 'professional'],
        colorSchemes: ['default', 'dark'],
        features: [],
      },
      adults: {
        themes: ['professional', 'default'],
        colorSchemes: ['default', 'dark'],
        features: [],
      },
      older_adults: {
        themes: ['classic', 'large_text'],
        colorSchemes: ['default', 'high_contrast'],
        features: ['large_text'],
      },
      seniors: {
        themes: ['large_text', 'classic'],
        colorSchemes: ['high_contrast', 'default'],
        features: ['large_text', 'accessibility_mode'],
      },
    };
    
    return suggestions[ageGroup] || suggestions.adults;
  }

  /**
   * Quick theme switcher for common scenarios
   */
  async quickTheme(scenario: 'kids' | 'accessibility' | 'dark' | 'professional'): Promise<ThemeConfig> {
    const configs: Record<string, Partial<ThemeConfig>> = {
      kids: {
        theme: 'kids',
        color_scheme: 'bright',
        large_text: true,
      },
      accessibility: {
        theme: 'high_contrast',
        color_scheme: 'high_contrast',
        accessibility_mode: true,
        large_text: true,
        reduced_motion: true,
      },
      dark: {
        theme: 'default',
        color_scheme: 'dark',
      },
      professional: {
        theme: 'professional',
        color_scheme: 'default',
        accessibility_mode: false,
        large_text: false,
        reduced_motion: false,
      },
    };
    
    return this.updateThemeConfig(configs[scenario]);
  }

  /**
   * Reset theme to defaults based on age group
   */
  async resetTheme(): Promise<ThemeConfig> {
    const currentConfig = this.themeConfig || await this.getThemeConfig();
    const suggestions = this.getAgeAppropriateSuggestions(currentConfig.age_group);
    
    return this.updateThemeConfig({
      theme: suggestions.themes[0],
      color_scheme: suggestions.colorSchemes[0],
      accessibility_mode: false,
      large_text: suggestions.features.includes('large_text'),
      reduced_motion: suggestions.features.includes('reduced_motion'),
    });
  }
}

// Create singleton instance
export const themeService = new ThemeService();

// Initialize theme on app load
export const initializeTheme = async () => {
  // First try to load stored theme
  const stored = themeService.loadStoredTheme();
  
  // Then fetch current theme from backend (if user is authenticated)
  try {
    const token = localStorage.getItem('access_token');
    if (token) {
      await themeService.getThemeConfig();
    }
  } catch (error) {
    console.log('No authenticated user, using stored or default theme');
  }
  
  return stored;
};

export default themeService;