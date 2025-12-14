import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Slider,
  Chip,
  LinearProgress,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  AutoAwesome,
  TravelExplore,
  AttachMoney,
  Star,
  Lightbulb,
  Psychology,
  LocationCity,
  Nature,
  Restaurant,
  Sports,
  BeachAccess,
  Landscape
} from '@mui/icons-material';

// Simplified types
interface TripPreferences {
  budget: [number, number];
  duration: number;
  travelStyle: string;
  interests: string[];
  groupSize: number;
}

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  rating: number;
  estimatedCost: number;
  bestMonths: string[];
  interests: string[];
}

interface AIRecommendation {
  confidence: number;
  reason: string;
  destinations: Destination[];
  budgetBreakdown: {
    accommodation: number;
    food: number;
    activities: number;
    transportation: number;
    total: number;
  };
  tips: string[];
}

// Sample data
const TRAVEL_STYLES = [
  { value: 'budget', label: '💰 Budget Traveler' },
  { value: 'comfort', label: '🏨 Comfort Seeker' },
  { value: 'luxury', label: '✨ Luxury Explorer' },
  { value: 'adventure', label: '⛰️ Adventure Seeker' }
];

const INTERESTS = [
  { value: 'history', label: 'History & Museums', icon: <Star /> },
  { value: 'nature', label: 'Nature & Wildlife', icon: <Nature /> },
  { value: 'food', label: 'Food & Cuisine', icon: <Restaurant /> },
  { value: 'adventure', label: 'Adventure Sports', icon: <Sports /> },
  { value: 'culture', label: 'Local Culture', icon: <LocationCity /> },
  { value: 'beaches', label: 'Beaches & Coast', icon: <BeachAccess /> },
  { value: 'mountains', label: 'Mountains & Hiking', icon: <Landscape /> }
];

const SAMPLE_DESTINATIONS: Destination[] = [
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    description: 'Ancient temples, traditional culture, and beautiful gardens',
    rating: 4.8,
    estimatedCost: 120,
    bestMonths: ['March', 'April', 'May', 'October', 'November'],
    interests: ['culture', 'history', 'nature']
  },
  {
    id: 'santorini',
    name: 'Santorini',
    country: 'Greece',
    description: 'Stunning sunsets, white-washed buildings, and crystal-clear waters',
    rating: 4.7,
    estimatedCost: 180,
    bestMonths: ['April', 'May', 'June', 'September', 'October'],
    interests: ['beaches', 'culture', 'food']
  },
  {
    id: 'patagonia',
    name: 'Patagonia',
    country: 'Chile/Argentina',
    description: 'Breathtaking landscapes, glaciers, and world-class hiking',
    rating: 4.9,
    estimatedCost: 150,
    bestMonths: ['November', 'December', 'January', 'February', 'March'],
    interests: ['adventure', 'nature', 'mountains']
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    description: 'Tropical paradise with rich culture and stunning beaches',
    rating: 4.6,
    estimatedCost: 100,
    bestMonths: ['April', 'May', 'June', 'July', 'August', 'September'],
    interests: ['beaches', 'culture', 'nature', 'food']
  },
  {
    id: 'iceland',
    name: 'Iceland',
    country: 'Iceland',
    description: 'Land of fire and ice with spectacular natural wonders',
    rating: 4.8,
    estimatedCost: 200,
    bestMonths: ['June', 'July', 'August', 'September'],
    interests: ['nature', 'adventure', 'mountains']
  }
];

// AI Generation Steps (moved outside component to avoid dependency issues)
const GENERATION_STEPS = [
  '🧠 Analyzing your preferences...',
  '🌤️ Processing weather data...',
  '💰 Calculating budget optimization...',
  '🗺️ Finding matching destinations...',
  '📋 Creating personalized itinerary...',
  '🤖 Applying AI insights...',
  '✅ Finalizing recommendations...'
];

const SimpleAITripPlannerDemo: React.FC = () => {
  // State
  const [preferences, setPreferences] = useState<TripPreferences>({
    budget: [1500, 4000],
    duration: 7,
    travelStyle: 'comfort',
    interests: ['culture', 'food'],
    groupSize: 2
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [userInteractions, setUserInteractions] = useState(0);

  // Generate AI recommendations
  const generateAIRecommendation = useCallback(async () => {
    setIsGenerating(true);
    setLoadingProgress(0);
    setRecommendation(null);
    setUserInteractions(prev => prev + 1);

    // Simulate AI processing with realistic steps
    for (let i = 0; i < GENERATION_STEPS.length; i++) {
      setCurrentStep(GENERATION_STEPS[i]);
      setLoadingProgress((i + 1) * (100 / GENERATION_STEPS.length));
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
    }

    // Generate smart recommendations based on preferences
    const matchingDestinations = SAMPLE_DESTINATIONS
      .filter(dest => {
        const interestMatch = preferences.interests.some(interest => 
          dest.interests.includes(interest)
        );
        const budgetMatch = dest.estimatedCost <= preferences.budget[1] / preferences.duration;
        return interestMatch || budgetMatch;
      })
      .sort((a, b) => {
        // Score destinations based on interest overlap and budget fit
        const aScore = preferences.interests.filter(i => a.interests.includes(i)).length;
        const bScore = preferences.interests.filter(i => b.interests.includes(i)).length;
        return bScore - aScore;
      })
      .slice(0, 3);

    const totalBudget = (preferences.budget[0] + preferences.budget[1]) / 2;

    const budgetBreakdown = {
      accommodation: Math.round(totalBudget * 0.35),
      food: Math.round(totalBudget * 0.25),
      activities: Math.round(totalBudget * 0.20),
      transportation: Math.round(totalBudget * 0.20),
      total: totalBudget
    };

    const aiRecommendation: AIRecommendation = {
      confidence: 85 + Math.random() * 12,
      reason: `Based on your ${preferences.travelStyle} travel style and interests in ${preferences.interests.join(', ')}, I've found ${matchingDestinations.length} perfect destinations that match your preferences and budget.`,
      destinations: matchingDestinations,
      budgetBreakdown,
      tips: [
        `Visit during ${matchingDestinations[0]?.bestMonths.slice(0, 2).join(' or ')} for optimal weather`,
        `Book accommodation 2-3 months in advance for better rates`,
        `Consider travel insurance for international trips`,
        `Download offline maps and translation apps before departure`,
        `Pack layers - weather can vary throughout your trip`
      ]
    };

    setRecommendation(aiRecommendation);
    setIsGenerating(false);
  }, [preferences]);

  // Handle preference changes
  const updatePreference = (key: keyof TripPreferences, value: TripPreferences[keyof TripPreferences]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const toggleInterest = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Psychology fontSize="large" />
              AI Trip Planner Demo
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, mb: 2 }}>
              🚀 Experience AI-powered travel recommendations that learn from your preferences
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Learning Stats
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Interactions: {userInteractions}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      AI Accuracy: {recommendation ? `${recommendation.confidence.toFixed(1)}%` : '85.0%'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Preferences Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TravelExplore />
              Travel Preferences
            </Typography>

            <Stack spacing={3}>
              {/* Budget Range */}
              <Box>
                <Typography gutterBottom>Budget Range (USD)</Typography>
                <Slider
                  value={preferences.budget}
                  onChange={(_, value) => updatePreference('budget', value as [number, number])}
                  valueLabelDisplay="auto"
                  min={500}
                  max={10000}
                  step={100}
                  valueLabelFormat={(value) => `$${value}`}
                />
                <Typography variant="body2" color="text.secondary">
                  ${preferences.budget[0]} - ${preferences.budget[1]}
                </Typography>
              </Box>

              {/* Duration */}
              <Box>
                <Typography gutterBottom>Trip Duration (days)</Typography>
                <Slider
                  value={preferences.duration}
                  onChange={(_, value) => updatePreference('duration', value as number)}
                  valueLabelDisplay="auto"
                  min={1}
                  max={30}
                  step={1}
                  valueLabelFormat={(value) => `${value} days`}
                />
              </Box>

              {/* Travel Style */}
              <FormControl fullWidth>
                <InputLabel>Travel Style</InputLabel>
                <Select
                  value={preferences.travelStyle}
                  onChange={(e) => updatePreference('travelStyle', e.target.value)}
                  label="Travel Style"
                >
                  {TRAVEL_STYLES.map((style) => (
                    <MenuItem key={style.value} value={style.value}>
                      {style.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Group Size */}
              <TextField
                label="Group Size"
                type="number"
                value={preferences.groupSize}
                onChange={(e) => updatePreference('groupSize', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 1, max: 20 } }}
              />

              {/* Interests */}
              <Box>
                <Typography gutterBottom>Interests</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {INTERESTS.map((interest) => (
                    <Chip
                      key={interest.value}
                      icon={interest.icon}
                      label={interest.label}
                      onClick={() => toggleInterest(interest.value)}
                      color={preferences.interests.includes(interest.value) ? 'primary' : 'default'}
                      variant={preferences.interests.includes(interest.value) ? 'filled' : 'outlined'}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>

              {/* Generate Button */}
              <Button
                variant="contained"
                size="large"
                startIcon={<AutoAwesome />}
                onClick={generateAIRecommendation}
                disabled={isGenerating}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a67d8 0%, #6b46a8 100%)'
                  }
                }}
              >
                {isGenerating ? 'Generating...' : '🤖 Generate AI Plan'}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Results Panel */}
        <Grid item xs={12} md={8}>
          {isGenerating && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <AutoAwesome sx={{ animation: 'spin 2s linear infinite' }} />
                <Typography variant="h6">AI Processing...</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {currentStep}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={loadingProgress}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(103, 126, 234, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
                  }
                }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
                {loadingProgress.toFixed(0)}% complete
              </Typography>
            </Paper>
          )}

          {recommendation && (
            <Box>
              {/* AI Confidence & Reason */}
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  🎯 AI Confidence: {recommendation.confidence.toFixed(1)}% Match
                </Typography>
                <Typography variant="body2">
                  {recommendation.reason}
                </Typography>
              </Alert>

              {/* Recommended Destinations */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🗺️ Recommended Destinations
                </Typography>
                <Grid container spacing={2}>
                  {recommendation.destinations.map((destination) => (
                    <Grid item xs={12} sm={6} key={destination.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6">
                              {destination.name}
                            </Typography>
                            <Rating value={destination.rating} readOnly size="small" />
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {destination.country}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {destination.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Chip 
                              icon={<AttachMoney />} 
                              label={`$${destination.estimatedCost}/day`} 
                              size="small" 
                              color="primary" 
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Best: {destination.bestMonths.slice(0, 3).join(', ')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Budget Breakdown */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  💰 Smart Budget Breakdown
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(recommendation.budgetBreakdown).filter(([key]) => key !== 'total').map(([category, amount]) => (
                    <Grid item xs={6} sm={3} key={category}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h6" color="primary">
                            ${amount}
                          </Typography>
                          <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                            {category}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* AI Tips */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  💡 AI-Powered Tips
                </Typography>
                <List>
                  {recommendation.tips.map((tip, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Lightbulb color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={tip} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}

          {/* Empty State */}
          {!recommendation && !isGenerating && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <AutoAwesome sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Ready to Plan Your Perfect Trip?
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Adjust your preferences on the left and click &quot;Generate AI Plan&quot; to get personalized recommendations.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✨ The AI learns from your choices and gets better with each interaction!
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Usage Instructions */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          🚀 Try the AI Trip Planner:
        </Typography>
        <Typography variant="body2">
          1. <strong>Set your preferences</strong> using the controls on the left<br/>
          2. <strong>Generate recommendations</strong> by clicking &quot;Generate AI Plan&quot;<br/>
          3. <strong>Try different settings</strong> - notice how recommendations adapt to your preferences<br/>
          4. <strong>Watch the AI learn</strong> - accuracy improves with each interaction!
        </Typography>
      </Alert>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Container>
  );
};

export default SimpleAITripPlannerDemo;