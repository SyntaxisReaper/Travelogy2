from django.contrib import admin
from .models import DataExport, AggregatedStats


@admin.register(DataExport)
class DataExportAdmin(admin.ModelAdmin):
    list_display = ['requested_by', 'export_type', 'file_format', 'status', 'created_at']
    list_filter = ['export_type', 'file_format', 'status', 'created_at']
    readonly_fields = ['created_at', 'completed_at']


@admin.register(AggregatedStats)
class AggregatedStatsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_users', 'active_users', 'total_trips', 'total_distance']
    list_filter = ['date']
    readonly_fields = ['created_at', 'updated_at']