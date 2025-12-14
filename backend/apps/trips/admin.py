from django.contrib import admin
from .models import Trip, TripWaypoint, TripAnnotation, FrequentLocation, TripChain


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'start_time', 'transport_mode', 'purpose',
        'distance_km', 'duration_minutes', 'status'
    ]
    list_filter = ['transport_mode', 'purpose', 'status', 'created_at']
    search_fields = ['user__email', 'origin_address', 'destination_address']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TripWaypoint)
class TripWaypointAdmin(admin.ModelAdmin):
    list_display = ['trip', 'latitude', 'longitude', 'timestamp']
    list_filter = ['timestamp']


@admin.register(FrequentLocation)
class FrequentLocationAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'location_type', 'visit_count']
    list_filter = ['location_type']
    search_fields = ['user__email', 'name']