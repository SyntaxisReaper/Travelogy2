/**
 * Firebase Theme Service - Real implementation that stores user preferences in Firestore
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export interface ThemeConfig {
  age_group: string;
  theme: string;
  color_scheme: string;
  accessibility_mode: boolean;
  large_text: boolean;
  reduced_motion: boolean;
  animation_speed?: string;
  high_contrast?: boolean;
  font_size?: 'small' | 'medium' | 'large' | 'extra-large';
  created_at?: any;
  updated_at?: any;
}

export interface AvailableOptions {
  themes: Record<string, string>;
  age_groups: Record<string, string>;
  color_schemes: Record<string, string>;
}

// Theme configurations for different age groups
const AGE_GROUP_THEMES = {
  children: {
    theme: 'kids',
    color_scheme: 'bright',
    large_text: true,
    animation_speed: 'slow',
    high_contrast: false,
    font_size: 'large' as const
  },
  teenagers: {
    theme: 'modern',
    color_scheme: 'vibrant',
    large_text: false,
    animation_speed: 'fast',
    high_contrast: false,
    font_size: 'medium' as const
  },
  young_adults: {
    theme: 'balanced',
    color_scheme: 'cool',
    large_text: false,
    animation_speed: 'medium',
    high_contrast: false,
    font_size: 'medium' as const
  },
  adults: {
    theme: 'professional',
    color_scheme: 'neutral',
    large_text: false,
    animation_speed: 'medium',
    high_contrast: false,
    font_size: 'medium' as const
  },
  older_adults: {
    theme: 'classic',
    color_scheme: 'warm',
    large_text: true,
    animation_speed: 'slow',
    high_contrast: true,
    font_size: 'large' as const
  },
  seniors: {
    theme: 'accessible',
    color_scheme: 'high_contrast',
    large_text: true,
    animation_speed: 'none',
    high_contrast: true,
    font_size: 'extra-large' as const
  }
};

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  age_group: 'adults',
  theme: 'professional',
  color_scheme: 'neutral',
  accessibility_mode: false,
  large_text: false,
  reduced_motion: false,
  animation_speed: 'medium',
  high_contrast: false,
  font_size: 'medium'
};

const AVAILABLE_OPTIONS: AvailableOptions = {
  themes: {
    kids: 'Kids Mode - Colorful & Fun',
    modern: 'Modern - Sleek & Contemporary',
    balanced: 'Balanced - Professional & Fun',
    professional: 'Professional - Clean & Efficient',
    classic: 'Classic - Traditional & Reliable',
    accessible: 'Accessible - High Contrast & Large Text',
    dark: 'Dark Mode - Easy on Eyes',
    light: 'Light Mode - Bright & Clear'
  },
  age_groups: {
    children: 'Children (0-12)',
    teenagers: 'Teenagers (13-17)',
    young_adults: 'Young Adults (18-24)',
    adults: 'Adults (25-45)',
    older_adults: 'Older Adults (46-64)',
    seniors: 'Seniors (65+)'
  },
  color_schemes: {
    bright: 'Bright - Vibrant Colors',
    vibrant: 'Vibrant - Bold & Energetic',
    cool: 'Cool - Blues & Greens',
    neutral: 'Neutral - Balanced Tones',
    warm: 'Warm - Earth Tones',
    high_contrast: 'High Contrast - Maximum Readability',
    dark: 'Dark - Dark Background',
    light: 'Light - Light Background'
  }
};

class FirebaseThemeService {
  private themeConfig: ThemeConfig | null = null;
  private listeners: Array<(config: ThemeConfig) => void> = [];
  private currentUser: User | null = null;

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.loadUserTheme(user.uid);
      }
    });
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(callback: (config: ThemeConfig) => void) {
    this.listeners.push(callback);
    
    // Send current config immediately if available
    if (this.themeConfig) {
      callback(this.themeConfig);
    }
    
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
    
    // Apply theme to DOM
    this.applyThemeToDom(config);
  }

  /**
   * Load user theme from Firestore
   */
  private async loadUserTheme(uid: string) {
    try {
      const themeDoc = await getDoc(doc(db, 'user_themes', uid));
      
      if (themeDoc.exists()) {
        const config = themeDoc.data() as ThemeConfig;
        this.notifyListeners(config);
      } else {
        // Create default theme for new user
        const defaultConfig = { ...DEFAULT_THEME_CONFIG };
        await this.saveThemeConfig(uid, defaultConfig);
        this.notifyListeners(defaultConfig);
      }
    } catch (error) {
      console.error('Failed to load user theme:', error);
      this.notifyListeners(DEFAULT_THEME_CONFIG);
    }
  }

  /**
   * Save theme config to Firestore
   */
  private async saveThemeConfig(uid: string, config: ThemeConfig): Promise<void> {
    const themeData = {
      ...config,
      updated_at: serverTimestamp(),
      created_at: this.themeConfig?.created_at || serverTimestamp()
    };

    await setDoc(doc(db, 'user_themes', uid), themeData, { merge: true });
  }

  /**
   * Get current theme configuration
   */
  async getThemeConfig(): Promise<ThemeConfig> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    if (this.themeConfig) {
      return this.themeConfig;
    }

    // Load from Firestore
    await this.loadUserTheme(this.currentUser.uid);
    return this.themeConfig || DEFAULT_THEME_CONFIG;
  }

  /**
   * Update theme configuration
   */
  async updateThemeConfig(updates: Partial<ThemeConfig>): Promise<ThemeConfig> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const currentConfig = this.themeConfig || DEFAULT_THEME_CONFIG;
    const newConfig = { ...currentConfig, ...updates };
    
    await this.saveThemeConfig(this.currentUser.uid, newConfig);
    this.notifyListeners(newConfig);
    
    return newConfig;
  }

  /**
   * Set age group and apply recommended theme
   */
  async setAgeGroup(ageGroup: string): Promise<{
    age_group: string;
    recommended_theme: string;
    theme_config: ThemeConfig;
  }> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const recommendedSettings = AGE_GROUP_THEMES[ageGroup as keyof typeof AGE_GROUP_THEMES] 
      || AGE_GROUP_THEMES.adults;

    const currentConfig = this.themeConfig || DEFAULT_THEME_CONFIG;
    const newConfig: ThemeConfig = {
      ...currentConfig,
      age_group: ageGroup,
      ...recommendedSettings
    };

    await this.saveThemeConfig(this.currentUser.uid, newConfig);
    this.notifyListeners(newConfig);

    return {
      age_group: ageGroup,
      recommended_theme: recommendedSettings.theme,
      theme_config: newConfig
    };
  }

  /**
   * Toggle accessibility features
   */
  async toggleAccessibility(feature: keyof Pick<ThemeConfig, 'accessibility_mode' | 'large_text' | 'reduced_motion'>, enabled: boolean): Promise<ThemeConfig> {
    const updates: Partial<ThemeConfig> = {
      [feature]: enabled
    };

    // Auto-adjust other settings for accessibility
    if (feature === 'accessibility_mode' && enabled) {
      updates.large_text = true;
      updates.high_contrast = true;
      updates.reduced_motion = true;
      updates.font_size = 'large';
    }

    return this.updateThemeConfig(updates);
  }

  /**
   * Apply quick theme presets
   */
  async quickTheme(scenario: 'kids' | 'accessibility' | 'dark' | 'professional'): Promise<ThemeConfig> {
    const presets = {
      kids: {
        theme: 'kids',
        color_scheme: 'bright',
        large_text: true,
        accessibility_mode: false,
        reduced_motion: false,
        font_size: 'large' as const
      },
      accessibility: {
        theme: 'accessible',
        color_scheme: 'high_contrast',
        large_text: true,
        accessibility_mode: true,
        reduced_motion: true,
        high_contrast: true,
        font_size: 'extra-large' as const
      },
      dark: {
        theme: 'dark',
        color_scheme: 'dark',
        large_text: false,
        accessibility_mode: false,
        reduced_motion: false,
        font_size: 'medium' as const
      },
      professional: {
        theme: 'professional',
        color_scheme: 'neutral',
        large_text: false,
        accessibility_mode: false,
        reduced_motion: false,
        font_size: 'medium' as const
      }
    };

    return this.updateThemeConfig(presets[scenario]);
  }

  /**
   * Get available options
   */
  async getAvailableOptions(): Promise<AvailableOptions> {
    return AVAILABLE_OPTIONS;
  }

  /**
   * Apply theme to DOM
   */
  private applyThemeToDom(config: ThemeConfig) {
    const root = document.documentElement;
    
    // Set CSS custom properties
    root.setAttribute('data-theme', config.theme);
    root.setAttribute('data-color-scheme', config.color_scheme);
    root.setAttribute('data-age-group', config.age_group);
    
    // Font size
    const fontSizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '22px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[config.font_size || 'medium']);
    
    // Accessibility features
    if (config.large_text) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    if (config.high_contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    if (config.reduced_motion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Animation speed
    const animationSpeedMap = {
      'none': '0s',
      'slow': '0.8s',
      'medium': '0.3s',
      'fast': '0.15s'
    };
    const speed = config.animation_speed || 'medium';
    root.style.setProperty('--animation-duration', animationSpeedMap[speed as keyof typeof animationSpeedMap]);
    
    console.log('Theme applied:', config);
  }
}

// Export singleton instance
const firebaseThemeService = new FirebaseThemeService();
export default firebaseThemeService;