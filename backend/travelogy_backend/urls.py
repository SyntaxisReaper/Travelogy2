"""
URL configuration for travelogy_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/trips/', include('apps.trips.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/gamification/', include('apps.gamification.urls')),
    path('api/emergency/', include('apps.emergency.urls')),
    path('api/bookings/', include('apps.bookings.urls')),
    path('api/stores/', include('apps.stores.urls')),
    path('api/tourism/', include('apps.tourism.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)