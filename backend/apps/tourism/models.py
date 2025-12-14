from __future__ import annotations

from django.db import models


class District(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self) -> str:
        return self.name


class Attraction(models.Model):
    ATTRACTION_TYPES = [
        ('monument', 'Monument'),
        ('museum', 'Museum'),
        ('park', 'Park'),
        ('market', 'Market'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=200)
    attraction_type = models.CharField(max_length=30, choices=ATTRACTION_TYPES, default='other')
    district = models.ForeignKey(District, on_delete=models.PROTECT, related_name='attractions')

    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)

    # Operational capacity metadata
    capacity_per_5min = models.PositiveIntegerField(null=True, blank=True)
    crowd_threshold_warn = models.PositiveIntegerField(null=True, blank=True)
    crowd_threshold_critical = models.PositiveIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['district', 'attraction_type']),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.district})"


class FootfallSource(models.Model):
    SOURCE_TYPES = [
        ('iot', 'IoT Counter'),
        ('cv', 'Computer Vision'),
        ('ticket', 'Ticketing Integration'),
        ('manual', 'Manual Reporting'),
    ]

    name = models.CharField(max_length=200)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    attraction = models.ForeignKey(Attraction, on_delete=models.CASCADE, related_name='sources')

    # Optional device / vendor metadata (JSON-ish for hackathon flexibility)
    meta = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.source_type})"


class FootfallVisit(models.Model):
    """Privacy-preserving visitor-level events.

    The system never stores raw identity. Producers should send a hashed token
    (e.g., SHA-256 of device ID + salt) to allow dedupe within time windows.

    We keep this model lightweight and hackathon-friendly; production can move
    to rollups/materialized views and TTL cleanup.

    Idempotency/dedupe:
    - We enforce uniqueness for (source, ts, visitor_hash, direction) so replays
      from devices/ticketing don’t create duplicates.
    """

    VISITOR_TYPES = [
        ('domestic', 'Domestic'),
        ('international', 'International'),
        ('unknown', 'Unknown'),
    ]

    source = models.ForeignKey(FootfallSource, on_delete=models.CASCADE, related_name='visits')
    ts = models.DateTimeField(db_index=True)

    # hashed token (not reversible)
    visitor_hash = models.CharField(max_length=128, db_index=True)

    # optional direction for in/out style sensors
    direction = models.CharField(max_length=10, default='in')

    visitor_type = models.CharField(max_length=20, choices=VISITOR_TYPES, default='unknown')

    confidence = models.FloatField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['source', 'ts']),
            models.Index(fields=['source', 'visitor_hash']),
        ]
        constraints = [
            models.UniqueConstraint(fields=['source', 'ts', 'visitor_hash', 'direction'], name='uniq_footfall_visit'),
        ]


class EntryPoint(models.Model):
    ENTRY_TYPES = [
        ('airport', 'Airport'),
        ('rail', 'Rail'),
        ('road', 'Road'),
        ('bus', 'Bus'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=200)
    entry_type = models.CharField(max_length=20, choices=ENTRY_TYPES, default='other')
    district = models.ForeignKey(District, on_delete=models.PROTECT, related_name='entry_points')

    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class EntryVisit(models.Model):
    VISITOR_TYPES = FootfallVisit.VISITOR_TYPES

    entry_point = models.ForeignKey(EntryPoint, on_delete=models.CASCADE, related_name='visits')
    ts = models.DateTimeField(db_index=True)
    visitor_hash = models.CharField(max_length=128, db_index=True)
    visitor_type = models.CharField(max_length=20, choices=VISITOR_TYPES, default='unknown')

    class Meta:
        indexes = [
            models.Index(fields=['entry_point', 'ts']),
            models.Index(fields=['entry_point', 'visitor_hash']),
        ]
        constraints = [
            models.UniqueConstraint(fields=['entry_point', 'ts', 'visitor_hash'], name='uniq_entry_visit'),
        ]


class Hotel(models.Model):
    name = models.CharField(max_length=200)
    district = models.ForeignKey(District, on_delete=models.PROTECT, related_name='hotels')

    rating = models.FloatField(null=True, blank=True)
    rooms_total = models.PositiveIntegerField(null=True, blank=True)
    beds_total = models.PositiveIntegerField(null=True, blank=True)

    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)

    category = models.CharField(max_length=100, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['district']),
        ]

    def __str__(self) -> str:
        return self.name


class HotelAvailabilitySnapshot(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='snapshots')
    ts = models.DateTimeField(db_index=True)

    rooms_available = models.PositiveIntegerField(null=True, blank=True)
    rooms_total = models.PositiveIntegerField(null=True, blank=True)

    source = models.CharField(max_length=50, default='csv')

    class Meta:
        indexes = [
            models.Index(fields=['hotel', 'ts']),
        ]
