// AI Trip Planner with Machine Learning
export { default as AITripPlanner } from './AITripPlanner';
export { default as AITripPlannerWithLearning } from './AITripPlannerWithLearning';

// Services
export { default as AIRecommendationEngine } from './services/AIRecommendationEngine';
export { default as WeatherService } from './services/WeatherService';

// Components
export { default as UserBehaviorTracker, useTracking, TrackingTrigger, withTracking } from './components/UserBehaviorTracker';

// Types
export type {
  UserProfile,
  UserPreferences,
  UserBehavior,
  CompletedTrip,
  PredictionResult,
  ActivityRecommendation,
  BudgetOptimization,
  TimingRecommendation,
  AlternativeOption,
  MLFeatures
} from './services/AIRecommendationEngine';

export type {
  WeatherData,
  DailyForecast,
  MonthlyAverage,
  WeatherRecommendation
} from './services/WeatherService';