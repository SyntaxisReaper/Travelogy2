from django.db import models
# GIS imports disabled for SQLite demo
# from django.contrib.gis.db import models as gis_models
# from django.contrib.gis.geos import Point
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Trip(models.Model):
    """Main trip model with comprehensive tracking"""
    
    TRANSPORT_MODES = [
        ('walk', 'Walking'),
        ('cycle', 'Cycling'),
        ('bike', 'Motorcycle'),
        ('car', 'Car'),
        ('bus', 'Bus'),
        ('metro', 'Metro/Subway'),
        ('train', 'Train'),
        ('taxi', 'Taxi/Rideshare'),
        ('plane', 'Airplane'),
        ('boat', 'Boat/Ferry'),
        ('other', 'Other'),
    ]
    
    TRIP_PURPOSES = [
        ('work', 'Work'),
        ('school', 'School/Education'),
        ('shopping', 'Shopping'),
        ('leisure', 'Leisure/Recreation'),
        ('social', 'Social/Visit'),
        ('medical', 'Medical'),
        ('exercise', 'Exercise/Sports'),
        ('business', 'Business'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('pending_review', 'Pending Review'),
    ]
    
    # Basic identification
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='trips')
    
    # Trip timing
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True)
    
    # Location data
    origin_latitude = models.FloatField()
    origin_longitude = models.FloatField()
    origin_address = models.CharField(max_length=255, blank=True)
    
    destination_latitude = models.FloatField(null=True, blank=True)
    destination_longitude = models.FloatField(null=True, blank=True)
    destination_address = models.CharField(max_length=255, blank=True)
    
    # Trip details
    transport_mode = models.CharField(max_length=20, choices=TRANSPORT_MODES)
    purpose = models.CharField(max_length=20, choices=TRIP_PURPOSES, blank=True)
    distance_km = models.FloatField(null=True, blank=True, validators=[MinValueValidator(0)])
    
    # AI/ML predictions
    mode_confidence = models.FloatField(
        default=0.0, 
        validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    purpose_confidence = models.FloatField(
        default=0.0, 
        validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    
    # Companion tracking
    companion_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    companions = models.JSONField(default=list, blank=True)  # List of companion user IDs
    
    # Data quality and validation
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_manually_created = models.BooleanField(default=False)
    is_validated = models.BooleanField(default=False)
    needs_review = models.BooleanField(default=False)
    
    # Environmental data
    weather = models.CharField(max_length=50, blank=True)
    temperature = models.FloatField(null=True, blank=True)
    
    # Privacy and sharing
    is_private = models.BooleanField(default=False)
    share_for_research = models.BooleanField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    synced_at = models.DateTimeField(null=True, blank=True)
    
    # Device and sensor data
    device_id = models.CharField(max_length=100, blank=True)
    battery_level = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    class Meta:
        db_table = 'trips'
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['user', '-start_time']),
            models.Index(fields=['transport_mode']),
            models.Index(fields=['purpose']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.transport_mode} trip on {self.start_time.date()}"
    
    # GIS properties disabled for SQLite demo
    # @property
    # def origin_point(self):
    #     return Point(self.origin_longitude, self.origin_latitude)
    # 
    # @property
    # def destination_point(self):
    #     if self.destination_latitude and self.destination_longitude:
    #         return Point(self.destination_longitude, self.destination_latitude)
    #     return None
    
    def calculate_duration(self):
        """Calculate trip duration if both start and end times are available"""
        if self.start_time and self.end_time:
            delta = self.end_time - self.start_time
            self.duration_minutes = int(delta.total_seconds() / 60)
    
    def mark_completed(self):
        """Mark trip as completed"""
        if not self.end_time:
            self.end_time = timezone.now()
        self.calculate_duration()
        self.status = 'completed'
        self.save()
    
    @property
    def is_active(self):
        return self.status == 'active'
    
    @property
    def carbon_footprint(self):
        """Estimate carbon footprint based on mode and distance"""
        if not self.distance_km:
            return 0
        
        # CO2 emissions per km (kg)
        emission_factors = {
            'walk': 0,
            'cycle': 0,
            'bike': 0.06,
            'car': 0.21,
            'bus': 0.05,
            'metro': 0.03,
            'train': 0.04,
            'taxi': 0.25,
            'plane': 0.25,
            'boat': 0.15,
            'other': 0.15,
        }
        
        factor = emission_factors.get(self.transport_mode, 0.15)
        return round(self.distance_km * factor, 2)


class TripWaypoint(models.Model):
    """GPS waypoints for trip tracking"""
    
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='waypoints')
    latitude = models.FloatField()
    longitude = models.FloatField()
    altitude = models.FloatField(null=True, blank=True)
    accuracy = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField()
    speed = models.FloatField(null=True, blank=True)
    bearing = models.FloatField(null=True, blank=True)
    
    class Meta:
        db_table = 'trip_waypoints'
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['trip', 'timestamp']),
        ]
    
    def __str__(self):
        return f"Waypoint for {self.trip.id} at {self.timestamp}"
    
    # @property
    # def point(self):
    #     return Point(self.longitude, self.latitude)


class TripAnnotation(models.Model):
    """User annotations and notes for trips"""
    
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='annotations')
    note = models.TextField()
    photo = models.ImageField(upload_to='trip_photos/', null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'trip_annotations'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Note for {self.trip.id}: {self.note[:50]}..."


class TripDetectionEvent(models.Model):
    """Track trip detection events and accuracy"""
    
    EVENT_TYPES = [
        ('trip_start', 'Trip Start Detected'),
        ('trip_end', 'Trip End Detected'),
        ('mode_change', 'Transport Mode Change'),
        ('location_update', 'Location Update'),
    ]
    
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='detection_events')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    confidence = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])
    raw_data = models.JSONField(default=dict, blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'trip_detection_events'
        ordering = ['-timestamp']


class FrequentLocation(models.Model):
    """User's frequently visited locations"""
    
    LOCATION_TYPES = [
        ('home', 'Home'),
        ('work', 'Work'),
        ('school', 'School'),
        ('gym', 'Gym'),
        ('shopping', 'Shopping'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='frequent_locations')
    name = models.CharField(max_length=100)
    location_type = models.CharField(max_length=20, choices=LOCATION_TYPES)
    
    latitude = models.FloatField()
    longitude = models.FloatField()
    radius_meters = models.IntegerField(default=100)
    
    address = models.CharField(max_length=255, blank=True)
    visit_count = models.IntegerField(default=1)
    last_visited = models.DateTimeField(auto_now_add=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'frequent_locations'
        unique_together = ['user', 'name']
    
    def __str__(self):
        return f"{self.user.email} - {self.name} ({self.location_type})"
    
    # @property
    # def point(self):
    #     return Point(self.longitude, self.latitude)


class TripChain(models.Model):
    """Group related trips into chains (e.g., home -> work -> lunch -> work -> home)"""
    
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='trip_chains')
    date = models.DateField()
    trips = models.ManyToManyField(Trip, related_name='chains')
    
    total_distance = models.FloatField(default=0)
    total_duration = models.IntegerField(default=0)  # minutes
    primary_mode = models.CharField(max_length=20, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'trip_chains'
        unique_together = ['user', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.email} trip chain for {self.date}"
    
    def calculate_totals(self):
        """Calculate total distance and duration for the chain"""
        trips = self.trips.all()
        self.total_distance = sum(trip.distance_km or 0 for trip in trips)
        self.total_duration = sum(trip.duration_minutes or 0 for trip in trips)
        
        # Find most used mode
        if trips:
            mode_counts = {}
            for trip in trips:
                mode_counts[trip.transport_mode] = mode_counts.get(trip.transport_mode, 0) + 1
            self.primary_mode = max(mode_counts.items(), key=lambda x: x[1])[0]
        
        self.save()