# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Travelogy is a React-based travel intelligence application with AI-powered features. The frontend is built with TypeScript, Material-UI, and uses Firebase for authentication and data storage. The app features a futuristic "tech" theme with holographic UI elements, animations, and real-time travel tracking.

## Development Commands

### Setup & Installation
```bash
npm install
```

### Development Server
```bash
npm start
```
Starts the development server on port 3000 with hot reloading. The app proxies backend API calls to `http://localhost:8000`.

### Build & Production
```bash
npm run build
```
Creates an optimized production build. Uses `cross-env CI=false` to ignore warnings and `NODE_OPTIONS=--openssl-legacy-provider` for compatibility.

### Testing
```bash
# Run all tests in watch mode
npm test

# Run tests once (for CI)
npm run test -- --watchAll=false
```

### Code Quality
```bash
# Run ESLint on TypeScript files
npm run lint

# Format code with Prettier
npm run format

# Check formatting without making changes
npm run format:check

# Type checking without compilation
npm run type-check
```

## Architecture Overview

### Core Structure
- **React 18** with TypeScript for type safety
- **Material-UI v5** with custom tech-themed components
- **Redux Toolkit** for state management (auth, trips, UI)
- **React Router v6** for navigation
- **Firebase** for authentication and Firestore database
- **Axios** with interceptors for API communication

### Key Directories

#### `/src/components/`
Reusable UI components including:
- **Tech-themed components**: `GlitchText`, `HolographicCard`, `NeonButton`, `TechLoader`
- **Map components**: `GlobeMap`, `LeafletMap`, `WeatherCard` (in `/maps/` subdirectory)
- **Core components**: `Navbar`, `ErrorBoundary`, `NotificationSystem`

#### `/src/pages/`
Route components for different application sections:
- `LandingPage` - Main entry point with system status
- `DashboardPageWrapper` - Main dashboard after login
- `TripsPage`, `TripsListPage`, `TripDetailsPage` - Travel tracking features
- `AnalyticsPage` - Data visualization and insights
- `WeatherPage` - Weather information with map integration

#### `/src/services/`
External service integrations:
- `api.ts` - Axios instance with auth interceptors and API endpoints
- `firebase.ts` - Firebase configuration and service initialization
- `authService.ts` - Authentication logic
- `weather.ts`, `nearby.ts` - External API integrations

#### `/src/store/`
Redux Toolkit setup:
- `store.ts` - Store configuration
- `slices/authSlice.ts` - Authentication state management
- `slices/tripsSlice.ts` - Travel data state
- `slices/uiSlice.ts` - UI state (theme, notifications)

#### `/src/styles/`
Theme and styling:
- `techTheme.ts` - Futuristic color palette and theme constants
- `dynamicTheme.ts` - Theme switching logic
- Custom Material-UI theme configuration in `App.tsx`

### State Management Pattern
The app uses Redux Toolkit with async thunks for:
- **Authentication**: Login, registration, user profile management
- **Trips**: CRUD operations, real-time tracking, analytics
- **UI**: Theme switching, notifications, loading states

### Authentication Flow
- Firebase Authentication integration
- JWT token management with refresh logic in axios interceptors  
- Protected routes (currently disabled - app runs in public mode)
- Consent management for data collection

### API Integration
- Backend API base URL: `http://localhost:8000/api` (development)
- Demo mode available via `REACT_APP_DEMO_MODE=true`
- Automatic token refresh on 401 responses
- Comprehensive error handling

## Environment Configuration

### Required Environment Variables
Copy `.env.example` to `.env.development` and configure:

```bash
# API
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_DEMO_MODE=false

# Firebase (all required)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=

# External APIs (optional)
REACT_APP_MAPBOX_TOKEN=
REACT_APP_OWM_API_KEY=
```

### TypeScript Configuration
- **Base URL**: `src/` for absolute imports
- **Target**: ES5 for compatibility
- **Strict mode**: Enabled for type safety
- **JSX**: react-jsx (React 17+ transform)

## Development Patterns

### Component Structure
Components follow this pattern:
- Use `React.FC` for functional components
- Props interfaces defined with TypeScript
- Material-UI `sx` prop for styling
- `React.memo` for performance optimization where needed

### Theming System
- Dynamic theme switching (light/dark modes)
- Multiple font options (tech, mono, grotesk, system)
- Accent color customization
- Theme persistence in localStorage

### Error Handling
- `ErrorBoundary` component for React error catching
- Axios interceptors for API errors
- Redux error state management
- User-friendly notification system

## Testing Strategy

### Current Setup
- **Jest** with React Testing Library
- **@testing-library/user-event** for interaction testing
- Setup file: `src/setupTests.ts`

### Test File Locations
- Component tests: Adjacent to components (`.test.tsx`)
- Utility tests: In `src/utils/` directory
- Page tests: Some examples in `src/pages/`

### Running Single Tests
```bash
# Run specific test file
npm test -- ComponentName.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="login"
```

## Backend Integration

### API Expectations
The frontend expects a FastAPI backend running on port 8000 with endpoints:
- `/auth/*` - Authentication endpoints
- `/trips/*` - Travel tracking and analytics
- `/bookings/*` - Hotel and train booking integration

### Mock Data
Demo mode provides realistic mock responses for development without backend dependency.

## Build & Deployment

### Production Build
The build command includes specific flags for deployment:
- `CI=false` - Treats warnings as warnings, not errors
- `NODE_OPTIONS=--openssl-legacy-provider` - Compatibility with older Node.js crypto

### Proxy Configuration
Development proxy routes API calls to avoid CORS issues:
```json
"proxy": "http://localhost:8000"
```

This routes all `/api/*` requests to the backend during development.