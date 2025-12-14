"""
Firebase Authentication Backend for Django REST Framework
"""

import logging
from typing import Optional, Tuple, Dict, Any
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend
from rest_framework import authentication, exceptions
from rest_framework.request import Request
from django.conf import settings

# Firebase imports
try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False

logger = logging.getLogger('apps.authentication')
User = get_user_model()


class FirebaseAuthentication(authentication.BaseAuthentication):
    """
    Firebase token authentication for Django REST Framework
    """
    
    def authenticate(self, request: Request) -> Optional[Tuple[User, Dict[str, Any]]]:
        """
        Authenticate user using Firebase ID token
        
        Returns:
            Tuple of (user, auth_data) or None if authentication fails
        """
        if not FIREBASE_AVAILABLE:
            logger.debug("Firebase not available, skipping Firebase authentication")
            return None
        
        # Extract Firebase token from request
        firebase_token = self.get_firebase_token(request)
        
        if not firebase_token:
            return None
        
        try:
            # Verify Firebase token
            decoded_token = firebase_auth.verify_id_token(firebase_token)
            
            # Get user data from token
            firebase_uid = decoded_token.get('uid')
            email = decoded_token.get('email')
            
            if not firebase_uid or not email:
                logger.warning("Firebase token missing required fields")
                raise exceptions.AuthenticationFailed('Invalid Firebase token')
            
            # Find or create Django user
            user = self.get_or_create_user_from_firebase(
                firebase_uid=firebase_uid,
                email=email,
                decoded_token=decoded_token
            )
            
            if not user:
                raise exceptions.AuthenticationFailed('Could not authenticate with Firebase token')
            
            # Update user activity
            user.update_last_activity()
            
            logger.debug(f"Successfully authenticated user {email} via Firebase")
            return (user, decoded_token)
        
        except firebase_auth.ExpiredIdTokenError:
            logger.warning("Firebase token expired")
            raise exceptions.AuthenticationFailed('Firebase token expired')
        
        except firebase_auth.RevokedIdTokenError:
            logger.warning("Firebase token revoked")
            raise exceptions.AuthenticationFailed('Firebase token revoked')
        
        except firebase_auth.InvalidIdTokenError:
            logger.warning("Invalid Firebase token")
            raise exceptions.AuthenticationFailed('Invalid Firebase token')
        
        except Exception as e:
            logger.error(f"Firebase authentication error: {str(e)}")
            raise exceptions.AuthenticationFailed('Firebase authentication failed')
    
    def get_firebase_token(self, request: Request) -> Optional[str]:
        """
        Extract Firebase token from request headers
        """
        # Try Authorization header first
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            return auth_header.split(' ')[1]
        
        # Try custom Firebase header
        firebase_header = request.META.get('HTTP_X_FIREBASE_AUTH', '')
        if firebase_header:
            return firebase_header
        
        # Try query parameter (for WebSocket connections)
        firebase_token = request.query_params.get('firebase_token')
        if firebase_token:
            return firebase_token
        
        return None
    
    def get_or_create_user_from_firebase(
        self, 
        firebase_uid: str, 
        email: str, 
        decoded_token: Dict[str, Any]
    ) -> Optional[User]:
        """
        Get or create Django user from Firebase token data
        """
        try:
            # Try to find existing user by Firebase UID
            try:
                user = User.objects.get(firebase_uid=firebase_uid)
                return user
            except User.DoesNotExist:
                pass
            
            # Try to find by email
            try:
                user = User.objects.get(email=email)
                # Update Firebase UID
                user.firebase_uid = firebase_uid
                user.save(update_fields=['firebase_uid'])
                return user
            except User.DoesNotExist:
                pass
            
            # Create new user
            name = decoded_token.get('name', '')
            picture = decoded_token.get('picture', '')
            phone = decoded_token.get('phone_number', '')
            
            # Parse name
            first_name = ''
            last_name = ''
            if name:
                name_parts = name.split(' ', 1)
                first_name = name_parts[0]
                if len(name_parts) > 1:
                    last_name = name_parts[1]
            
            # Generate unique username
            username = email.split('@')[0]
            counter = 1
            original_username = username
            
            while User.objects.filter(username=username).exists():
                username = f"{original_username}{counter}"
                counter += 1
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                firebase_uid=firebase_uid,
                phone_number=phone,
                is_active=True,
            )
            
            # Set additional fields
            if picture:
                user.photo_url = picture
            
            # Set default permissions for travel app functionality
            user.location_tracking_consent = True  # Required for core functionality
            user.analytics_consent = True
            user.data_sharing_consent = False  # Let user decide
            user.marketing_consent = False  # Let user decide
            
            user.save()
            
            logger.info(f"Created new user from Firebase: {email}")
            return user
        
        except Exception as e:
            logger.error(f"Error getting/creating user from Firebase: {str(e)}")
            return None
    
    def authenticate_header(self, request: Request) -> str:
        """
        Return the authentication header for 401 responses
        """
        return 'Bearer'


class FirebaseBackend(BaseBackend):
    """
    Django authentication backend for Firebase
    """
    
    def authenticate(self, request, firebase_token=None, **kwargs):
        """
        Authenticate user using Firebase token
        """
        if not firebase_token or not FIREBASE_AVAILABLE:
            return None
        
        try:
            # Verify Firebase token
            decoded_token = firebase_auth.verify_id_token(firebase_token)
            
            firebase_uid = decoded_token.get('uid')
            email = decoded_token.get('email')
            
            if not firebase_uid or not email:
                return None
            
            # Find user by Firebase UID
            try:
                user = User.objects.get(firebase_uid=firebase_uid)
                return user
            except User.DoesNotExist:
                # Try to find by email
                try:
                    user = User.objects.get(email=email)
                    user.firebase_uid = firebase_uid
                    user.save(update_fields=['firebase_uid'])
                    return user
                except User.DoesNotExist:
                    # Create new user
                    return self.create_user_from_firebase(decoded_token)
        
        except Exception as e:
            logger.error(f"Firebase backend authentication error: {str(e)}")
            return None
    
    def create_user_from_firebase(self, decoded_token: Dict[str, Any]) -> Optional[User]:
        """
        Create a new user from Firebase token data
        """
        try:
            firebase_uid = decoded_token.get('uid')
            email = decoded_token.get('email')
            name = decoded_token.get('name', '')
            picture = decoded_token.get('picture', '')
            
            if not firebase_uid or not email:
                return None
            
            # Parse name
            first_name = ''
            last_name = ''
            if name:
                name_parts = name.split(' ', 1)
                first_name = name_parts[0]
                if len(name_parts) > 1:
                    last_name = name_parts[1]
            
            # Generate username
            username = email.split('@')[0]
            counter = 1
            original_username = username
            
            while User.objects.filter(username=username).exists():
                username = f"{original_username}{counter}"
                counter += 1
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                firebase_uid=firebase_uid,
                is_active=True,
            )
            
            if picture:
                user.photo_url = picture
            
            # Set default permissions
            user.location_tracking_consent = True
            user.analytics_consent = True
            
            user.save()
            
            logger.info(f"Created user from Firebase backend: {email}")
            return user
        
        except Exception as e:
            logger.error(f"Error creating user in Firebase backend: {str(e)}")
            return None
    
    def get_user(self, user_id):
        """
        Get user by ID
        """
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


class MultipleAuthentication(authentication.BaseAuthentication):
    """
    Authentication class that tries multiple authentication methods
    """
    
    def __init__(self):
        self.firebase_auth = FirebaseAuthentication()
        self.session_auth = authentication.SessionAuthentication()
    
    def authenticate(self, request: Request):
        """
        Try Firebase authentication first, then session authentication
        """
        # Try Firebase authentication
        if FIREBASE_AVAILABLE:
            firebase_result = self.firebase_auth.authenticate(request)
            if firebase_result:
                return firebase_result
        
        # Fallback to session authentication
        try:
            session_result = self.session_auth.authenticate(request)
            if session_result:
                return session_result
        except:
            pass
        
        return None
    
    def authenticate_header(self, request: Request) -> str:
        """
        Return authentication header
        """
        return 'Bearer'


def get_firebase_user_info(firebase_uid: str) -> Optional[Dict[str, Any]]:
    """
    Get user information from Firebase
    """
    if not FIREBASE_AVAILABLE:
        return None
    
    try:
        user_record = firebase_auth.get_user(firebase_uid)
        return {
            'uid': user_record.uid,
            'email': user_record.email,
            'email_verified': user_record.email_verified,
            'display_name': user_record.display_name,
            'photo_url': user_record.photo_url,
            'phone_number': user_record.phone_number,
            'disabled': user_record.disabled,
            'creation_timestamp': user_record.user_metadata.creation_timestamp,
            'last_sign_in_timestamp': user_record.user_metadata.last_sign_in_timestamp,
        }
    except Exception as e:
        logger.error(f"Error getting Firebase user info: {str(e)}")
        return None


def verify_firebase_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify Firebase token and return decoded data
    """
    if not FIREBASE_AVAILABLE or not token:
        return None
    
    try:
        return firebase_auth.verify_id_token(token)
    except Exception as e:
        logger.error(f"Error verifying Firebase token: {str(e)}")
        return None