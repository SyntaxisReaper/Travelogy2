from __future__ import annotations

from rest_framework import serializers

from .models import Attraction, District, EntryPoint, FootfallSource, Hotel, HotelAvailabilitySnapshot


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ['id', 'name']


class AttractionSerializer(serializers.ModelSerializer):
    district = DistrictSerializer(read_only=True)
    district_id = serializers.PrimaryKeyRelatedField(source='district', queryset=District.objects.all(), write_only=True)

    class Meta:
        model = Attraction
        fields = [
            'id',
            'name',
            'attraction_type',
            'district',
            'district_id',
            'lat',
            'lon',
            'capacity_per_5min',
            'crowd_threshold_warn',
            'crowd_threshold_critical',
            'created_at',
        ]


class FootfallSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FootfallSource
        fields = ['id', 'name', 'source_type', 'attraction', 'meta', 'created_at']


class EntryPointSerializer(serializers.ModelSerializer):
    district = DistrictSerializer(read_only=True)
    district_id = serializers.PrimaryKeyRelatedField(source='district', queryset=District.objects.all(), write_only=True)

    class Meta:
        model = EntryPoint
        fields = ['id', 'name', 'entry_type', 'district', 'district_id', 'lat', 'lon', 'created_at']


class HotelSerializer(serializers.ModelSerializer):
    district = DistrictSerializer(read_only=True)
    district_id = serializers.PrimaryKeyRelatedField(source='district', queryset=District.objects.all(), write_only=True)

    class Meta:
        model = Hotel
        fields = ['id', 'name', 'district', 'district_id', 'rating', 'rooms_total', 'beds_total', 'lat', 'lon', 'category', 'created_at']


class HotelAvailabilitySnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelAvailabilitySnapshot
        fields = ['id', 'hotel', 'ts', 'rooms_available', 'rooms_total', 'source']


class IngestFootfallSerializer(serializers.Serializer):
    source_id = serializers.IntegerField()
    ts = serializers.DateTimeField()
    visitor_type = serializers.ChoiceField(choices=['domestic', 'international', 'unknown'], default='unknown')
    direction = serializers.ChoiceField(choices=['in', 'out'], default='in')
    confidence = serializers.FloatField(required=False)
    visitor_hashes = serializers.ListField(child=serializers.CharField(max_length=128), allow_empty=False)


class IngestEntrySerializer(serializers.Serializer):
    entry_point_id = serializers.IntegerField()
    ts = serializers.DateTimeField()
    visitor_type = serializers.ChoiceField(choices=['domestic', 'international', 'unknown'], default='unknown')
    visitor_hashes = serializers.ListField(child=serializers.CharField(max_length=128), allow_empty=False)


class HotelRegistryCsvUploadSerializer(serializers.Serializer):
    file = serializers.FileField()


class HotelSnapshotCsvUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
