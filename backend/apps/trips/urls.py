from django.urls import path
from . import views

urlpatterns = [
    # Trip CRUD operations
    path('', views.TripListCreateView.as_view(), name='trip-list-create'),
    path('<uuid:pk>/', views.TripDetailView.as_view(), name='trip-detail'),
    
    # Active trip management
    path('active/', views.active_trip_view, name='active-trip'),
    path('start/', views.start_trip_view, name='start-trip'),
    path('<uuid:trip_id>/complete/', views.complete_trip_view, name='complete-trip'),
    path('<uuid:trip_id>/waypoint/', views.add_waypoint_view, name='add-waypoint'),
    path('<uuid:trip_id>/diary/', views.add_diary_multipart_view, name='add-diary'),
    path('<uuid:trip_id>/diary/urls/', views.add_diary_urls_view, name='add-diary-urls'),
    
    # AI/ML features
    path('predict/', views.predict_trip_view, name='predict-trip'),
    
    # Analytics and statistics
    path('stats/', views.trip_stats_view, name='trip-stats'),
    path('timeline/', views.trip_timeline_view, name='trip-timeline'),
    path('heatmap/', views.trip_heatmap_view, name='trip-heatmap'),
    
    # Location management
    path('locations/', views.FrequentLocationListView.as_view(), name='frequent-locations'),
]