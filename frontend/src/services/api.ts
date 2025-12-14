import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterData, ConsentStatus, User } from '../types/auth';
import { API_BASE_URL, DEMO_MODE } from '../config/env';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await api.post('/auth/token/refresh/', {
            refresh: refreshToken,
          });
          
          localStorage.setItem('access_token', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    api.post('/auth/login/', credentials).then(res => res.data),
    
  register: (userData: RegisterData): Promise<AuthResponse> =>
    api.post('/auth/register/', userData).then(res => res.data),
    
  logout: (data: { refresh_token: string }) =>
    api.post('/auth/logout/', data).then(res => res.data),
    
  getProfile: (): Promise<User> =>
    api.get('/auth/profile/').then(res => res.data),
    
  updateProfile: (data: Partial<User>): Promise<User> =>
    api.patch('/auth/profile/', data).then(res => res.data),
  changePassword: (data: { old_password: string; new_password: string; new_password_confirm: string }) =>
    api.post('/auth/password/change/', data).then(res => res.data),
    
  checkConsent: (): Promise<ConsentStatus> =>
    api.get('/auth/consent/check/').then(res => res.data),
    
  updateConsent: (consentData: any) =>
    api.post('/auth/consent/', consentData).then(res => res.data),
};

// Trips API
export const tripsAPI = {
  getTrips: async (params?: unknown) => {
    if (DEMO_MODE) {
      return {
        results: [
          { id: 't1', start_time: new Date(Date.now()-86400000).toISOString(), end_time: new Date().toISOString(), transport_mode: 'walk', distance_km: 3.2, diary_entries: [], path: [[20,77],[20.1,77.1]] },
          { id: 't2', start_time: new Date(Date.now()-172800000).toISOString(), end_time: new Date(Date.now()-172000000).toISOString(), transport_mode: 'car', distance_km: 15.4, diary_entries: [], path: [[20.2,77.3],[20.25,77.35]] },
        ]
      };
    }
    return api.get('/trips/', { params }).then(res => res.data);
  },
    
  getTripById: async (id: string) => {
    if (DEMO_MODE) {
      return {
        id,
        path: [[20,77],[20.1,77.1],[20.12,77.12]],
        diaries: [
          { id: 'd1', note: 'Beautiful walk through the park', photos: [], created_at: new Date().toISOString() },
        ],
      };
    }
    return api.get(`/trips/${id}/`).then(res => res.data);
  },
    
  createTrip: (tripData: unknown) =>
    api.post('/trips/', tripData).then(res => res.data),
    
  updateTrip: (id: string, tripData: unknown) =>
    api.patch(`/trips/${id}/`, tripData).then(res => res.data),
    
  deleteTrip: (id: string) =>
    api.delete(`/trips/${id}/`).then(res => res.data),
    
  startTrip: (tripData: unknown) =>
    api.post('/trips/start/', tripData).then(res => res.data),
    
  completeTrip: (id: string, completionData: unknown) =>
    api.post(`/trips/${id}/complete/`, completionData).then(res => res.data),
    
  addDiary: (id: string, note: string, files: File[], captions?: (string | undefined)[]) => {
    const form = new FormData();
    form.append('note', note);
    files.forEach((f) => form.append('photos', f));
    if (captions && captions.length) {
      form.append('captions', JSON.stringify(captions));
    }
    return api.post(`/trips/${id}/diary/`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);
  },
  addDiaryUrls: (id: string, note: string, photos: Array<string | { url: string; caption?: string }>) =>
    api.post(`/trips/${id}/diary/urls/`, { note, photos }).then(res => res.data),
    
  getActiveTrip: () =>
    api.get('/trips/active/').then(res => res.data),
    
  getStats: async () => {
    if (DEMO_MODE) {
      return { total_trips: 12, total_distance: 124.3, eco_score: 82, trips_this_week: 3, mode_breakdown: { walk: 6, car: 3, bus: 2, cycle: 1 } };
    }
    return api.get('/trips/stats/').then(res => res.data);
  },
    
  getTimeline: async (params?: unknown) => {
    if (DEMO_MODE) {
      return [
        { id: 'd1', note: 'Great coffee by the lake', created_at: new Date(Date.now()-3600000).toISOString(), photos: [] },
        { id: 'd2', note: 'Train ride was smooth', created_at: new Date(Date.now()-7200000).toISOString(), photos: [] },
      ];
    }
    return api.get('/trips/timeline/', { params }).then(res => res.data);
  },
    
  getHeatmap: async () => {
    if (DEMO_MODE) {
      return [
        { lat: 20.0, lon: 77.0, weight: 1 },
        { lat: 20.2, lon: 77.3, weight: 2 },
      ];
    }
    return api.get('/trips/heatmap/').then(res => res.data);
  },
    
  predictTrip: (data: unknown) =>
    api.post('/trips/predict/', data).then(res => res.data),
  updateDiary: (tripId: string, entryId: string, payload: { note?: string; photos?: string[] }) =>
    api.patch(`/trips/${tripId}/diary/${entryId}/`, payload).then(res => res.data),
  deleteDiary: (tripId: string, entryId: string) =>
    api.delete(`/trips/${tripId}/diary/${entryId}/`).then(res => res.data),
};

// Bookings API (hotels and trains)
export const bookingsAPI = {
  searchHotels: async (params: { city?: string; check_in?: string; check_out?: string; guests?: number; provider?: string; rooms?: number; adults?: number; children?: number }) => {
    if (DEMO_MODE) {
      return [
        { id: 'h1', name: 'Neon Plaza', price: 120, rating: 4.5, address: 'Central City' },
        { id: 'h2', name: 'Quantum Suites', price: 180, rating: 4.8, address: 'Downtown' },
      ];
    }
    return api.get('/bookings/hotels/search/', { params }).then(res => res.data);
  },
  bookHotel: (data: unknown) =>
    api.post('/bookings/hotels/', data).then(res => res.data),
  searchTrains: async (params: { from?: string; to?: string; date?: string; class?: string; provider?: string; passengers?: number }) => {
    if (DEMO_MODE) {
      return [
        { id: 't101', name: 'Express 101', departure: '10:30', arrival: '12:10', class: 'AC Chair', price: 25 },
        { id: 't202', name: 'Regional 202', departure: '14:15', arrival: '17:00', class: 'Sleeper', price: 15 },
      ];
    }
    return api.get('/bookings/trains/search/', { params }).then(res => res.data);
  },
  bookTrain: (data: unknown) =>
    api.post('/bookings/trains/', data).then(res => res.data),
  getReservations: async () => {
    if (DEMO_MODE) {
      return [
        { id: 'r1', type: 'hotel', name: 'Neon Plaza', date: new Date().toISOString(), meta: { nights: 2 } },
        { id: 'r2', type: 'train', name: 'Express 101', date: new Date().toISOString(), meta: { from: 'City A', to: 'City B' } },
      ];
    }
    return api.get('/bookings/reservations/').then(res => res.data);
  }
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () =>
    api.get('/analytics/dashboard/').then(res => res.data),
  askGeminiWeather: (payload: { place?: any; weather?: any; aq?: any }) =>
    api.post('/analytics/gemini/weather_insights/', payload).then(res => res.data as { insights: string }),
  askGeminiTrip: (payload: { distance_km?: number; duration_min?: number; mode?: string; notes?: string }) =>
    api.post('/analytics/gemini/trip_insights/', payload).then(res => res.data as { insights: string }),
};

// Emergency API
export const emergencyAPI = {
  sendReport: (data: unknown) =>
    api.post('/emergency/report/', data).then(res => res.data),
};

// Gamification API
export const gamificationAPI = {
  getProfile: () =>
    api.get('/gamification/profile/').then(res => res.data),
    
  getLeaderboard: () =>
    api.get('/gamification/leaderboard/').then(res => res.data),
};


// Tourism Intelligence API (Rajasthan)
export const tourismAPI = {
  getMeta: async () => {
    if (DEMO_MODE) {
      return {
        districts: [
          { id: 1, name: 'Jaipur' },
          { id: 2, name: 'Jodhpur' },
          { id: 3, name: 'Udaipur' },
          { id: 4, name: 'Ajmer' },
          { id: 5, name: 'Bikaner' },
        ],
        attraction_types: [
          { key: 'monument', label: 'Monument' },
          { key: 'museum', label: 'Museum' },
          { key: 'park', label: 'Park' },
          { key: 'market', label: 'Market' },
          { key: 'other', label: 'Other' },
        ],
        bucket_seconds: 300,
      };
    }
    return api.get('/tourism/meta/').then((res) => res.data);
  },

  // Entry points / arrivals
  listEntryPoints: async (params?: { district_id?: string; entry_type?: string; q?: string }) => {
    if (DEMO_MODE) {
      return [
        { id: 301, name: 'Jaipur International Airport', entry_type: 'airport', district: { id: 1, name: 'Jaipur' } },
        { id: 302, name: 'Jaipur Junction', entry_type: 'rail', district: { id: 1, name: 'Jaipur' } },
        { id: 303, name: 'Jodhpur Airport', entry_type: 'airport', district: { id: 2, name: 'Jodhpur' } },
      ];
    }
    return api.get('/tourism/entry_points/', { params }).then((res) => res.data);
  },

  getEntryLive: async (params?: { minutes?: number; district_id?: string }) => {
    if (DEMO_MODE) {
      const now = new Date();
      const b = new Date(Math.floor(now.getTime() / 300000) * 300000).toISOString();
      return [
        { entry_point_id: 301, entry_point_name: 'Jaipur International Airport', district: 'Jaipur', bucket_start: b, domestic: 120, international: 22, unknown: 2, unique_visitors: 144 },
        { entry_point_id: 302, entry_point_name: 'Jaipur Junction', district: 'Jaipur', bucket_start: b, domestic: 98, international: 5, unknown: 1, unique_visitors: 104 },
      ];
    }
    return api.get('/tourism/entry/live/', { params }).then((res) => res.data);
  },

  getEntryTimeseries: async (params?: { entry_point_id?: string; district_id?: string; start?: string; end?: string }) => {
    if (DEMO_MODE) {
      const now = Date.now();
      const points: any[] = [];
      for (let i = 24; i >= 0; i--) {
        const t = new Date(Math.floor((now - i * 300000) / 300000) * 300000).toISOString();
        points.push({ bucket_start: t, domestic: Math.floor(60 + Math.random() * 70), international: Math.floor(8 + Math.random() * 20), unknown: Math.floor(Math.random() * 4) });
      }
      return points;
    }
    return api.get('/tourism/entry/timeseries/', { params }).then((res) => res.data);
  },

  listAttractions: async (params?: { district_id?: string; attraction_type?: string; q?: string }) => {
    if (DEMO_MODE) {
      return [
        { id: 101, name: 'Hawa Mahal', attraction_type: 'monument', district: { id: 1, name: 'Jaipur' }, capacity_per_5min: 500 },
        { id: 102, name: 'Amber Fort', attraction_type: 'monument', district: { id: 1, name: 'Jaipur' }, capacity_per_5min: 700 },
      ];
    }
    return api.get('/tourism/attractions/', { params }).then((res) => res.data);
  },

  getAttraction: async (id: string) => {
    if (DEMO_MODE) {
      return { id, name: `Attraction ${id}`, attraction_type: 'other', district: { id: 1, name: 'Jaipur' } };
    }
    return api.get(`/tourism/attractions/${id}/`).then((res) => res.data);
  },

  getFootfallLive: async (params?: { minutes?: number; district_id?: string }) => {
    if (DEMO_MODE) {
      const now = new Date();
      const b = new Date(Math.floor(now.getTime() / 300000) * 300000).toISOString();
      return [
        { attraction_id: 101, attraction_name: 'Hawa Mahal', district: 'Jaipur', bucket_start: b, unique_visitors: 214, capacity_per_5min: 500, crowd_threshold_warn: 375, crowd_threshold_critical: 450, utilization_ratio: 214 / 500, crowd_status: 'normal' },
        { attraction_id: 102, attraction_name: 'Amber Fort', district: 'Jaipur', bucket_start: b, unique_visitors: 610, capacity_per_5min: 700, crowd_threshold_warn: 525, crowd_threshold_critical: 630, utilization_ratio: 610 / 700, crowd_status: 'warn' },
      ];
    }
    return api.get('/tourism/footfall/live/', { params }).then((res) => res.data);
  },

  // Direction-aware "presence" (in/out net) since start
  getFootfallPresence: async (params?: { attraction_id?: string; district_id?: string; start?: string; end?: string }) => {
    if (DEMO_MODE) {
      const now = new Date();
      const b = new Date(Math.floor(now.getTime() / 300000) * 300000).toISOString();
      const start = new Date(now.getTime() - 6 * 3600000).toISOString();
      const end = now.toISOString();
      return [
        { attraction_id: 101, attraction_name: 'Hawa Mahal', district: 'Jaipur', window: { start, end }, bucket_start: b, in_unique: 180, out_unique: 140, net: 40, cumulative_net: 220, capacity_per_5min: 500, crowd_threshold_warn: 375, crowd_threshold_critical: 450, utilization_ratio: 220 / 500, crowd_status: 'normal' },
        { attraction_id: 102, attraction_name: 'Amber Fort', district: 'Jaipur', window: { start, end }, bucket_start: b, in_unique: 210, out_unique: 160, net: 50, cumulative_net: 520, capacity_per_5min: 700, crowd_threshold_warn: 525, crowd_threshold_critical: 630, utilization_ratio: 520 / 700, crowd_status: 'warn' },
      ];
    }
    return api.get('/tourism/footfall/presence/', { params }).then((res) => res.data);
  },

  getFootfallTimeseries: async (params?: { attraction_id?: string; district_id?: string; start?: string; end?: string }) => {
    if (DEMO_MODE) {
      const now = Date.now();
      const points: any[] = [];
      for (let i = 24; i >= 0; i--) {
        const t = new Date(Math.floor((now - i * 300000) / 300000) * 300000).toISOString();
        points.push({ bucket_start: t, domestic: Math.floor(50 + Math.random() * 80), international: Math.floor(5 + Math.random() * 20), unknown: Math.floor(Math.random() * 5) });
      }
      return points;
    }
    return api.get('/tourism/footfall/timeseries/', { params }).then((res) => res.data);
  },

  listHotels: async (params?: { district_id?: string; q?: string }) => {
    if (DEMO_MODE) {
      return [
        { id: 201, name: 'Heritage Haveli', district: { id: 1, name: 'Jaipur' }, rating: 4.4, rooms_total: 42, category: 'Heritage' },
        { id: 202, name: 'Pink City Inn', district: { id: 1, name: 'Jaipur' }, rating: 4.1, rooms_total: 60, category: 'Hotel' },
        { id: 203, name: 'Blue City Residency', district: { id: 2, name: 'Jodhpur' }, rating: 4.2, rooms_total: 55, category: 'Hotel' },
        { id: 204, name: 'Lakeview Resort', district: { id: 3, name: 'Udaipur' }, rating: 4.7, rooms_total: 80, category: 'Resort' },
      ];
    }
    return api.get('/tourism/hotels/', { params }).then((res) => res.data);
  },

  getHotelSnapshots: async (params?: { hotel_id?: string; district_id?: string; start?: string; end?: string }) => {
    if (DEMO_MODE) {
      const now = Date.now();
      const points: any[] = [];
      for (let i = 28; i >= 0; i--) {
        const ts = new Date(now - i * 6 * 3600000).toISOString();
        const roomsTotal = 60;
        const occ = Math.min(0.95, Math.max(0.2, 0.55 + (Math.random() - 0.5) * 0.12));
        const roomsAvailable = Math.max(0, Math.round(roomsTotal * (1 - occ)));
        points.push({ id: 1000 + i, hotel_id: 201, hotel_name: 'Heritage Haveli', district_id: 1, district: 'Jaipur', ts, rooms_available: roomsAvailable, rooms_total: roomsTotal, occupancy_ratio: occ, source: 'demo' });
      }
      return points;
    }
    return api.get('/tourism/hotels/snapshots/', { params }).then((res) => res.data);
  },

  getHotelUtilization: async (params?: { district_id?: string; start?: string; end?: string }) => {
    if (DEMO_MODE) {
      return {
        window: { start: new Date(Date.now() - 7 * 86400000).toISOString(), end: new Date().toISOString() },
        districts: [
          { district_id: 1, district: 'Jaipur', hotels: 2, rooms_total_sum: 102, snapshots: 30, occupancy_avg: 0.74 },
          { district_id: 2, district: 'Jodhpur', hotels: 1, rooms_total_sum: 55, snapshots: 18, occupancy_avg: 0.66 },
          { district_id: 3, district: 'Udaipur', hotels: 1, rooms_total_sum: 80, snapshots: 18, occupancy_avg: 0.81 },
        ],
        rating_bands: [
          { band: '3to4', snapshots: 20, occupancy_avg: 0.69 },
          { band: '4to5', snapshots: 40, occupancy_avg: 0.78 },
          { band: 'unknown', snapshots: 0, occupancy_avg: null },
        ],
      };
    }
    return api.get('/tourism/hotels/utilization/', { params }).then((res) => res.data);
  },

  getInsightsOverview: async (params?: { district_id?: string; days?: number; live_minutes?: number }) => {
    if (DEMO_MODE) {
      const daily_totals = Array.from({ length: 14 }).map((_, i) => {
        const d = new Date(Date.now() - (13 - i) * 86400000);
        return { date: d.toISOString().slice(0, 10), visitors: Math.floor(900 + Math.random() * 1200) };
      });
      return {
        window: { start: new Date(Date.now() - 14 * 86400000).toISOString(), end: new Date().toISOString(), live_start: new Date(Date.now() - 3600000).toISOString() },
        top_crowded: [
          { attraction_id: 102, attraction_name: 'Amber Fort', district: 'Jaipur', live_unique_visitors: 820, crowd_status: 'warn', capacity_per_5min: 700 },
          { attraction_id: 101, attraction_name: 'Hawa Mahal', district: 'Jaipur', live_unique_visitors: 540, crowd_status: 'normal', capacity_per_5min: 500 },
        ],
        peak_hours: Array.from({ length: 24 }).map((_, h) => ({ hour: h, visitors: Math.floor(50 + 200 * Math.max(0, Math.sin((h - 9) / 24 * Math.PI * 2))) })),
        peak_weekdays: Array.from({ length: 7 }).map((_, d) => ({ weekday: d, visitors: Math.floor(300 + Math.random() * 600) })),
        daily_totals,
        peak_days: [...daily_totals].sort((a, b) => b.visitors - a.visitors).slice(0, 5),
        under_utilized: [
          { attraction_id: 401, attraction_name: 'Junagarh Fort', district: 'Bikaner', capacity_per_5min: 350, avg_unique_per_bucket: 38, utilization_ratio: 0.11 },
          { attraction_id: 402, attraction_name: 'Jaswant Thada', district: 'Jodhpur', capacity_per_5min: 250, avg_unique_per_bucket: 32, utilization_ratio: 0.13 },
        ],
      };
    }
    return api.get('/tourism/insights/overview/', { params }).then((res) => res.data);
  },

  getInsightsGaps: async (params?: { days?: number }) => {
    if (DEMO_MODE) {
      return {
        window: { start: new Date(Date.now() - 14 * 86400000).toISOString(), end: new Date().toISOString() },
        districts: [
          { district_id: 1, district: 'Jaipur', demand_total: 16000, demand_per_day: 1142, hotel_rooms_total: 102, occupancy_avg: 0.74, available_rooms_est: 26.5, gap_score: 1129, recommendation: 'increase_capacity_or_redirect' },
          { district_id: 3, district: 'Udaipur', demand_total: 8200, demand_per_day: 586, hotel_rooms_total: 80, occupancy_avg: 0.81, available_rooms_est: 15.2, gap_score: 578, recommendation: 'increase_capacity_or_redirect' },
          { district_id: 5, district: 'Bikaner', demand_total: 1800, demand_per_day: 128, hotel_rooms_total: 38, occupancy_avg: 0.55, available_rooms_est: 17.1, gap_score: 119, recommendation: 'monitor' },
        ],
      };
    }
    return api.get('/tourism/insights/gaps/', { params }).then((res) => res.data);
  },

  uploadHotelRegistryCsv: async (file: File) => {
    if (DEMO_MODE) {
      return { status: 'ok', created: 10, updated: 0 };
    }
    const form = new FormData();
    form.append('file', file);
    return api.post('/tourism/ingest/hotels/registry_csv/', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) => res.data);
  },

  uploadHotelSnapshotCsv: async (file: File) => {
    if (DEMO_MODE) {
      return { status: 'ok', ingested: 120 };
    }
    const form = new FormData();
    form.append('file', file);
    return api.post('/tourism/ingest/hotels/snapshot_csv/', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) => res.data);
  },
};

// Stores API (local stores / groceries)
export const storesAPI = {
  getStores: async (params?: { q?: string }) => {
    if (DEMO_MODE) {
      return [
        { id: 's1', name: 'City Mart', items: [ { id: 'i1', name: 'Apples (1kg)', price: 3.5 }, { id: 'i2', name: 'Milk (1L)', price: 1.2 } ] },
        { id: 's2', name: 'Green Grocer', items: [ { id: 'i3', name: 'Bananas (1kg)', price: 2.8 }, { id: 'i4', name: 'Bread', price: 1.0 } ] },
      ];
    }
    return api.get('/stores/', { params }).then(res => res.data);
  },
  checkout: async (payload: { items: Array<{ store_id: string; item_id: string; qty: number }> }) => {
    if (DEMO_MODE) {
      return { status: 'ok', order_id: 'demo-order-1' };
    }
    return api.post('/stores/checkout/', payload).then(res => res.data);
  }
};

export default api;
