# Travelogy

A smart travel diary with live trip tracking, diaries (photos + notes), analytics, gamification (badges, streaks), bookings (hotels/trains), emergency SOS, local stores/checkout, and a polished React (CRA) frontend.

This repo contains:
- frontend: React + TypeScript (CRA), MUI, Leaflet
- backend: Django + DRF

## Quick start (local)

### Frontend
```
cd frontend
npm install
# Set environment variables in .env (see .env.example)
npm start
```

Environment variables (.env in `frontend/`):
```
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

### Backend (Django)
```
cd backend
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

The API will be available at http://localhost:8000/api

## Vercel deployment (frontend)
This repository includes `vercel.json` configured to build the frontend only using `@vercel/static-build`.

1. Push this repository to GitHub (main branch).
2. In Vercel, import the repository and select the root as the project.
3. Vercel will detect and run the build in `frontend/`.
4. Set Environment Variables in Vercel Project Settings (Build & Runtime):
   - REACT_APP_API_BASE_URL=https://<your-backend-domain>/api
   - REACT_APP_FIREBASE_* (as needed)
5. Deploy.

Note: The Django backend should be hosted separately (e.g., Render, Railway, or your server). The frontend talks to the backend via `REACT_APP_API_BASE_URL`.

## Features
- Live Trip Tracking (Leaflet map, follow mode, accuracy circle)
- Trip Diary with photo uploads (Firebase Storage or multipart) and captions
- Trip Details with edit/delete diary, export GeoJSON/GPX
- Analytics: heatmap/timeline/stats
- Gamification: badges, points, streaks (local fallback if backend data missing)
- Bookings: hotels/trains (backend endpoints ready to integrate providers)
- Emergency SOS: global FAB and inline on profile; backend logging endpoint
- Local Stores: catalog search and checkout (backend logging endpoint)

## Tourism Intelligence (Rajasthan) – new (additive)
This repo now includes a non-breaking Tourism Intelligence module:
- Frontend routes under `/ti/*` (Dashboard, Live Footfall, Attractions, Hotels, CSV Ingestion)
- Backend endpoints under `/api/tourism/*`
- Footfall is stored using privacy-preserving **hashed visitor tokens** and aggregated in **5-minute buckets**.

### Seed demo data (recommended first run)
After backend migrations:
- `python backend/manage.py seed_tourism_demo`

CSV templates and samples:
- `docs/tourism/hotel_registry_template.csv`
- `docs/tourism/hotel_snapshot_template.csv`

## Monorepo structure
- `frontend/`: CRA React app
- `backend/`: Django project with apps: authentication, trips, gamification, analytics, emergency, bookings, stores
- `vercel.json`: Vercel config to build the frontend

## Scripts
- Frontend build: `npm run build` (in `frontend/`)
- Backend dev server: `python manage.py runserver`

## Data export
- Frontend Profile -> Download My Data bundles profile, trips, reservations, and gamification into a single JSON.

## Provider integration
The backend bookings routes include placeholders. To wire providers like Amadeus/Railway:
- Add provider keys as server env vars
- Implement the API calls in `apps/bookings/views.py` where indicated
- Normalize responses for the frontend

## License
MIT

# 🌍 TraveLogy - AI-Powered Travel Diary App

A smart travel diary application that automatically captures trip details and provides valuable data for transport planning while maintaining user privacy.

## 🚀 Features

### 📱 Core Features
- **Smart Trip Detection**: Automatic trip start/end detection
- **AI-Powered Mode Detection**: Walk, cycle, bike, car, bus, metro classification
- **Trip Purpose Prediction**: Work, School, Shopping, Leisure categorization
- **Privacy-First Design**: User consent, data anonymization, local storage
- **Gamification**: Points, streaks, badges, and leaderboards
- **Companion Logging**: Track co-travelers

### 📊 Analytics Dashboard
- **User Management**: Anonymized user analytics
- **Trip Insights**: Timeline visualization and heatmaps
- **Data Export**: CSV/Excel export for planners
- **Peak Analysis**: Traffic patterns and mode distribution

## 🛠️ Tech Stack

### Backend
- **Framework**: Django REST Framework
- **Database**: PostgreSQL
- **AI/ML**: Scikit-learn, TensorFlow
- **Authentication**: JWT tokens

### Frontend
- **Framework**: React with Material-UI
- **State Management**: Redux Toolkit
- **Maps**: Mapbox/Google Maps
- **Charts**: Recharts
- **Routing**: React Router

## 🏗️ Project Structure

```
travelogy/
├── backend/                 # Django REST API
│   ├── travelogy_backend/  # Main Django project
│   ├── apps/               # Django apps
│   │   ├── authentication/ # User auth & consent
│   │   ├── trips/          # Trip management
│   │   ├── analytics/      # Data analytics
│   │   └── gamification/   # Points & badges
│   ├── ml_models/          # AI/ML models
│   └── requirements.txt
├── frontend/               # React web app
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls
│   │   ├── store/          # Redux store
│   │   └── utils/          # Utility functions
│   └── package.json
└── docs/                   # Documentation
```

## 🚦 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 12+

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Database Setup
```sql
CREATE DATABASE travelogy;
CREATE USER travelogy_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE travelogy TO travelogy_user;
```

## 🔐 Privacy & Security
- End-to-end encryption for sensitive data
- Anonymized data sharing options
- GDPR compliance
- Local data storage with optional cloud sync

## 🎯 Development Phases

### ✅ Phase 1: Core App
- User authentication and consent
- Basic trip logging
- Manual data entry

### ✅ Phase 2: AI Integration
- Mode detection algorithms
- Purpose prediction models
- Data validation systems

### ✅ Phase 3: Dashboard
- Analytics visualization
- Data filtering and export
- Admin management tools

### ✅ Phase 4: Advanced Features
- Gamification system
- Bluetooth companion detection
- Advanced analytics

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/consent/` - Update consent settings

### Trips
- `GET /api/trips/` - List user trips
- `POST /api/trips/` - Create new trip
- `PUT /api/trips/{id}/` - Update trip
- `DELETE /api/trips/{id}/` - Delete trip

### Analytics
- `GET /api/analytics/dashboard/` - Dashboard data
- `GET /api/analytics/export/` - Export data
- `GET /api/analytics/heatmap/` - Trip heatmap data

### Gamification
- `GET /api/gamification/profile/` - User points and badges
- `GET /api/gamification/leaderboard/` - Global leaderboard

## 🧪 Testing
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment
- Docker support included
- Environment configuration templates
- CI/CD pipeline ready

## 📄 License
MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing
Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for contribution guidelines.

## 📞 Support
For support, email support@travelogy.app or create an issue.