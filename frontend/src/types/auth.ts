export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  photo_url?: string;
  location_tracking_consent: boolean;
  data_sharing_consent: boolean;
  analytics_consent: boolean;
  marketing_consent: boolean;
  created_at: string;
  last_activity: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  location_tracking_consent: boolean;
  data_sharing_consent: boolean;
  analytics_consent?: boolean;
  marketing_consent?: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface ConsentStatus {
  has_basic_consent: boolean;
  location_tracking: boolean;
  data_sharing: boolean;
  analytics: boolean;
  marketing: boolean;
}