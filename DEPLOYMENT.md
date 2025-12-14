# 🚀 TraveLogy Deployment Guide

## Quick Start

### Backend Setup (Django)

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Environment setup
copy .env.example .env  # Configure your settings

# Database setup
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# Create sample data (optional)
python manage.py loaddata fixtures/sample_data.json

# Run development server
python manage.py runserver
```

### Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## Environment Configuration

### Backend (.env file)

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=travelogy
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432

# Optional: Email settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password

# Celery (for background tasks)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

## Database Setup

### PostgreSQL with PostGIS (Recommended)

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE travelogy;
CREATE USER travelogy_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE travelogy TO travelogy_user;

-- Enable PostGIS extension (for geographic data)
\c travelogy
CREATE EXTENSION postgis;
```

### SQLite (Development Only)

For development, you can use SQLite by setting `DEBUG=True` and not providing database credentials in `.env`.

## Production Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d --build

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

### Manual Deployment

#### Backend (Django)

```bash
# Install production dependencies
pip install -r requirements.txt gunicorn

# Collect static files
python manage.py collectstatic --noinput

# Run with gunicorn
gunicorn travelogy_backend.wsgi:application --bind 0.0.0.0:8000
```

#### Frontend (React)

```bash
# Build for production
npm run build

# Serve with nginx or any static file server
# Copy build/ contents to your web server
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `POST /api/auth/consent/` - Update consent settings

### Trip Endpoints

- `GET /api/trips/` - List user trips
- `POST /api/trips/` - Create new trip
- `POST /api/trips/start/` - Start active trip
- `POST /api/trips/{id}/complete/` - Complete active trip
- `GET /api/trips/stats/` - Get user statistics
- `POST /api/trips/predict/` - AI trip prediction

### Analytics Endpoints

- `GET /api/analytics/dashboard/` - Admin dashboard data

### Gamification Endpoints

- `GET /api/gamification/profile/` - User points and badges
- `GET /api/gamification/leaderboard/` - Global leaderboard

## Features Implemented

### ✅ Core Features

- **User Authentication**: Registration, login, JWT tokens
- **Trip Management**: Create, update, delete trips with GPS tracking
- **AI/ML Features**: Mode detection, purpose prediction (mock implementation)
- **Privacy Controls**: Consent management, data anonymization options
- **Gamification**: Points, badges, leaderboards
- **Analytics**: Trip statistics, eco scoring

### ✅ Technical Features

- **Backend**: Django REST Framework with PostgreSQL/PostGIS
- **Frontend**: React with Material-UI and Redux
- **Real-time Updates**: WebSocket support prepared
- **Mobile Ready**: Responsive design
- **Offline Support**: Local storage capabilities
- **Data Export**: CSV/JSON export functionality

### 🚧 Advanced Features (Ready for Implementation)

- **Real ML Models**: Replace mock AI with TensorFlow/scikit-learn models
- **Maps Integration**: Mapbox/Google Maps for visualization
- **Push Notifications**: Trip reminders and achievements
- **Bluetooth Proximity**: Companion detection
- **Advanced Analytics**: Heatmaps, route optimization

## Testing

### Backend Tests

```bash
cd backend
python manage.py test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Performance Optimization

### Database Optimization

- Add database indexes for frequently queried fields
- Use database-level aggregations for statistics
- Implement connection pooling for production

### Frontend Optimization

- Code splitting with React.lazy()
- Service worker for offline functionality
- Image optimization and lazy loading
- Bundle size optimization

## Security Considerations

### Backend Security

- CSRF protection enabled
- SQL injection prevention with ORM
- Rate limiting on API endpoints
- Input validation and sanitization
- HTTPS enforcement in production

### Frontend Security

- XSS protection with React's built-in escaping
- Secure token storage
- Content Security Policy headers
- HTTPS-only cookies

## Monitoring and Logging

### Application Monitoring

- Django logging configured
- Error tracking with Sentry (recommended)
- Performance monitoring with APM tools
- Database query optimization

### Analytics

- User behavior tracking (with consent)
- Performance metrics
- Error rate monitoring
- API usage statistics

## Scalability

### Horizontal Scaling

- Stateless backend design
- Database read replicas
- CDN for static assets
- Load balancer configuration

### Vertical Scaling

- Database optimization
- Caching with Redis
- Background task processing with Celery
- Memory optimization

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check PostgreSQL service status
   - Verify credentials in .env file
   - Ensure PostGIS extension is installed

2. **Frontend Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify environment variables

3. **API Authentication Issues**
   - Check JWT token expiration
   - Verify CORS settings
   - Ensure proper header format

### Debug Mode

Enable detailed logging:

```python
# In Django settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## Support

For technical support or questions:
- Check the [README.md](README.md) for basic setup
- Review API documentation in the code
- Open an issue for bug reports
- Contact the development team for feature requests