from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta
import json

from .models import Trip, TripWaypoint, FrequentLocation, TripChain
from .serializers import (
    TripCreateSerializer, TripDetailSerializer, TripListSerializer,
    TripUpdateSerializer, FrequentLocationSerializer, TripChainSerializer,
    TripStatsSerializer, TripPredictionSerializer, TripPredictionResponseSerializer,
    ActiveTripSerializer, TripCompletionSerializer
)
from .ml_services.mode_detector import ModeDetector
from .ml_services.purpose_predictor import PurposePredictor


class TripListCreateView(generics.ListCreateAPIView):
    """List user's trips and create new ones"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TripCreateSerializer
        return TripListSerializer
    
    def get_queryset(self):
        queryset = Trip.objects.filter(user=self.request.user)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(start_time__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(start_time__date__lte=end_date)
        
        # Filter by transport mode
        mode = self.request.query_params.get('mode')
        if mode:
            queryset = queryset.filter(transport_mode=mode)
        
        # Filter by purpose
        purpose = self.request.query_params.get('purpose')
        if purpose:
            queryset = queryset.filter(purpose=purpose)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-start_time')


class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific trip"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TripUpdateSerializer
        return TripDetailSerializer
    
    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user)


@api_view(['GET'])
def active_trip_view(request):
    """Get current active trip"""
    
    active_trip = Trip.objects.filter(
        user=request.user,
        status='active'
    ).first()
    
    if active_trip:
        serializer = ActiveTripSerializer(active_trip)
        return Response(serializer.data)
    
    return Response({'message': 'No active trip'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def start_trip_view(request):
    """Start a new trip tracking session"""
    
    # Check if user already has an active trip
    active_trip = Trip.objects.filter(user=request.user, status='active').first()
    if active_trip:
        return Response({
            'error': 'You already have an active trip',
            'active_trip': ActiveTripSerializer(active_trip).data
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = TripCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        trip = serializer.save(status='active')
        return Response({
            'message': 'Trip started successfully',
            'trip': ActiveTripSerializer(trip).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def complete_trip_view(request, trip_id):
    """Complete an active trip"""
    
    try:
        trip = Trip.objects.get(id=trip_id, user=request.user, status='active')
    except Trip.DoesNotExist:
        return Response({'error': 'Active trip not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = TripCompletionSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        
        # Update trip with completion data
        trip.end_time = data.get('end_time', timezone.now())
        trip.destination_latitude = data['destination_latitude']
        trip.destination_longitude = data['destination_longitude']
        trip.destination_address = data.get('destination_address', '')
        trip.companion_count = data.get('companion_count', 0)
        
        # Update optional distance
        if 'distance_km' in request.data:
            try:
                trip.distance_km = float(request.data.get('distance_km'))
            except Exception:
                pass
        
        # Create waypoints from path if provided
        path = request.data.get('path')
        if path:
            try:
                coords = path if isinstance(path, list) else json.loads(path)
                for pt in coords:
                    lat = pt.get('lat') or pt.get('latitude')
                    lon = pt.get('lon') or pt.get('lng') or pt.get('longitude')
                    if lat is not None and lon is not None:
                        TripWaypoint.objects.create(
                            trip=trip,
                            latitude=lat,
                            longitude=lon,
                            timestamp=timezone.now()
                        )
            except Exception:
                pass
        
        # Update mode/purpose if provided
        if data.get('final_mode'):
            trip.transport_mode = data['final_mode']
        if data.get('final_purpose'):
            trip.purpose = data['final_purpose']
        
        trip.calculate_duration()
        trip.status = 'completed'
        trip.save()
        
        return Response({
            'message': 'Trip completed successfully',
            'trip': TripDetailSerializer(trip).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def predict_trip_view(request):
    """Predict trip mode and purpose based on input data"""
    
    serializer = TripPredictionSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        
        # Prepare trip data for prediction
        trip_data = {
            'distance_km': data.get('distance_km', 0),
            'duration_minutes': data.get('duration_minutes', 10),
            'time_of_day': data.get('start_time', timezone.now()).hour,
            'weekday': data.get('start_time', timezone.now()).weekday(),
        }
        
        # Mode prediction
        mode_detector = ModeDetector()
        predicted_mode, mode_confidence = mode_detector.predict_mode(trip_data)
        
        # Purpose prediction
        purpose_predictor = PurposePredictor()
        purpose_data = {
            'start_time': data.get('start_time', timezone.now()),
            'origin_lat': data['origin_latitude'],
            'origin_lng': data['origin_longitude'],
            'dest_lat': data.get('destination_latitude'),
            'dest_lng': data.get('destination_longitude'),
            'transport_mode': predicted_mode,
        }
        
        # Get user history for better prediction
        user_history = list(Trip.objects.filter(user=request.user).values(
            'start_time', 'purpose', 'destination_latitude', 'destination_longitude'
        )[:50])  # Last 50 trips
        
        predicted_purpose, purpose_confidence = purpose_predictor.predict_purpose(
            purpose_data, user_history
        )
        
        # Calculate carbon footprint estimate
        distance = data.get('distance_km', 1)
        emission_factors = {
            'walk': 0, 'cycle': 0, 'bike': 0.06, 'car': 0.21,
            'bus': 0.05, 'metro': 0.03, 'taxi': 0.25
        }
        carbon_estimate = distance * emission_factors.get(predicted_mode, 0.15)
        
        response_data = {
            'predicted_mode': predicted_mode,
            'mode_confidence': mode_confidence,
            'predicted_purpose': predicted_purpose,
            'purpose_confidence': purpose_confidence,
            'suggested_companions': 0,  # Could be enhanced with ML
            'estimated_duration': data.get('duration_minutes', 10),
            'carbon_footprint_estimate': round(carbon_estimate, 2)
        }
        
        response_serializer = TripPredictionResponseSerializer(response_data)
        return Response(response_serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def trip_stats_view(request):
    """Get comprehensive trip statistics for the user"""
    
    trips = Trip.objects.filter(user=request.user, status='completed')
    
    # Basic stats
    total_trips = trips.count()
    total_distance = trips.aggregate(Sum('distance_km'))['distance_km__sum'] or 0
    total_duration = trips.aggregate(Sum('duration_minutes'))['duration_minutes__sum'] or 0
    
    # Mode breakdown
    mode_breakdown = dict(trips.values('transport_mode').annotate(
        count=Count('id')).values_list('transport_mode', 'count'))
    
    # Purpose breakdown
    purpose_breakdown = dict(trips.values('purpose').annotate(
        count=Count('id')).values_list('purpose', 'count'))
    
    # Most used mode
    most_used_mode = trips.values('transport_mode').annotate(
        count=Count('id')).order_by('-count').first()
    most_used_mode = most_used_mode['transport_mode'] if most_used_mode else 'N/A'
    
    # Time-based stats
    now = timezone.now()
    trips_this_week = trips.filter(start_time__gte=now - timedelta(days=7)).count()
    trips_this_month = trips.filter(start_time__gte=now - timedelta(days=30)).count()
    
    # Carbon footprint calculation
    total_carbon = 0
    carbon_saved = 0
    
    for trip in trips:
        total_carbon += trip.carbon_footprint
        # Calculate savings vs driving
        if trip.transport_mode in ['walk', 'cycle']:
            carbon_saved += trip.distance_km * 0.21  # Car emissions
        elif trip.transport_mode in ['bus', 'metro']:
            carbon_saved += trip.distance_km * (0.21 - 0.05)  # Car vs public transport
    
    # Eco score (0-100)
    eco_score = 100
    if total_distance > 0:
        avg_carbon_per_km = total_carbon / total_distance
        # Score based on carbon efficiency
        eco_score = max(0, min(100, int(100 - (avg_carbon_per_km * 500))))
    
    # Favorite destination (most visited)
    favorite_destination = 'N/A'
    if trips.exists():
        dest_counts = {}
        for trip in trips.exclude(destination_address=''):
            addr = trip.destination_address[:50]  # Truncate long addresses
            dest_counts[addr] = dest_counts.get(addr, 0) + 1
        
        if dest_counts:
            favorite_destination = max(dest_counts.items(), key=lambda x: x[1])[0]
    
    stats_data = {
        'total_trips': total_trips,
        'total_distance': round(total_distance, 2),
        'total_duration': total_duration,
        'carbon_saved': round(carbon_saved, 2),
        'most_used_mode': most_used_mode,
        'favorite_destination': favorite_destination,
        'trips_this_week': trips_this_week,
        'trips_this_month': trips_this_month,
        'mode_breakdown': mode_breakdown,
        'purpose_breakdown': purpose_breakdown,
        'total_carbon_footprint': round(total_carbon, 2),
        'eco_score': eco_score
    }
    
    serializer = TripStatsSerializer(stats_data)
    return Response(serializer.data)


class FrequentLocationListView(generics.ListCreateAPIView):
    """List and create frequent locations"""
    
    serializer_class = FrequentLocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return FrequentLocation.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
def trip_timeline_view(request):
    """Get trip timeline data for visualization"""
    
    # Get date range
    days = int(request.query_params.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)
    
    trips = Trip.objects.filter(
        user=request.user,
        start_time__gte=start_date,
        status='completed'
    ).order_by('start_time')
    
    # Flatten to entries list
    entries = []
    for trip in trips:
        entries.append({
            'id': str(trip.id),
            'start_time': trip.start_time.isoformat(),
            'end_time': trip.end_time.isoformat() if trip.end_time else None,
            'mode': trip.transport_mode,
            'purpose': trip.purpose,
            'distance': trip.distance_km,
            'duration': trip.duration_minutes,
            'carbon_footprint': trip.carbon_footprint,
            'origin': {
                'lat': trip.origin_latitude,
                'lng': trip.origin_longitude,
                'address': trip.origin_address
            },
            'destination': {
                'lat': trip.destination_latitude,
                'lng': trip.destination_longitude,
                'address': trip.destination_address
            }
        })
    
    return Response(entries)


@api_view(['GET'])
def trip_heatmap_view(request):
    """Get trip data for heatmap visualization"""
    
    trips = Trip.objects.filter(user=request.user, status='completed')
    
    # Get all coordinates
    coordinates = []
    for trip in trips:
        if trip.origin_latitude and trip.origin_longitude:
            coordinates.append({
                'lat': trip.origin_latitude,
                'lng': trip.origin_longitude,
                'weight': 1
            })
        if trip.destination_latitude and trip.destination_longitude:
            coordinates.append({
                'lat': trip.destination_latitude,
                'lng': trip.destination_longitude,
                'weight': 1
            })
    
    return Response(coordinates)


@api_view(['POST'])
def add_waypoint_view(request, trip_id):
    """Add a waypoint to an active trip"""
    
    try:
        trip = Trip.objects.get(id=trip_id, user=request.user, status='active')
    except Trip.DoesNotExist:
        return Response({'error': 'Active trip not found'}, status=status.HTTP_404_NOT_FOUND)
    
    waypoint_data = request.data
    waypoint_data['trip'] = trip.id
    
    waypoint = TripWaypoint.objects.create(
        trip=trip,
        latitude=waypoint_data['latitude'],
        longitude=waypoint_data['longitude'],
        timestamp=waypoint_data.get('timestamp', timezone.now()),
        accuracy=waypoint_data.get('accuracy'),
        speed=waypoint_data.get('speed'),
        bearing=waypoint_data.get('bearing')
    )
    
    return Response({
        'message': 'Waypoint added successfully',
        'waypoint_id': waypoint.id
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def add_diary_multipart_view(request, trip_id):
    """Create diary entries with uploaded photos and caption list (JSON)."""
    try:
        trip = Trip.objects.get(id=trip_id, user=request.user)
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)
    note = request.data.get('note', '')
    captions_json = request.data.get('captions')
    try:
        captions = json.loads(captions_json) if captions_json else []
    except Exception:
        captions = []
    photos = request.FILES.getlist('photos')
    # Create a base annotation with note (no photo)
    base = None
    if note:
        base = trip.annotations.create(note=note, tags=[])
    # Save photos as separate annotations with caption in tags
    for idx, f in enumerate(photos):
        trip.annotations.create(note=note, photo=f, tags=[{'caption': captions[idx] if idx < len(captions) else ''}])
    return Response({'message': 'Diary saved'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def add_diary_urls_view(request, trip_id):
    """Create diary entries from URLs and captions."""
    try:
        trip = Trip.objects.get(id=trip_id, user=request.user)
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)
    data = request.data
    note = data.get('note', '')
    photos = data.get('photos', [])  # [{url, caption?}] or [url]
    if note:
        trip.annotations.create(note=note, tags=[])
    for p in photos:
        if isinstance(p, str):
            trip.annotations.create(note=note, tags={'url': p})
        elif isinstance(p, dict) and p.get('url'):
            trip.annotations.create(note=note, tags={'url': p.get('url'), 'caption': p.get('caption')})
    return Response({'message': 'Diary saved'}, status=status.HTTP_201_CREATED)
