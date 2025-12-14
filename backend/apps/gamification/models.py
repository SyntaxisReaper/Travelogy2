from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class UserPoints(models.Model):
    """Track user points and scores"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='points')
    
    total_points = models.IntegerField(default=0)
    trip_points = models.IntegerField(default=0)
    eco_points = models.IntegerField(default=0)
    streak_points = models.IntegerField(default=0)
    
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_activity_date = models.DateField(auto_now=True)
    
    level = models.IntegerField(default=1)
    xp_to_next_level = models.IntegerField(default=100)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_points'
    
    def add_points(self, points, point_type='trip'):
        """Add points and update level"""
        self.total_points += points
        
        if point_type == 'trip':
            self.trip_points += points
        elif point_type == 'eco':
            self.eco_points += points
        elif point_type == 'streak':
            self.streak_points += points
        
        # Level up logic
        while self.total_points >= self.xp_to_next_level:
            self.total_points -= self.xp_to_next_level
            self.level += 1
            self.xp_to_next_level = self.level * 100  # Scaling XP requirement
        
        self.save()


class Badge(models.Model):
    """Available badges"""
    
    BADGE_TYPES = [
        ('trip_count', 'Trip Count'),
        ('distance', 'Distance'),
        ('eco_friendly', 'Eco Friendly'),
        ('streak', 'Streak'),
        ('mode_mastery', 'Mode Mastery'),
        ('explorer', 'Explorer'),
        ('consistency', 'Consistency'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    badge_type = models.CharField(max_length=20, choices=BADGE_TYPES)
    icon = models.CharField(max_length=50)  # Icon name/class
    color = models.CharField(max_length=7, default='#3f51b5')  # Hex color
    
    requirement_value = models.IntegerField()  # e.g., 10 trips, 100km
    points_reward = models.IntegerField(default=10)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'badges'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class UserBadge(models.Model):
    """User earned badges"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='earned_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    
    earned_at = models.DateTimeField(auto_now_add=True)
    progress_value = models.IntegerField(default=0)  # Value when earned
    
    class Meta:
        db_table = 'user_badges'
        unique_together = ['user', 'badge']
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.badge.name}"


class Achievement(models.Model):
    """Special achievements and milestones"""
    
    ACHIEVEMENT_TYPES = [
        ('milestone', 'Milestone'),
        ('challenge', 'Challenge'),
        ('seasonal', 'Seasonal'),
        ('special', 'Special Event'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    
    requirements = models.JSONField(default=dict)  # Flexible requirement definition
    reward_points = models.IntegerField(default=50)
    reward_badge = models.ForeignKey(Badge, on_delete=models.SET_NULL, null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'achievements'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    """User earned achievements"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    
    earned_at = models.DateTimeField(auto_now_add=True)
    progress_data = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'user_achievements'
        unique_together = ['user', 'achievement']
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.achievement.name}"


class Leaderboard(models.Model):
    """Leaderboard entries"""
    
    LEADERBOARD_TYPES = [
        ('weekly_points', 'Weekly Points'),
        ('monthly_points', 'Monthly Points'),
        ('total_points', 'Total Points'),
        ('eco_score', 'Eco Score'),
        ('trip_count', 'Trip Count'),
        ('distance', 'Distance'),
        ('streak', 'Current Streak'),
    ]
    
    leaderboard_type = models.CharField(max_length=20, choices=LEADERBOARD_TYPES)
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    
    user_rankings = models.JSONField(default=list)  # Cached rankings
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'leaderboards'
        unique_together = ['leaderboard_type', 'period_start']
        ordering = ['-period_start']


class Challenge(models.Model):
    """Time-limited challenges"""
    
    CHALLENGE_TYPES = [
        ('individual', 'Individual'),
        ('community', 'Community'),
        ('team', 'Team'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    challenge_type = models.CharField(max_length=20, choices=CHALLENGE_TYPES)
    
    goal = models.JSONField(default=dict)  # Flexible goal definition
    reward_points = models.IntegerField(default=100)
    
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    is_active = models.BooleanField(default=True)
    max_participants = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'challenges'
        ordering = ['-start_date']
    
    def __str__(self):
        return self.name


class ChallengeParticipant(models.Model):
    """Challenge participants and progress"""
    
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    joined_at = models.DateTimeField(auto_now_add=True)
    progress = models.JSONField(default=dict)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'challenge_participants'
        unique_together = ['challenge', 'user']
    
    def __str__(self):
        return f"{self.user.email} - {self.challenge.name}"