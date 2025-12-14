from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile, UserSettings, ConsentLog


class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration serializer"""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number',
            'data_sharing_consent', 'location_tracking_consent',
            'analytics_consent', 'marketing_consent'
        ]
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
        
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create related objects
        UserProfile.objects.create(user=user)
        UserSettings.objects.create(user=user)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """User login serializer"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('Account is disabled.')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Email and password are required.')
            
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer"""
    
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'phone_number', 'date_of_birth', 'city', 'country',
            'data_sharing_consent', 'location_tracking_consent',
            'analytics_consent', 'marketing_consent',
            'is_active_tracker', 'preferred_language', 'timezone',
            'created_at', 'last_activity'
        ]
        read_only_fields = ['id', 'username', 'email', 'created_at', 'last_activity']


class UserSettingsSerializer(serializers.ModelSerializer):
    """User settings serializer"""
    
    class Meta:
        model = UserSettings
        exclude = ['id', 'user', 'created_at', 'updated_at']


class ExtendedUserProfileSerializer(serializers.ModelSerializer):
    """Extended user profile with related data"""
    
    class Meta:
        model = UserProfile
        exclude = ['id', 'user', 'created_at', 'updated_at']


class ConsentUpdateSerializer(serializers.Serializer):
    """Update user consent preferences"""
    
    data_sharing_consent = serializers.BooleanField(required=False)
    location_tracking_consent = serializers.BooleanField(required=False)
    analytics_consent = serializers.BooleanField(required=False)
    marketing_consent = serializers.BooleanField(required=False)
    
    def update(self, instance, validated_data):
        # Track consent changes
        request = self.context.get('request')
        ip_address = None
        user_agent = ''
        
        if request:
            ip_address = request.META.get('REMOTE_ADDR')
            user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        for field, value in validated_data.items():
            old_value = getattr(instance, field)
            if old_value != value:
                setattr(instance, field, value)
                
                # Log consent change
                ConsentLog.objects.create(
                    user=instance,
                    consent_type=field.replace('_consent', ''),
                    granted=value,
                    ip_address=ip_address,
                    user_agent=user_agent
                )
        
        instance.save()
        return instance


class ConsentLogSerializer(serializers.ModelSerializer):
    """Consent log serializer for viewing history"""
    
    class Meta:
        model = ConsentLog
        fields = '__all__'
        read_only_fields = ['id', 'user', 'timestamp']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        user = self.context['request'].user
        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError({ 'old_password': 'Incorrect current password.' })
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserStatsSerializer(serializers.Serializer):
    """User statistics serializer"""
    
    total_trips = serializers.IntegerField()
    total_distance = serializers.FloatField()
    total_duration = serializers.IntegerField()
    most_used_mode = serializers.CharField()
    trips_this_week = serializers.IntegerField()
    trips_this_month = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()