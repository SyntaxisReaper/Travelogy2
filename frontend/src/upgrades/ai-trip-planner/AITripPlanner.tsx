import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Slider,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Alert,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  AutoAwesome,
  TravelExplore,
  WbSunny as Weather,
  AttachMoney,
  Schedule,
  LocationOn,
  Star,
  ExpandMore,
  Flight,
  Hotel,
  Restaurant,
  LocalActivity,
  Park as Eco,
  FamilyRestroom as Family,
  BeachAccess as Beach,
  Terrain as Mountain,
  LocationCity,
  NaturePeople as Nature,
  Museum,
  SportsEsports as Sports,
  Nightlife,
  ShoppingCart as Shopping
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface TripPreferences {
  budget: [number, number];
  duration: number;
  travelStyle: string;
  interests: string[];
  groupSize: number;
  season: string;
  accommodation: string;
  transportation: string;
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
  coordinates: [number, number];
  image: string;
  weather: {
    temperature: number;
    condition: string;
    humidity: number;
  };
  activities: Activity[];
}

interface Activity {
  name: string;
  type: string;
  cost: number;
  duration: string;
  rating: number;
}

interface AIRecommendation {
  confidence: number;
  reason: string;
  destinations: Destination[];
  budgetBreakdown: {
    accommodation: number;
    food: number;
    transportation: number;
    activities: number;
    total: number;
  };
  itinerary: ItineraryDay[];
  tips: string[];
}

interface ItineraryDay {
  day: number;
  title: string;
  activities: Activity[];
  estimatedCost: number;
}

interface AITripPlannerProps {
  onPlanGenerated?: (plan: AIRecommendation) => void;
  userPreferences?: Partial<TripPreferences>;
  previousTrips?: any[];
}

// Sample data
const TRAVEL_STYLES = [
  { value: 'budget', label: '💰 Budget Traveler', icon: '🎒' },
  { value: 'comfort', label: '🏨 Comfort Seeker', icon: '🛏️' },
  { value: 'luxury', label: '✨ Luxury Explorer', icon: '🥂' },
  { value: 'adventure', label: '⛰️ Adventure Seeker', icon: '🧗' },
  { value: 'cultural', label: '🏛️ Culture Enthusiast', icon: '🎭' },
  { value: 'relaxation', label: '🏖️ Relaxation Focused', icon: '🧘' }
];

const INTERESTS = [
  { value: 'history', label: 'History & Museums', icon: <Museum /> },
  { value: 'nature', label: 'Nature & Wildlife', icon: <Nature /> },
  { value: 'food', label: 'Food & Cuisine', icon: <Restaurant /> },
  { value: 'adventure', label: 'Adventure Sports', icon: <Sports /> },
  { value: 'culture', label: 'Local Culture', icon: <LocationCity /> },
  { value: 'beaches', label: 'Beaches & Coast', icon: <Beach /> },
  { value: 'mountains', label: 'Mountains & Hiking', icon: <Mountain /> },
  { value: 'nightlife', label: 'Nightlife & Entertainment', icon: <Nightlife /> },
  { value: 'shopping', label: 'Shopping & Markets', icon: <Shopping /> },
  { value: 'family', label: 'Family Activities', icon: <Family /> }
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
    interests: ['culture', 'history', 'nature'],
    coordinates: [35.0116, 135.7681],
    image: '/images/kyoto.jpg',
    weather: { temperature: 18, condition: 'Partly Cloudy', humidity: 65 },
    activities: [
      { name: 'Fushimi Inari Shrine', type: 'cultural', cost: 0, duration: '3 hours', rating: 4.9 },
      { name: 'Bamboo Grove Walk', type: 'nature', cost: 0, duration: '1 hour', rating: 4.7 },
      { name: 'Tea Ceremony Experience', type: 'cultural', cost: 45, duration: '2 hours', rating: 4.6 }
    ]
  },
  {
    id: 'santorini',
    name: 'Santorini',
    country: 'Greece',
    description: 'Stunning sunsets, white-washed buildings, and crystal-clear waters',
    rating: 4.7,
    estimatedCost: 180,
    bestMonths: ['April', 'May', 'June', 'September', 'October'],
    interests: ['beaches', 'culture', 'food'],
    coordinates: [36.3932, 25.4615],
    image: '/images/santorini.jpg',
    weather: { temperature: 24, condition: 'Sunny', humidity: 60 },
    activities: [
      { name: 'Sunset at Oia', type: 'sightseeing', cost: 0, duration: '2 hours', rating: 4.9 },
      { name: 'Wine Tasting Tour', type: 'food', cost: 65, duration: '4 hours', rating: 4.5 },
      { name: 'Red Beach Visit', type: 'beaches', cost: 0, duration: '3 hours', rating: 4.4 }
    ]
  },
  {
    id: 'patagonia',
    name: 'Patagonia',
    country: 'Chile/Argentina',
    description: 'Breathtaking landscapes, glaciers, and world-class hiking',
    rating: 4.9,
    estimatedCost: 150,
    bestMonths: ['November', 'December', 'January', 'February', 'March'],
    interests: ['adventure', 'nature', 'mountains'],
    coordinates: [-50.0, -73.0],
    image: '/images/patagonia.jpg',
    weather: { temperature: 12, condition: 'Windy', humidity: 55 },
    activities: [
      { name: 'Torres del Paine Trek', type: 'adventure', cost: 80, duration: '8 hours', rating: 5.0 },
      { name: 'Perito Moreno Glacier', type: 'nature', cost: 50, duration: '6 hours', rating: 4.8 },
      { name: 'Horseback Riding', type: 'adventure', cost: 75, duration: '4 hours', rating: 4.6 }
    ]
  }
];

const AITripPlanner: React.FC<AITripPlannerProps> = ({
  onPlanGenerated,
  userPreferences = {},
  previousTrips = []
}) => {
  // State
  const [preferences, setPreferences] = useState<TripPreferences>({
    budget: [1000, 3000],
    duration: 7,
    travelStyle: 'comfort',
    interests: ['culture', 'food'],
    groupSize: 2,
    season: 'spring',
    accommodation: 'hotel',
    transportation: 'flight',
    ...userPreferences
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Analyzing preferences...');

  // AI Generation Steps
  const generationSteps = [
    'Analyzing your preferences...',
    'Processing weather data...',
    'Calculating budget optimization...',
    'Finding matching destinations...',
    'Creating personalized itinerary...',
    'Applying machine learning insights...',
    'Finalizing recommendations...'
  ];

  // Simulate AI processing
  const generateAIRecommendation = useCallback(async () => {
    setIsGenerating(true);
    setLoadingProgress(0);
    setRecommendation(null);

    // Simulate AI processing with realistic steps
    for (let i = 0; i < generationSteps.length; i++) {
      setCurrentStep(generationSteps[i]);
      setLoadingProgress((i + 1) * (100 / generationSteps.length));
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    }

    // Generate mock AI recommendation based on preferences
    const matchingDestinations = SAMPLE_DESTINATIONS.filter(dest => {
      const interestMatch = preferences.interests.some(interest => 
        dest.interests.includes(interest)
      );
      const budgetMatch = dest.estimatedCost <= preferences.budget[1] / preferences.duration;
      return interestMatch || budgetMatch;
    }).slice(0, 3);

    const totalBudget = (preferences.budget[0] + preferences.budget[1]) / 2;
    const dailyBudget = totalBudget / preferences.duration;

    const budgetBreakdown = {
      accommodation: Math.round(totalBudget * 0.35),
      food: Math.round(totalBudget * 0.25),
      transportation: Math.round(totalBudget * 0.25),
      activities: Math.round(totalBudget * 0.15),
      total: totalBudget
    };

    // Generate itinerary
    const itinerary: ItineraryDay[] = Array.from({ length: preferences.duration }, (_, i) => ({
      day: i + 1,
      title: i === 0 ? 'Arrival & City Exploration' : 
             i === preferences.duration - 1 ? 'Final Adventures & Departure' :
             `Day ${i + 1} Adventures`,
      activities: matchingDestinations[0]?.activities.slice(0, 2) || [],
      estimatedCost: dailyBudget * (0.8 + Math.random() * 0.4)
    }));

    const aiRecommendation: AIRecommendation = {
      confidence: 87 + Math.random() * 10,
      reason: `Based on your ${preferences.travelStyle} travel style and interest in ${preferences.interests.join(', ')}, I've found destinations that perfectly match your preferences and budget.`,
      destinations: matchingDestinations,
      budgetBreakdown,
      itinerary,
      tips: [
        `Visit during ${matchingDestinations[0]?.bestMonths.join(' or ')} for optimal weather`,
        `Consider booking accommodation 2-3 months in advance for better rates`,
        `Download offline maps and translation apps before departure`,
        `Pack layers - weather can change quickly at your destination`
      ]
    };

    setRecommendation(aiRecommendation);
    setIsGenerating(false);
    onPlanGenerated?.(aiRecommendation);
  }, [preferences, onPlanGenerated]);

  // Handle preference changes
  const updatePreference = (key: keyof TripPreferences, value: any) => {
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
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoAwesome fontSize="large" />
          AI Trip Planner
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          🤖 Personalized travel recommendations powered by artificial intelligence
        </Typography>
      </Paper>

      <Grid container spacing={3}>
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
                  onChange={(_, value) => updatePreference('budget', value)}
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
                  onChange={(_, value) => updatePreference('duration', value)}
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
                      {style.icon} {style.label}
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
                {isGenerating ? 'Generating...' : 'Generate AI Plan'}
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

          <AnimatePresence>
            {recommendation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* AI Confidence & Reason */}
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    AI Confidence: {recommendation.confidence.toFixed(1)}% Match
                  </Typography>
                  <Typography variant="body2">
                    {recommendation.reason}
                  </Typography>
                </Alert>

                {/* Recommended Destinations */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    🎯 Recommended Destinations
                  </Typography>
                  <Grid container spacing={2}>
                    {recommendation.destinations.map((destination, index) => (
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
                              <Chip 
                                icon={<Weather />} 
                                label={`${destination.weather.temperature}°C`} 
                                size="small" 
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
                    {Object.entries(recommendation.budgetBreakdown).map(([category, amount]) => (
                      <Grid item xs={6} sm={2.4} key={category}>
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
                          <Star color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={tip} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!recommendation && !isGenerating && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <AutoAwesome sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Ready to Plan Your Perfect Trip?
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Adjust your preferences on the left and click "Generate AI Plan" to get personalized recommendations.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default AITripPlanner;