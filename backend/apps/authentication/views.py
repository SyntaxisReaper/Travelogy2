from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from django.db.models import Count, Sum, Avg
from .models import User, UserProfile, UserSettings, ConsentLog
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    UserSettingsSerializer, ExtendedUserProfileSerializer, ConsentUpdateSerializer,
    ConsentLogSerializer, UserStatsSerializer, ChangePasswordSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'User registered successfully',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Enhanced user login endpoint with Firebase support"""
    
    # Check if this is a Firebase login
    firebase_token = request.data.get('firebase_token')
    if firebase_token:
        return firebase_login_view(request)
    
    # Standard email/password login
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        user.update_last_activity()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Get theme configuration
        theme_config = user.get_theme_config()
        
        return Response({
            'message': 'Login successful',
            'user': UserProfileSerializer(user).data,
            'theme_config': theme_config,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def firebase_login_view(request):
    """Firebase authentication endpoint"""
    from .authentication import verify_firebase_token
    
    firebase_token = request.data.get('firebase_token')
    if not firebase_token:
        return Response({
            'error': 'Firebase token required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify Firebase token
    decoded_token = verify_firebase_token(firebase_token)
    if not decoded_token:
        return Response({
            'error': 'Invalid Firebase token'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        firebase_uid = decoded_token.get('uid')
        email = decoded_token.get('email')
        name = decoded_token.get('name', '')
        picture = decoded_token.get('picture', '')
        email_verified = decoded_token.get('email_verified', False)
        
        if not firebase_uid or not email:
            return Response({
                'error': 'Invalid Firebase token data'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find or create user
        user = None
        created = False
        
        # Try to find by Firebase UID first
        try:
            user = User.objects.get(firebase_uid=firebase_uid)
        except User.DoesNotExist:
            # Try to find by email
            try:
                user = User.objects.get(email=email)
                user.firebase_uid = firebase_uid
                user.email_verified = email_verified
                if picture and not user.photo_url:
                    user.photo_url = picture
                user.save()
            except User.DoesNotExist:
                # Create new user
                first_name, last_name = '', ''
                if name:
                    name_parts = name.split(' ', 1)
                    first_name = name_parts[0]
                    if len(name_parts) > 1:
                        last_name = name_parts[1]
                
                username = email.split('@')[0]
                counter = 1
                original_username = username
                
                while User.objects.filter(username=username).exists():
                    username = f"{original_username}{counter}"
                    counter += 1
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    firebase_uid=firebase_uid,
                    email_verified=email_verified,
                    photo_url=picture,
                    is_active=True,
                    location_tracking_consent=True,  # Required for app functionality
                    analytics_consent=True,
                )
                created = True
        
        # Update last activity
        user.update_last_activity()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Get theme configuration
        theme_config = user.get_theme_config()
        
        return Response({
            'message': 'Firebase login successful',
            'user': UserProfileSerializer(user).data,
            'theme_config': theme_config,
            'created': created,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Firebase login error: {str(e)}")
        return Response({
            'error': 'Firebase login failed',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def logout_view(request):
    """User logout endpoint"""
    
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Invalid token'
        }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        request.user.update_last_activity()
        return super().update(request, *args, **kwargs)


class UserSettingsView(generics.RetrieveUpdateAPIView):
    """Get and update user settings"""
    
    serializer_class = UserSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        settings, created = UserSettings.objects.get_or_create(
            user=self.request.user
        )
        return settings


class ExtendedProfileView(generics.RetrieveUpdateAPIView):
    """Get and update extended user profile"""
    
    serializer_class = ExtendedUserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile


@api_view(['POST'])
def update_consent_view(request):
    """Update user consent preferences"""
    
    serializer = ConsentUpdateSerializer(
        instance=request.user,
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Consent updated successfully',
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ConsentHistoryView(generics.ListAPIView):
    """View user's consent history"""
    
    serializer_class = ConsentLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ConsentLog.objects.filter(user=self.request.user)


@api_view(['GET'])
def user_stats_view(request):
    """Get user statistics"""
    
    user = request.user
    
    # Import Trip model here to avoid circular imports
    from apps.trips.models import Trip
    
    # Calculate statistics
    trips = Trip.objects.filter(user=user)
    
    stats = {
        'total_trips': trips.count(),
        'total_distance': trips.aggregate(
            total=Sum('distance_km')
        )['total'] or 0,
        'total_duration': trips.aggregate(
            total=Sum('duration_minutes')
        )['total'] or 0,
        'most_used_mode': trips.values('transport_mode').annotate(
            count=Count('id')
        ).order_by('-count').first()['transport_mode'] if trips.exists() else 'N/A',
        'trips_this_week': trips.filter(
            start_time__gte=timezone.now() - timezone.timedelta(days=7)
        ).count(),
        'trips_this_month': trips.filter(
            start_time__gte=timezone.now() - timezone.timedelta(days=30)
        ).count(),
        'current_streak': 0,  # TODO: Implement streak calculation
        'longest_streak': 0,  # TODO: Implement streak calculation
    }
    
    serializer = UserStatsSerializer(stats)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def change_password_view(request):
    """Change password for the authenticated user"""
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({ 'message': 'Password changed successfully' }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_account_view(request):
    """Delete user account (soft delete)"""
    
    user = request.user
    
    # Soft delete - deactivate account
    user.is_active = False
    user.save()
    
    return Response({
        'message': 'Account deactivated successfully'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def check_consent_view(request):
    """Check if user has given required consents"""
    
    user = request.user
    
    consent_status = {
        'has_basic_consent': user.has_given_basic_consent,
        'location_tracking': user.location_tracking_consent,
        'data_sharing': user.data_sharing_consent,
        'analytics': user.analytics_consent,
        'marketing': user.marketing_consent,
    }
    
    return Response(consent_status, status=status.HTTP_200_OK)


from django.utils import timezone
import logging

logger = logging.getLogger('apps.authentication')


@api_view(['GET', 'POST'])
def theme_config_view(request):
    """Get or update user's theme configuration"""
    user = request.user
    
    if request.method == 'GET':
        theme_config = user.get_theme_config()
        return Response({
            'theme_config': theme_config,
            'available_themes': dict(User.THEME_CHOICES),
            'age_groups': dict(User.AGE_GROUP_CHOICES),
            'recommended_theme': user.get_recommended_theme()
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # Update theme preferences
        theme = request.data.get('theme')
        color_scheme = request.data.get('color_scheme')
        accessibility_mode = request.data.get('accessibility_mode')
        large_text = request.data.get('large_text')
        reduced_motion = request.data.get('reduced_motion')
        age_group = request.data.get('age_group')
        
        updated_fields = []
        
        if theme and theme in dict(User.THEME_CHOICES):
            user.preferred_theme = theme
            updated_fields.append('preferred_theme')
        
        if color_scheme:
            user.theme_color_scheme = color_scheme
            updated_fields.append('theme_color_scheme')
        
        if accessibility_mode is not None:
            user.accessibility_mode = accessibility_mode
            updated_fields.append('accessibility_mode')
        
        if large_text is not None:
            user.large_text = large_text
            updated_fields.append('large_text')
        
        if reduced_motion is not None:
            user.reduced_motion = reduced_motion
            updated_fields.append('reduced_motion')
        
        if age_group and age_group in dict(User.AGE_GROUP_CHOICES):
            user.age_group = age_group
            updated_fields.append('age_group')
        
        if updated_fields:
            user.save(update_fields=updated_fields)
        
        return Response({
            'message': 'Theme configuration updated',
            'theme_config': user.get_theme_config()
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
def set_age_group_view(request):
    """Set user's age group and get recommended theme"""
    age_group = request.data.get('age_group')
    date_of_birth = request.data.get('date_of_birth')
    
    if not age_group and not date_of_birth:
        return Response({
            'error': 'Either age_group or date_of_birth is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    updated_fields = []
    
    # Set date of birth if provided
    if date_of_birth:
        from datetime import datetime
        try:
            if isinstance(date_of_birth, str):
                date_of_birth = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
            user.date_of_birth = date_of_birth
            updated_fields.append('date_of_birth')
            # Auto-calculate age group
            user.set_age_group_from_birth_date()
        except ValueError:
            return Response({
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Set age group if provided
    if age_group and age_group in dict(User.AGE_GROUP_CHOICES):
        user.age_group = age_group
        updated_fields.append('age_group')
    
    # Update recommended theme
    recommended_theme = user.get_recommended_theme()
    if not user.preferred_theme or user.preferred_theme == 'default':
        user.preferred_theme = recommended_theme
        updated_fields.append('preferred_theme')
    
    if updated_fields:
        user.save(update_fields=updated_fields)
    
    return Response({
        'message': 'Age group updated',
        'age_group': user.get_age_group(),
        'recommended_theme': recommended_theme,
        'theme_config': user.get_theme_config(),
        'is_minor': user.is_minor(),
        'requires_parental_consent': user.requires_parental_consent(),
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def available_themes_view(request):
    """Get available themes and age groups"""
    return Response({
        'themes': dict(User.THEME_CHOICES),
        'age_groups': dict(User.AGE_GROUP_CHOICES),
        'color_schemes': {
            'default': 'Default',
            'bright': 'Bright Colors',
            'pastel': 'Soft Pastels',
            'dark': 'Dark Mode',
            'high_contrast': 'High Contrast',
            'monochrome': 'Monochrome'
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def toggle_accessibility_view(request):
    """Toggle accessibility features"""
    user = request.user
    feature = request.data.get('feature')
    enabled = request.data.get('enabled', True)
    
    if feature == 'accessibility_mode':
        user.accessibility_mode = enabled
    elif feature == 'large_text':
        user.large_text = enabled
    elif feature == 'reduced_motion':
        user.reduced_motion = enabled
    else:
        return Response({
            'error': 'Invalid accessibility feature'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.save(update_fields=[feature])
    
    return Response({
        'message': f'{feature} {"enabled" if enabled else "disabled"}',
        'theme_config': user.get_theme_config()
    }, status=status.HTTP_200_OK)
