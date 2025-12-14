# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Monorepo with two primary apps:
  - frontend/: React (CRA) + TypeScript UI using MUI and Leaflet/Mapbox, Redux Toolkit, React Router. Proxies to backend during local dev.
  - backend/: Django + Django REST Framework API, organized into domain apps (authentication, trips, analytics, gamification, emergency, bookings, stores). Includes async tasks (Celery + Redis), optional real-time via Channels, and an ML area (ml_models/) for mode/purpose detection.
- API base path: http://localhost:8000/api (configurable via frontend .env)
- Frontend deploys via Vercel (vercel.json builds only frontend/). Backend must be hosted separately.

How to develop locally
Frontend (React + TypeScript)
- Setup
  - pwsh
    - cd frontend
    - npm install
    - Create frontend/.env based on the keys below
- Dev server
  - npm start
- Build
  - npm run build
- Lint/format/type-check
  - npm run lint
  - npm run format:check
  - npm run format
  - npm run type-check
- Tests
  - Run all: npm test
  - Single test file: npm test -- src/path/to/YourComponent.test.tsx
  - By name pattern: npm test -- -t "renders profile"

Required frontend env vars (frontend/.env)
- REACT_APP_API_BASE_URL=http://localhost:8000/api
- REACT_APP_FIREBASE_API_KEY=...
- REACT_APP_FIREBASE_AUTH_DOMAIN=...
- REACT_APP_FIREBASE_PROJECT_ID=...
- REACT_APP_FIREBASE_STORAGE_BUCKET=...
- REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
- REACT_APP_FIREBASE_APP_ID=...

Backend (Django + DRF)
- Setup
  - pwsh (Windows)
    - cd backend
    - python -m venv .venv
    - .venv\Scripts\Activate.ps1
    - pip install -r requirements.txt
- Database and server
  - python manage.py migrate
  - python manage.py runserver 0.0.0.0:8000
- Tests
  - Run all: python manage.py test
  - Single test (Django test label):
    - python manage.py test apps.trips.tests.test_api.TestTripAPI.test_create_trip
  - Alternative (pytest is available):
    - pytest
    - pytest apps/trips/tests/test_api.py::TestTripAPI::test_create_trip

High-level architecture and interactions
- Frontend
  - SPA built with CRA. Source under frontend/src with conventional structure (components, pages, services, store, utils). Services layer handles API calls to the backend; Redux Toolkit stores user/session, trips, analytics, and gamification state.
  - Local dev uses CRA proxy (see frontend/package.json "proxy": "http://localhost:8000") to avoid CORS when hitting Django.
- Backend
  - Django project with modular apps per domain: authentication (JWT), trips (trip logging + diary), analytics (timeline/heatmap/stats), gamification (badges, points, streaks), emergency (SOS logging), bookings (provider integration placeholders), stores (catalog/checkout logging).
  - ML: scikit-learn and TensorFlow dependencies present; models live under ml_models/ and are invoked from analytics/trips flows as needed.
  - Async and realtime: Celery + Redis for background jobs; Channels/ASGI available for real-time features; DRF and drf-spectacular for API docs.
- Data export and analytics
  - Frontend provides “Download My Data” producing a consolidated JSON. Backend analytics endpoints aggregate trip insights (timeline, heatmap, statistics) for the UI.
- Deployment
  - Frontend: vercel.json configured to build frontend/. Set REACT_APP_* in Vercel project settings.
  - Backend: deploy separately (e.g., Render/Railway/server). Expose /api endpoints consumed by the frontend via REACT_APP_API_BASE_URL.

Notes
- See README.md for end-to-end quickstart, feature list, and additional setup details (DB, deployment).
- No project-scoped Claude/Cursor/Copilot rules were found at the time of writing; if added later, summarize their key constraints here for future Warp runs.
