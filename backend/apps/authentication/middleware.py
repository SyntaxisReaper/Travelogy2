"""
Enhanced Authentication Middleware for Firebase integration
"""

import logging
import json
from typing import Optional, Dict, Any
from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings

# Firebase imports
try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth, credentials
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False

logger = logging.getLogger('apps.authentication')
User = get_user_model()

class FirebaseAuthenticationMiddleware:
    """
    Middleware to authenticate users via Firebase tokens
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.firebase_app = None
        self.initialize_firebase()
    
    def initialize_firebase(self):
        """
        Initialize Firebase Admin SDK
        """
        if not FIREBASE_AVAILABLE:
            logger.warning("Firebase Admin SDK not available")
            return
            
        try:
            # Check if Firebase is already initialized
            try:
                self.firebase_app = firebase_admin.get_app()
                logger.info("Using existing Firebase app")
            except ValueError:
                # Initialize Firebase if not already done
                firebase_config = getattr(settings, 'FIREBASE_CONFIG', {})
                
                if firebase_config.get('project_id'):
                    cred = credentials.Certificate(firebase_config)
                    self.firebase_app = firebase_admin.initialize_app(cred)
                    logger.info("Firebase Admin SDK initialized successfully")
                else:
                    logger.warning("Firebase configuration not found in settings")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {str(e)}")
    
    def __call__(self, request):
        """
        Process the request
        """
        # Skip Firebase auth for certain paths
        skip_paths = [
            '/admin/',
            '/api/docs/',
            '/api/schema/',
            '/health/',
            '/static/',
            '/media/',
        ]
        
        if any(request.path.startswith(path) for path in skip_paths):
            return self.get_response(request)
        
        # Try to authenticate via Firebase token
        self.authenticate_firebase_user(request)
        
        response = self.get_response(request)
        return response
    
    def authenticate_firebase_user(self, request) -> Optional[User]:
        """
        Authenticate user using Firebase token from headers
        """
        if not self.firebase_app:
            return None
            
        # Get Firebase token from different possible headers
        firebase_token = None
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        firebase_header = request.META.get('HTTP_X_FIREBASE_AUTH', '')
        
        if auth_header.startswith('Bearer '):
            firebase_token = auth_header.split(' ')[1]
        elif firebase_header:
            firebase_token = firebase_header
        
        if not firebase_token:
            return None
            
        try:
            # Verify the Firebase token
            decoded_token = firebase_auth.verify_id_token(firebase_token)
            firebase_uid = decoded_token.get('uid')
            email = decoded_token.get('email')
            name = decoded_token.get('name', '')
            picture = decoded_token.get('picture', '')
            
            if not firebase_uid or not email:
                logger.warning("Invalid Firebase token - missing uid or email")
                return None
            
            # Find or create user
            user = self.get_or_create_user_from_firebase(
                firebase_uid=firebase_uid,
                email=email,
                name=name,
                picture=picture,
                decoded_token=decoded_token
            )
            
            if user:
                # Set the authenticated user on the request
                request.user = user
                request.firebase_token = decoded_token
                
                # Update last activity
                user.update_last_activity()
                
                logger.debug(f"Authenticated user {email} via Firebase")
                return user
        
        except firebase_auth.ExpiredIdTokenError:
            logger.warning("Firebase token expired")
        except firebase_auth.RevokedIdTokenError:
            logger.warning("Firebase token revoked")
        except firebase_auth.InvalidIdTokenError:
            logger.warning("Invalid Firebase token")
        except Exception as e:
            logger.error(f"Firebase authentication error: {str(e)}")
        
        return None
    
    def get_or_create_user_from_firebase(
        self, 
        firebase_uid: str, 
        email: str, 
        name: str = '', 
        picture: str = '',
        decoded_token: Dict[str, Any] = None
    ) -> Optional[User]:
        """
        Get or create a Django user from Firebase data
        """
        try:
            # Try to find existing user by email
            try:
                user = User.objects.get(email=email)
                
                # Update Firebase UID if not set
                if not hasattr(user, 'firebase_uid') or not user.firebase_uid:
                    user.firebase_uid = firebase_uid
                    user.save(update_fields=['firebase_uid'])
                
                return user
            
            except User.DoesNotExist:
                # Create new user
                first_name = ''
                last_name = ''
                
                if name:
                    name_parts = name.split(' ', 1)
                    first_name = name_parts[0]
                    if len(name_parts) > 1:
                        last_name = name_parts[1]
                
                # Generate username from email
                username = email.split('@')[0]
                counter = 1
                original_username = username
                
                # Ensure unique username
                while User.objects.filter(username=username).exists():
                    username = f"{original_username}{counter}"
                    counter += 1
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    firebase_uid=firebase_uid,
                    is_active=True,
                )
                
                # Set additional fields if available
                if picture:
                    user.photo_url = picture
                
                # Set default consent for new users
                user.location_tracking_consent = True  # Required for the app to work
                user.analytics_consent = True
                
                user.save()
                
                logger.info(f"Created new user from Firebase: {email}")
                return user
        
        except Exception as e:
            logger.error(f"Error creating user from Firebase: {str(e)}")
            return None


class UserActivityMiddleware:
    """
    Middleware to track user activity
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Update user activity if authenticated
        if hasattr(request, 'user') and request.user.is_authenticated:
            self.update_user_activity(request.user, request)
        
        return response
    
    def update_user_activity(self, user, request):
        """
        Update user's last activity timestamp
        """
        try:
            # Only update if it's been more than 5 minutes since last update
            if (not user.last_activity or 
                timezone.now() - user.last_activity > timezone.timedelta(minutes=5)):
                
                user.last_activity = timezone.now()
                user.save(update_fields=['last_activity'])
                
        except Exception as e:
            logger.error(f"Error updating user activity: {str(e)}")


class APIErrorHandlingMiddleware:
    """
    Middleware to handle API errors gracefully
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            logger.error(f"Unhandled API error: {str(e)}", exc_info=True)
            
            # Return JSON error for API requests
            if request.path.startswith('/api/'):
                return JsonResponse({
                    'error': 'Internal server error',
                    'message': 'An unexpected error occurred',
                    'status': 500
                }, status=500)
            
            # Re-raise for non-API requests
            raise


@method_decorator(csrf_exempt, name='dispatch')
class CSRFExemptMixin:
    """
    Mixin to exempt views from CSRF protection
    """
    pass