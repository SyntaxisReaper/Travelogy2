from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication endpoints
    path('register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('login/', views.login_view, name='user-login'),
    path('firebase-login/', views.firebase_login_view, name='firebase-login'),
    path('logout/', views.logout_view, name='user-logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Profile management
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('settings/', views.UserSettingsView.as_view(), name='user-settings'),
    path('profile/extended/', views.ExtendedProfileView.as_view(), name='extended-profile'),
    
    # Theme & Age Group Management
    path('theme/', views.theme_config_view, name='theme-config'),
    path('age-group/', views.set_age_group_view, name='set-age-group'),
    path('themes/available/', views.available_themes_view, name='available-themes'),
    path('accessibility/toggle/', views.toggle_accessibility_view, name='toggle-accessibility'),
    
    # Consent management
    path('consent/', views.update_consent_view, name='update-consent'),
    path('consent/history/', views.ConsentHistoryView.as_view(), name='consent-history'),
    path('consent/check/', views.check_consent_view, name='check-consent'),
    
    # User statistics and account management
    path('stats/', views.user_stats_view, name='user-stats'),
    path('password/change/', views.change_password_view, name='change-password'),
    path('delete-account/', views.delete_account_view, name='delete-account'),
]
