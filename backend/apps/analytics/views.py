from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from apps.trips.models import Trip
from django.db.models import Count, Sum
import os
import requests

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_analytics(request):
    """Get dashboard analytics for admin users"""
    
    # User statistics
    total_users = User.objects.count()
    active_users = User.objects.filter(trips__isnull=False).distinct().count()
    
    # Trip statistics
    total_trips = Trip.objects.count()
    completed_trips = Trip.objects.filter(status='completed').count()
    total_distance = Trip.objects.aggregate(Sum('distance_km'))['distance_km__sum'] or 0
    
    # Mode breakdown
    mode_stats = Trip.objects.values('transport_mode').annotate(
        count=Count('id')
    ).order_by('-count')
    
    return Response({
        'users': {
            'total': total_users,
            'active': active_users,
        },
        'trips': {
            'total': total_trips,
            'completed': completed_trips,
            'total_distance': total_distance,
        },
        'mode_breakdown': list(mode_stats)
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def gemini_weather_insights(request):
    """
    Generate weather-related insights using Google Gemini via server-side proxy.
    Expects JSON payload containing: { place, weather, aq }
    """
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return Response({'error': 'GEMINI_API_KEY not configured'}, status=500)
    payload = request.data or {}
    place = payload.get('place')
    weather = payload.get('weather')
    aq = payload.get('aq')

    def safe(v):
        return '' if v is None else v

    prompt = (
        "You are a travel weather assistant. Provide concise, practical insights for travelers based on: "
        f"Location: {safe(place)}. "
        f"Weather: {safe(weather)}. "
        f"AirQuality: {safe(aq)}. "
        "Return a short summary (2-3 sentences), 3-5 bullet tips, and if applicable, health cautions."
    )

    try:
        url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
        res = requests.post(url, params={'key': api_key}, json={
            'contents': [
                { 'role': 'user', 'parts': [{ 'text': prompt }] }
            ]
        }, timeout=20)
        data = res.json()
        text = ''
        try:
            text = data['candidates'][0]['content']['parts'][0]['text']
        except Exception:
            text = str(data)[:2000]
        return Response({ 'insights': text })
    except Exception as e:
        return Response({ 'error': 'gemini_request_failed', 'detail': str(e) }, status=502)


@api_view(['POST'])
@permission_classes([AllowAny])
def gemini_trip_insights(request):
    """
    Generate trip-related insights (summary, suggestions) using Gemini.
    Expects JSON payload containing: { distance_km, duration_min, mode, notes, path } (flexible)
    """
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return Response({'error': 'GEMINI_API_KEY not configured'}, status=500)
    payload = request.data or {}
    distance = payload.get('distance_km')
    duration = payload.get('duration_min')
    mode = payload.get('mode')
    notes = payload.get('notes')

    prompt = (
        "You are a helpful trip coach. Given trip metrics and optional user notes, "
        "provide: a one-paragraph summary, 3 improvement tips, and 3 place/activity suggestions. "
        f"Distance km: {distance}; Duration min: {duration}; Mode: {mode}; User notes: {notes}"
    )

    try:
        url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
        res = requests.post(url, params={'key': api_key}, json={
            'contents': [
                { 'role': 'user', 'parts': [{ 'text': prompt }] }
            ]
        }, timeout=20)
        data = res.json()
        text = ''
        try:
            text = data['candidates'][0]['content']['parts'][0]['text']
        except Exception:
            text = str(data)[:2000]
        return Response({ 'insights': text })
    except Exception as e:
        return Response({ 'error': 'gemini_request_failed', 'detail': str(e) }, status=502)
