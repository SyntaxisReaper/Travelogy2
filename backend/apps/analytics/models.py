from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class DataExport(models.Model):
    """Track data exports for compliance"""
    
    EXPORT_FORMATS = [
        ('csv', 'CSV'),
        ('json', 'JSON'),
        ('xlsx', 'Excel'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE)
    export_type = models.CharField(max_length=50)  # trips, users, analytics
    file_format = models.CharField(max_length=10, choices=EXPORT_FORMATS)
    filters = models.JSONField(default=dict)
    file_path = models.CharField(max_length=255, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')
    
    class Meta:
        db_table = 'data_exports'
        ordering = ['-created_at']


class AggregatedStats(models.Model):
    """Pre-calculated aggregate statistics"""
    
    date = models.DateField()
    total_users = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    total_trips = models.IntegerField(default=0)
    total_distance = models.FloatField(default=0)
    mode_breakdown = models.JSONField(default=dict)
    purpose_breakdown = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'aggregated_stats'
        unique_together = ['date']