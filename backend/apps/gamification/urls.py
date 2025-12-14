from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.user_profile, name='gamification-profile'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
]