from django.contrib import admin
from .models import UserPoints, Badge, UserBadge, Achievement, UserAchievement


@admin.register(UserPoints)
class UserPointsAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_points', 'level', 'current_streak', 'longest_streak']
    list_filter = ['level']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'badge_type', 'requirement_value', 'points_reward', 'is_active']
    list_filter = ['badge_type', 'is_active']


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge', 'earned_at']
    list_filter = ['badge', 'earned_at']
    search_fields = ['user__email', 'badge__name']


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['name', 'achievement_type', 'reward_points', 'is_active']
    list_filter = ['achievement_type', 'is_active']