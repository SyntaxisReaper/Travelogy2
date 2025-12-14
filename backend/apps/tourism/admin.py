from django.contrib import admin

from .models import (
    Attraction,
    District,
    EntryPoint,
    EntryVisit,
    FootfallSource,
    FootfallVisit,
    Hotel,
    HotelAvailabilitySnapshot,
)


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    search_fields = ['name']


@admin.register(Attraction)
class AttractionAdmin(admin.ModelAdmin):
    list_display = ['name', 'attraction_type', 'district']
    list_filter = ['attraction_type', 'district']
    search_fields = ['name']


@admin.register(FootfallSource)
class FootfallSourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'source_type', 'attraction']
    list_filter = ['source_type']
    search_fields = ['name']


@admin.register(FootfallVisit)
class FootfallVisitAdmin(admin.ModelAdmin):
    list_display = ['source', 'ts', 'visitor_type', 'direction']
    list_filter = ['visitor_type', 'direction', 'source__source_type']
    search_fields = ['visitor_hash']


@admin.register(EntryPoint)
class EntryPointAdmin(admin.ModelAdmin):
    list_display = ['name', 'entry_type', 'district']
    list_filter = ['entry_type', 'district']
    search_fields = ['name']


@admin.register(EntryVisit)
class EntryVisitAdmin(admin.ModelAdmin):
    list_display = ['entry_point', 'ts', 'visitor_type']
    list_filter = ['visitor_type']
    search_fields = ['visitor_hash']


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ['name', 'district', 'rating', 'rooms_total']
    list_filter = ['district']
    search_fields = ['name']


@admin.register(HotelAvailabilitySnapshot)
class HotelAvailabilitySnapshotAdmin(admin.ModelAdmin):
    list_display = ['hotel', 'ts', 'rooms_available', 'rooms_total', 'source']
    list_filter = ['source', 'hotel__district']
