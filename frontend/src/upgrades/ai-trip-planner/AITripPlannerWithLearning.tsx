import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Stack,
  Badge,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Fab
} from '@mui/material';
import {
  AutoAwesome,
  TravelExplore,
  Psychology,
  Analytics,
  ThumbUp,
  ThumbDown,
  Bookmark,
  Share,
  ExpandMore,
  Timeline,
  School,
  Lightbulb,
  TrendingUp,
  Star,
  Feedback,
  Update
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

import AITripPlanner from './AITripPlanner';
import UserBehaviorTracker, { useTracking, TrackingTrigger } from './components/UserBehaviorTracker';
import AIRecommendationEngine, { 
  UserProfile, 
  PredictionResult,
  ActivityRecommendation,
  BudgetOptimization
} from './services/AIRecommendationEngine';
import WeatherService from './services/WeatherService';

interface AITripPlannerWithLearningProps {
  userId: string;
  onPlanGenerated?: (plan: any) => void;
  userPreferences?: any;
  previousTrips?: any[];
}

interface LearningInsight {
  type: 'preference' | 'pattern' | 'improvement' | 'trend';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  suggestions?: string[];
}

interface FeedbackModalData {
  recommendationId: string;
  recommendationType: 'destination' | 'activity' | 'budget' | 'timing';
  open: boolean;
}

const AITripPlannerWithLearning: React.FC<AITripPlannerWithLearningProps> = ({
  userId,
  onPlanGenerated,
  userPreferences = {},
  previousTrips = []
}) => {
  // State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<PredictionResult | null>(null);
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalData>({
    recommendationId: '',
    recommendationType: 'destination',
    open: false
  });
  const [personalizedPlan, setPersonalizedPlan] = useState<any>(null);

  // Generate personalized recommendations using AI
  const generatePersonalizedRecommendations = useCallback(async () => {
    if (!userProfile) return;

    setIsLearning(true);
    try {
      const recommendations = await AIRecommendationEngine.generateRecommendations(userId, {
        budget: userProfile.preferences.budgetRange,
        interests: userProfile.preferences.interests,
        travelStyle: userProfile.preferences.preferredTravelStyle[0],
        duration: 7 // Default, could be from user input
      });

      setAiRecommendations(recommendations);
      
      // Generate learning insights
      const insights = generateLearningInsights(userProfile, recommendations);
      setLearningInsights(insights);
      
      onPlanGenerated?.(recommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLearning(false);
    }
  }, [userProfile, userId, onPlanGenerated]);

  // Generate insights from user data and AI analysis
  const generateLearningInsights = (profile: UserProfile, recommendations: PredictionResult): LearningInsight[] => {
    const insights: LearningInsight[] = [];

    // Confidence insight
    insights.push({
      type: 'improvement',
      title: 'Personalization Level',
      description: `Your recommendations are ${(recommendations.personalizationLevel * 100).toFixed(0)}% personalized. ${
        recommendations.personalizationLevel < 0.7 
          ? 'More interactions will improve accuracy!' 
          : 'Highly personalized recommendations!'
      }`,
      confidence: recommendations.personalizationLevel,
      actionable: recommendations.personalizationLevel < 0.7,
      suggestions: recommendations.personalizationLevel < 0.7 ? [
        'Rate more destinations and activities',
        'Complete trip feedback surveys',
        'Save interesting destinations for later'
      ] : undefined
    });

    // Budget optimization insight
    if (recommendations.budgetOptimization.savingOpportunities.length > 0) {
      insights.push({
        type: 'improvement',
        title: 'Smart Budget Optimization',
        description: `I've identified ${recommendations.budgetOptimization.savingOpportunities.length} ways to optimize your budget.`,
        confidence: 0.8,
        actionable: true,
        suggestions: recommendations.budgetOptimization.savingOpportunities.slice(0, 3)
      });
    }

    // Activity preference patterns
    if (profile.preferences.interests.length >= 3) {
      insights.push({
        type: 'pattern',
        title: 'Activity Preference Pattern',
        description: `Based on your interests in ${profile.preferences.interests.slice(0, 2).join(' and ')}, I've detected you enjoy immersive cultural experiences.`,
        confidence: 0.75,
        actionable: true,
        suggestions: [
          'Try local cooking classes',
          'Book guided historical tours',
          'Stay in locally-owned accommodations'
        ]
      });
    }

    // Seasonal travel trends
    if (profile.tripHistory.length >= 2) {
      insights.push({
        type: 'trend',
        title: 'Seasonal Travel Trends',
        description: 'Your travel patterns suggest you prefer shoulder seasons for better value and fewer crowds.',
        confidence: 0.7,
        actionable: true,
        suggestions: [
          'Consider April-May or September-October',
          'Book accommodation 2-3 months ahead',
          'Take advantage of off-peak pricing'
        ]
      });
    }

    return insights;
  };

  // Handle user learning updates
  const handleLearningUpdate = useCallback((updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    console.log('User profile updated with new learning data');
  }, []);

  // Handle feedback submission
  const handleFeedback = useCallback(async (feedback: {
    rating: number;
    comments?: string;
    action: 'accepted' | 'rejected' | 'modified';
  }) => {
    try {
      await AIRecommendationEngine.processFeedback(userId, {
        recommendationId: feedbackModal.recommendationId,
        ...feedback
      });
      
      setFeedbackModal({ ...feedbackModal, open: false });
      
      // Regenerate recommendations with new feedback
      await generatePersonalizedRecommendations();
    } catch (error) {
      console.error('Error processing feedback:', error);
    }
  }, [userId, feedbackModal, generatePersonalizedRecommendations]);

  // Initialize user profile on mount
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        // Load or create user profile
        const profile = await AIRecommendationEngine.trainOnUserData(userId, [], []);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error initializing user profile:', error);
      }
    };

    initializeProfile();
  }, [userId]);

  return (
    <UserBehaviorTracker userId={userId} onLearningUpdate={handleLearningUpdate}>
      <Box>
        {/* Learning Status Header */}
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Psychology fontSize="large" />
                Smart AI Trip Planner
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                🧠 Personalized with machine learning • {userProfile ? `${(userProfile.confidenceScore * 100).toFixed(0)}% personalized` : 'Learning your preferences...'}
              </Typography>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={1}>
                <Chip
                  icon={<Analytics />}
                  label={`${userProfile?.behaviorHistory.length || 0} interactions tracked`}
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'white' }}
                />
                <Chip
                  icon={<TrendingUp />}
                  label={`${userProfile?.tripHistory.length || 0} trips learned`}
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'white' }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {/* Main AI Trip Planner */}
          <Grid item xs={12} lg={8}>
            <AITripPlanner
              userPreferences={userProfile?.preferences}
              onPlanGenerated={(plan) => {
                setPersonalizedPlan(plan);
                onPlanGenerated?.(plan);
              }}
              previousTrips={userProfile?.tripHistory || []}
            />

            {/* Enhanced Results with Learning Features */}
            {aiRecommendations && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Paper sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesome />
                    AI-Enhanced Recommendations
                    <Badge 
                      badgeContent={`${(aiRecommendations.personalizationLevel * 100).toFixed(0)}%`} 
                      color="primary"
                    />
                  </Typography>

                  {/* Activity Recommendations with Tracking */}
                  {aiRecommendations.activityRecommendations.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        🎯 Personalized Activity Suggestions
                      </Typography>
                      <Grid container spacing={2}>
                        {aiRecommendations.activityRecommendations.slice(0, 4).map((activity, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Card sx={{ position: 'relative' }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                  <Typography variant="h6">
                                    {activity.activity}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <TrackingTrigger
                                      action="like"
                                      targetType="activity"
                                      targetId={activity.activity}
                                    >
                                      <IconButton size="small">
                                        <ThumbUp />
                                      </IconButton>
                                    </TrackingTrigger>
                                    <TrackingTrigger
                                      action="save"
                                      targetType="activity"
                                      targetId={activity.activity}
                                    >
                                      <IconButton size="small">
                                        <Bookmark />
                                      </IconButton>
                                    </TrackingTrigger>
                                  </Box>
                                </Box>
                                
                                <Rating 
                                  value={activity.predictedEnjoyment} 
                                  readOnly 
                                  precision={0.1}
                                  size="small" 
                                  sx={{ mb: 1 }}
                                />
                                
                                <Typography variant="body2" color="text.secondary" paragraph>
                                  Predicted enjoyment: {(activity.predictedEnjoyment * 100).toFixed(0)}%
                                </Typography>
                                
                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                                  {activity.reasoning.slice(0, 2).map((reason, i) => (
                                    <Chip key={i} label={reason} size="small" variant="outlined" />
                                  ))}
                                </Stack>

                                <Button
                                  size="small"
                                  sx={{ mt: 1 }}
                                  onClick={() => setFeedbackModal({
                                    recommendationId: activity.activity,
                                    recommendationType: 'activity',
                                    open: true
                                  })}
                                >
                                  Provide Feedback
                                </Button>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Smart Budget Recommendations */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      💰 AI Budget Optimization
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={8}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Optimized Budget Allocation
                            </Typography>
                            {Object.entries(aiRecommendations.budgetOptimization.allocation).map(([category, amount]) => (
                              <Box key={category} sx={{ mb: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                    {category}
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    ${amount}
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={(amount / aiRecommendations.budgetOptimization.recommendedBudget) * 100} 
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                            ))}
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Smart Savings
                            </Typography>
                            <List dense>
                              {aiRecommendations.budgetOptimization.savingOpportunities.slice(0, 3).map((tip, index) => (
                                <ListItem key={index} sx={{ px: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 32 }}>
                                    <Lightbulb color="primary" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={tip} 
                                    primaryTypographyProps={{ variant: 'body2' }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </motion.div>
            )}
          </Grid>

          {/* Learning Insights Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* User Profile Card */}
              {userProfile && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School />
                    Learning Profile
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Personalization Level
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={userProfile.confidenceScore * 100} 
                      sx={{ mt: 1, mb: 1 }}
                    />
                    <Typography variant="caption">
                      {(userProfile.confidenceScore * 100).toFixed(0)}% - {
                        userProfile.confidenceScore > 0.8 ? 'Highly Personalized' :
                        userProfile.confidenceScore > 0.6 ? 'Well Personalized' :
                        userProfile.confidenceScore > 0.4 ? 'Moderately Personalized' :
                        'Learning Your Preferences'
                      }
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Top Interests
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {userProfile.preferences.interests.slice(0, 4).map((interest) => (
                        <Chip key={interest} label={interest} size="small" />
                      ))}
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Update />}
                    onClick={generatePersonalizedRecommendations}
                    disabled={isLearning}
                  >
                    {isLearning ? 'Learning...' : 'Update Recommendations'}
                  </Button>
                </Paper>
              )}

              {/* Learning Insights */}
              {learningInsights.length > 0 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Psychology />
                    AI Insights
                  </Typography>
                  <Stack spacing={2}>
                    {learningInsights.map((insight, index) => (
                      <Card key={index} variant="outlined">
                        <CardContent sx={{ pb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {insight.type === 'improvement' && <TrendingUp fontSize="small" color="primary" />}
                            {insight.type === 'pattern' && <Analytics fontSize="small" color="secondary" />}
                            {insight.type === 'trend' && <Timeline fontSize="small" color="success" />}
                            <Typography variant="subtitle2">
                              {insight.title}
                            </Typography>
                            <Chip 
                              label={`${(insight.confidence * 100).toFixed(0)}%`} 
                              size="small" 
                              color="primary"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {insight.description}
                          </Typography>
                          
                          {insight.suggestions && (
                            <Accordion sx={{ boxShadow: 0, border: 1, borderColor: 'divider' }}>
                              <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="caption">
                                  View Suggestions ({insight.suggestions.length})
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <List dense>
                                  {insight.suggestions.map((suggestion, i) => (
                                    <ListItem key={i} sx={{ px: 0 }}>
                                      <ListItemIcon sx={{ minWidth: 24 }}>
                                        <Star fontSize="small" color="primary" />
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary={suggestion}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </AccordionDetails>
                            </Accordion>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Feedback Modal */}
        <Dialog 
          open={feedbackModal.open} 
          onClose={() => setFeedbackModal({ ...feedbackModal, open: false })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Provide Feedback
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  How would you rate this recommendation?
                </Typography>
                <Rating size="large" />
              </Box>
              
              <TextField
                multiline
                rows={3}
                label="Comments (optional)"
                placeholder="Tell us what you liked or didn't like about this recommendation..."
                fullWidth
              />
              
              <Box>
                <Typography variant="body2" gutterBottom>
                  What would you like to do with this recommendation?
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" color="success">
                    Accept
                  </Button>
                  <Button variant="outlined" color="error">
                    Reject
                  </Button>
                  <Button variant="outlined">
                    Modify
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFeedbackModal({ ...feedbackModal, open: false })}>
              Cancel
            </Button>
            <Button variant="contained" onClick={() => handleFeedback({
              rating: 4, // Would get from form
              action: 'accepted'
            })}>
              Submit Feedback
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button for Quick Feedback */}
        <Fab
          color="primary"
          aria-label="feedback"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000
          }}
          onClick={() => setFeedbackModal({
            recommendationId: 'general',
            recommendationType: 'destination',
            open: true
          })}
        >
          <Feedback />
        </Fab>
      </Box>
    </UserBehaviorTracker>
  );
};

export default AITripPlannerWithLearning;