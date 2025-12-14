from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import UserPoints, UserBadge, Badge


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get user gamification profile"""
    
    points, created = UserPoints.objects.get_or_create(user=request.user)
    badges = UserBadge.objects.filter(user=request.user).select_related('badge')
    
    return Response({
        'points': {
            'total': points.total_points,
            'level': points.level,
            'current_streak': points.current_streak,
            'longest_streak': points.longest_streak,
        },
        'badges': [{
            'name': ub.badge.name,
            'description': ub.badge.description,
            'icon': ub.badge.icon,
            'color': ub.badge.color,
            'earned_at': ub.earned_at,
        } for ub in badges]
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leaderboard(request):
    """Get leaderboard data"""
    
    # Simple leaderboard by total points
    top_users = UserPoints.objects.select_related('user').order_by('-total_points')[:10]
    
    return Response({
        'rankings': [{
            'rank': idx + 1,
            'username': up.user.username,
            'points': up.total_points,
            'level': up.level,
        } for idx, up in enumerate(top_users)]
    })