from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, UserSettings, ConsentLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom user admin"""
    
    list_display = [
        'email', 'username', 'first_name', 'last_name',
        'is_active', 'location_tracking_consent', 'data_sharing_consent',
        'created_at', 'last_activity'
    ]
    list_filter = [
        'is_active', 'is_staff', 'is_superuser',
        'location_tracking_consent', 'data_sharing_consent',
        'analytics_consent', 'marketing_consent',
        'created_at'
    ]
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {
            'fields': (
                'first_name', 'last_name', 'email', 'phone_number',
                'date_of_birth', 'city', 'country'
            )
        }),
        ('Permissions', {
            'fields': (
                'is_active', 'is_staff', 'is_superuser',
                'groups', 'user_permissions'
            ),
        }),
        ('Privacy Settings', {
            'fields': (
                'data_sharing_consent', 'location_tracking_consent',
                'analytics_consent', 'marketing_consent'
            )
        }),
        ('App Settings', {
            'fields': (
                'is_active_tracker', 'preferred_language', 'timezone'
            )
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined', 'created_at', 'last_activity')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'password1', 'password2',
                'location_tracking_consent'
            ),
        }),
    )
    
    readonly_fields = ['created_at', 'last_activity']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """User profile admin"""
    
    list_display = [
        'user', 'occupation', 'public_profile', 'show_on_leaderboard',
        'created_at'
    ]
    list_filter = [
        'occupation', 'public_profile', 'show_on_leaderboard',
        'created_at'
    ]
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    """User settings admin"""
    
    list_display = [
        'user', 'auto_trip_detection', 'offline_mode_preferred',
        'sync_frequency', 'created_at'
    ]
    list_filter = [
        'auto_trip_detection', 'confirm_trips', 'offline_mode_preferred',
        'trip_reminders', 'weekly_summary', 'achievement_notifications'
    ]
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ConsentLog)
class ConsentLogAdmin(admin.ModelAdmin):
    """Consent log admin"""
    
    list_display = [
        'user', 'consent_type', 'granted', 'ip_address', 'timestamp'
    ]
    list_filter = ['consent_type', 'granted', 'timestamp']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['timestamp']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False