from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_analytics, name='dashboard-analytics'),
    path('gemini/weather_insights/', views.gemini_weather_insights, name='gemini-weather-insights'),
    path('gemini/trip_insights/', views.gemini_trip_insights, name='gemini-trip-insights'),
]
