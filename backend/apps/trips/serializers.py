from rest_framework import serializers
from django.utils import timezone
from .models import (
    Trip, TripWaypoint, TripAnnotation, TripDetectionEvent,
    FrequentLocation, TripChain
)
from .ml_services.mode_detector import ModeDetector
from .ml_services.purpose_predictor import PurposePredictor


class TripWaypointSerializer(serializers.ModelSerializer):
    """Serializer for trip waypoints"""
    
    class Meta:
        model = TripWaypoint
        fields = [
            'id', 'latitude', 'longitude', 'altitude', 'accuracy',
            'timestamp', 'speed', 'bearing'
        ]


class TripAnnotationSerializer(serializers.ModelSerializer):
    """Serializer for trip annotations"""
    
    class Meta:
        model = TripAnnotation
        fields = ['id', 'note', 'photo', 'tags', 'created_at']


class TripCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new trips"""
    
    waypoints = TripWaypointSerializer(many=True, required=False)
    
    class Meta:
        model = Trip
        fields = [
            'start_time', 'origin_latitude', 'origin_longitude',
            'origin_address', 'destination_latitude', 'destination_longitude',
            'destination_address', 'transport_mode', 'purpose',
            'distance_km', 'companion_count', 'is_manually_created',
            'weather', 'temperature', 'waypoints'
        ]
    
    def create(self, validated_data):
        waypoints_data = validated_data.pop('waypoints', [])
        
        # Set user from request context
        validated_data['user'] = self.context['request'].user
        
        # Auto-detect mode and purpose if not provided
        if not validated_data.get('transport_mode') or not validated_data.get('purpose'):
            trip_data = self._prepare_trip_data_for_prediction(validated_data, waypoints_data)
            
            if not validated_data.get('transport_mode'):
                mode_detector = ModeDetector()
                predicted_mode, mode_confidence = mode_detector.predict_mode(trip_data)
                validated_data['transport_mode'] = predicted_mode
                validated_data['mode_confidence'] = mode_confidence
            
            if not validated_data.get('purpose'):
                purpose_predictor = PurposePredictor()
                predicted_purpose, purpose_confidence = purpose_predictor.predict_purpose(trip_data)
                validated_data['purpose'] = predicted_purpose
                validated_data['purpose_confidence'] = purpose_confidence
        
        trip = Trip.objects.create(**validated_data)
        
        # Create waypoints
        for waypoint_data in waypoints_data:
            TripWaypoint.objects.create(trip=trip, **waypoint_data)
        
        return trip
    
    def _prepare_trip_data_for_prediction(self, trip_data, waypoints_data):
        """Prepare data for ML prediction"""
        start_time = trip_data.get('start_time', timezone.now())
        
        # Calculate duration if not provided
        duration_minutes = trip_data.get('duration_minutes')
        if not duration_minutes and waypoints_data:
            if len(waypoints_data) > 1:
                start_waypoint = waypoints_data[0]
                end_waypoint = waypoints_data[-1]
                time_diff = end_waypoint['timestamp'] - start_waypoint['timestamp']
                duration_minutes = time_diff.total_seconds() / 60
        
        return {
            'distance_km': trip_data.get('distance_km', 0),
            'duration_minutes': duration_minutes or 10,  # Default 10 minutes
            'time_of_day': start_time.hour,
            'weekday': start_time.weekday(),
            'start_time': start_time,
            'origin_lat': trip_data.get('origin_latitude'),
            'origin_lng': trip_data.get('origin_longitude'),
            'dest_lat': trip_data.get('destination_latitude'),
            'dest_lng': trip_data.get('destination_longitude'),
            'origin_address': trip_data.get('origin_address', ''),
            'dest_address': trip_data.get('destination_address', ''),
            'waypoints': waypoints_data,
            'transport_mode': trip_data.get('transport_mode'),
        }


class TripDetailSerializer(serializers.ModelSerializer):
    """Detailed trip serializer with all related data"""
    
    waypoints = TripWaypointSerializer(many=True, read_only=True)
    annotations = TripAnnotationSerializer(many=True, read_only=True)
    carbon_footprint = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    diaries = serializers.SerializerMethodField()
    
    class Meta:
        model = Trip
        fields = [
            'id', 'start_time', 'end_time', 'duration_minutes',
            'origin_latitude', 'origin_longitude', 'origin_address',
            'destination_latitude', 'destination_longitude', 'destination_address',
            'transport_mode', 'purpose', 'distance_km',
            'mode_confidence', 'purpose_confidence',
            'companion_count', 'companions', 'status',
            'is_manually_created', 'is_validated', 'needs_review',
            'weather', 'temperature', 'is_private', 'share_for_research',
            'carbon_footprint', 'is_active',
            'waypoints', 'annotations', 'diaries',
            'created_at', 'updated_at'
        ]
    
    def get_diaries(self, obj):
        entries = []
        for ann in obj.annotations.all().order_by('-created_at'):
            photos = []
            # include uploaded file url if present
            if ann.photo:
                try:
                    photos.append({'url': ann.photo.url})
                except Exception:
                    pass
            # include any URLs in tags
            if isinstance(ann.tags, list):
                for t in ann.tags:
                    if isinstance(t, dict) and 'url' in t:
                        photos.append({'url': t.get('url'), 'caption': t.get('caption')})
            elif isinstance(ann.tags, dict) and 'url' in ann.tags:
                photos.append({'url': ann.tags.get('url'), 'caption': ann.tags.get('caption')})
            entries.append({
                'id': ann.id,
                'note': ann.note,
                'photos': photos,
                'created_at': ann.created_at,
            })
        return entries


class TripListSerializer(serializers.ModelSerializer):
    """Simplified trip serializer for list views"""
    
    carbon_footprint = serializers.ReadOnlyField()
    
    class Meta:
        model = Trip
        fields = [
            'id', 'start_time', 'end_time', 'duration_minutes',
            'origin_latitude', 'origin_longitude', 'origin_address',
            'destination_latitude', 'destination_longitude', 'destination_address',
            'transport_mode', 'purpose', 'distance_km',
            'companion_count', 'status', 'carbon_footprint'
        ]


class TripUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating trips"""
    
    class Meta:
        model = Trip
        fields = [
            'transport_mode', 'purpose', 'destination_latitude',
            'destination_longitude', 'destination_address',
            'companion_count', 'is_private', 'share_for_research'
        ]
    
    def update(self, instance, validated_data):
        # Mark as validated when user updates
        instance.is_validated = True
        instance.needs_review = False
        
        return super().update(instance, validated_data)


class FrequentLocationSerializer(serializers.ModelSerializer):
    """Serializer for frequent locations"""
    
    class Meta:
        model = FrequentLocation
        fields = [
            'id', 'name', 'location_type', 'latitude', 'longitude',
            'radius_meters', 'address', 'visit_count', 'last_visited'
        ]


class TripChainSerializer(serializers.ModelSerializer):
    """Serializer for trip chains"""
    
    trips = TripListSerializer(many=True, read_only=True)
    
    class Meta:
        model = TripChain
        fields = [
            'id', 'date', 'total_distance', 'total_duration',
            'primary_mode', 'trips', 'created_at'
        ]


class TripStatsSerializer(serializers.Serializer):
    """Serializer for trip statistics"""
    
    total_trips = serializers.IntegerField()
    total_distance = serializers.FloatField()
    total_duration = serializers.IntegerField()
    carbon_saved = serializers.FloatField()
    most_used_mode = serializers.CharField()
    favorite_destination = serializers.CharField()
    
    # Time-based stats
    trips_this_week = serializers.IntegerField()
    trips_this_month = serializers.IntegerField()
    
    # Mode breakdown
    mode_breakdown = serializers.DictField()
    purpose_breakdown = serializers.DictField()
    
    # Environmental impact
    total_carbon_footprint = serializers.FloatField()
    eco_score = serializers.IntegerField()


class TripPredictionSerializer(serializers.Serializer):
    """Serializer for trip prediction requests"""
    
    origin_latitude = serializers.FloatField()
    origin_longitude = serializers.FloatField()
    destination_latitude = serializers.FloatField(required=False)
    destination_longitude = serializers.FloatField(required=False)
    start_time = serializers.DateTimeField(required=False)
    distance_km = serializers.FloatField(required=False)
    duration_minutes = serializers.IntegerField(required=False)


class TripPredictionResponseSerializer(serializers.Serializer):
    """Serializer for trip prediction responses"""
    
    predicted_mode = serializers.CharField()
    mode_confidence = serializers.FloatField()
    predicted_purpose = serializers.CharField()
    purpose_confidence = serializers.FloatField()
    suggested_companions = serializers.IntegerField()
    estimated_duration = serializers.IntegerField()
    carbon_footprint_estimate = serializers.FloatField()


class ActiveTripSerializer(serializers.ModelSerializer):
    """Serializer for active trip tracking"""
    
    class Meta:
        model = Trip
        fields = [
            'id', 'start_time', 'origin_latitude', 'origin_longitude',
            'transport_mode', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class TripCompletionSerializer(serializers.Serializer):
    """Serializer for completing active trips"""
    
    end_time = serializers.DateTimeField(required=False)
    destination_latitude = serializers.FloatField()
    destination_longitude = serializers.FloatField()
    destination_address = serializers.CharField(required=False)
    final_mode = serializers.CharField(required=False)
    final_purpose = serializers.CharField(required=False)
    companion_count = serializers.IntegerField(required=False, default=0)
    
    def validate(self, attrs):
        if attrs.get('end_time') and attrs['end_time'] < timezone.now() - timezone.timedelta(hours=24):
            raise serializers.ValidationError("End time cannot be more than 24 hours in the past.")
        return attrs