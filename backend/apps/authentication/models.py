from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from datetime import date
import logging

logger = logging.getLogger('apps.authentication')


class User(AbstractUser):
    """Enhanced User model with Firebase integration and age-based themes"""
    
    # Basic user information
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    photo_url = models.URLField(blank=True, null=True)
    
    # Firebase integration
    firebase_uid = models.CharField(max_length=128, blank=True, null=True, unique=True, db_index=True)
    firebase_provider = models.CharField(max_length=50, blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    
    # Privacy settings
    data_sharing_consent = models.BooleanField(default=False)
    location_tracking_consent = models.BooleanField(default=False)
    analytics_consent = models.BooleanField(default=False)
    marketing_consent = models.BooleanField(default=False)
    
    # Age group for theme preferences
    AGE_GROUP_CHOICES = [
        ('children', _('Children (0-12)')),
        ('teenagers', _('Teenagers (13-17)')),
        ('young_adults', _('Young Adults (18-24)')),
        ('adults', _('Adults (25-45)')),
        ('older_adults', _('Older Adults (46-64)')),
        ('seniors', _('Seniors (65+)')),
    ]
    age_group = models.CharField(max_length=20, choices=AGE_GROUP_CHOICES, blank=True, null=True)
    
    # Theme preferences
    THEME_CHOICES = [
        ('default', _('Default')),
        ('kids', _('Kids Mode')),
        ('teen', _('Teen Mode')),
        ('professional', _('Professional')),
        ('classic', _('Classic')),
        ('high_contrast', _('High Contrast')),
        ('large_text', _('Large Text')),
    ]
    preferred_theme = models.CharField(max_length=20, choices=THEME_CHOICES, default='default')
    theme_color_scheme = models.CharField(max_length=20, blank=True, null=True)
    accessibility_mode = models.BooleanField(default=False)
    large_text = models.BooleanField(default=False)
    reduced_motion = models.BooleanField(default=False)
    
    # Profile settings
    is_active_tracker = models.BooleanField(default=True)
    preferred_language = models.CharField(max_length=10, default='en')
    timezone = models.CharField(max_length=50, default='UTC')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'auth_user'
        indexes = [
            models.Index(fields=['firebase_uid']),
            models.Index(fields=['email']),
            models.Index(fields=['age_group']),
            models.Index(fields=['last_activity']),
        ]
        
    def __str__(self):
        return self.email
        
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    @property
    def display_name(self):
        """Get the best display name for the user"""
        return self.full_name or self.email.split('@')[0]
        
    @property
    def has_given_basic_consent(self):
        return self.location_tracking_consent
    
    @property
    def calculated_age(self):
        """Calculate user's age based on date_of_birth"""
        if not self.date_of_birth:
            return None
        today = date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
    
    def get_age_group(self):
        """Get age group based on calculated age or manually set age_group"""
        if self.age_group:
            return self.age_group
        
        age = self.calculated_age
        if age is None:
            return 'adults'  # Default
        
        if age <= 12:
            return 'children'
        elif age <= 17:
            return 'teenagers'
        elif age <= 24:
            return 'young_adults'
        elif age <= 45:
            return 'adults'
        elif age <= 64:
            return 'older_adults'
        else:
            return 'seniors'
    
    def get_recommended_theme(self):
        """Get recommended theme based on age group"""
        age_group = self.get_age_group()
        
        theme_mapping = {
            'children': 'kids',
            'teenagers': 'teen',
            'young_adults': 'default',
            'adults': 'professional',
            'older_adults': 'classic',
            'seniors': 'large_text',
        }
        
        return theme_mapping.get(age_group, 'default')
    
    def get_theme_config(self):
        """Get complete theme configuration for frontend"""
        age_group = self.get_age_group()
        theme = self.preferred_theme or self.get_recommended_theme()
        
        config = {
            'age_group': age_group,
            'theme': theme,
            'color_scheme': self.theme_color_scheme or 'default',
            'accessibility_mode': self.accessibility_mode,
            'large_text': self.large_text,
            'reduced_motion': self.reduced_motion,
        }
        
        # Age-specific adjustments
        if age_group in ['children', 'teenagers']:
            config['color_scheme'] = config['color_scheme'] or 'bright'
            config['animation_speed'] = 'fast'
        elif age_group in ['older_adults', 'seniors']:
            config['large_text'] = config['large_text'] or True
            config['animation_speed'] = 'slow'
            config['high_contrast'] = True
        
        return config
        
    def update_last_activity(self):
        """Update user's last activity timestamp"""
        try:
            self.last_activity = timezone.now()
            self.save(update_fields=['last_activity'])
        except Exception as e:
            logger.error(f"Error updating last activity for user {self.email}: {str(e)}")
    
    def set_age_group_from_birth_date(self):
        """Automatically set age group based on date of birth"""
        if self.date_of_birth and not self.age_group:
            self.age_group = self.get_age_group()
            self.save(update_fields=['age_group'])
    
    def is_minor(self):
        """Check if user is a minor (under 18)"""
        age = self.calculated_age
        return age is not None and age < 18
    
    def requires_parental_consent(self):
        """Check if user requires parental consent for data processing"""
        age = self.calculated_age
        return age is not None and age < 13  # COPPA requirement
    
    def get_privacy_level(self):
        """Get appropriate privacy level based on age"""
        age_group = self.get_age_group()
        
        if age_group == 'children':
            return 'high'  # Maximum privacy protection
        elif age_group == 'teenagers':
            return 'medium_high'
        else:
            return 'medium'
    
    def save(self, *args, **kwargs):
        """Override save to set automatic fields"""
        # Set age group if date of birth is provided
        if self.date_of_birth and not self.age_group:
            self.age_group = self.get_age_group()
        
        # Set recommended theme if none selected
        if not self.preferred_theme:
            self.preferred_theme = self.get_recommended_theme()
        
        super().save(*args, **kwargs)


class ConsentLog(models.Model):
    """Track consent changes for compliance"""
    
    CONSENT_TYPES = [
        ('data_sharing', 'Data Sharing'),
        ('location_tracking', 'Location Tracking'),
        ('analytics', 'Analytics'),
        ('marketing', 'Marketing'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consent_logs')
    consent_type = models.CharField(max_length=20, choices=CONSENT_TYPES)
    granted = models.BooleanField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'consent_logs'
        ordering = ['-timestamp']
        
    def __str__(self):
        action = "granted" if self.granted else "revoked"
        return f"{self.user.email} {action} {self.consent_type} consent"


class UserProfile(models.Model):
    """Extended user profile information"""
    
    OCCUPATION_CHOICES = [
        ('student', 'Student'),
        ('employed', 'Employed'),
        ('self_employed', 'Self Employed'),
        ('unemployed', 'Unemployed'),
        ('retired', 'Retired'),
        ('other', 'Other'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    occupation = models.CharField(max_length=20, choices=OCCUPATION_CHOICES, blank=True)
    
    # Travel preferences
    preferred_transport_modes = models.JSONField(default=list, blank=True)
    frequent_destinations = models.JSONField(default=list, blank=True)
    
    # Gamification preferences
    public_profile = models.BooleanField(default=False)
    show_on_leaderboard = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        
    def __str__(self):
        return f"{self.user.email}'s profile"


class UserSettings(models.Model):
    """User application settings"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    
    # Notification settings
    trip_reminders = models.BooleanField(default=True)
    weekly_summary = models.BooleanField(default=True)
    achievement_notifications = models.BooleanField(default=True)
    
    # App behavior settings
    auto_trip_detection = models.BooleanField(default=True)
    confirm_trips = models.BooleanField(default=True)
    offline_mode_preferred = models.BooleanField(default=False)
    
    # Data settings
    sync_frequency = models.IntegerField(default=15)  # minutes
    data_retention_days = models.IntegerField(default=365)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_settings'
        
    def __str__(self):
        return f"{self.user.email}'s settings"