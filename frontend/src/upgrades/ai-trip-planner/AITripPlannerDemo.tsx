import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Stack,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Psychology,
  AutoAwesome,
  Analytics,
  School,
  TrendingUp,
  Star,
  Lightbulb,
  Timeline,
  Code,
  DataUsage,
  SmartToy,
  TravelExplore
} from '@mui/icons-material';

import AITripPlannerWithLearning from './AITripPlannerWithLearning';
import AITripPlanner from './AITripPlanner';
import { AIRecommendationEngine, WeatherService } from './index';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AITripPlannerDemo: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [useAdvancedAI, setUseAdvancedAI] = useState(true);
  const [demoUserId] = useState('demo_user_' + Math.random().toString(36).substr(2, 9));
  const [demoStats, setDemoStats] = useState({
    interactions: 0,
    profileConfidence: 30,
    recommendationsGenerated: 0
  });

  // Simulate some demo interactions
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStats(prev => ({
        interactions: Math.min(prev.interactions + Math.floor(Math.random() * 3), 50),
        profileConfidence: Math.min(prev.profileConfidence + Math.floor(Math.random() * 2), 95),
        recommendationsGenerated: prev.recommendationsGenerated
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handlePlanGenerated = (plan: any) => {
    setDemoStats(prev => ({
      ...prev,
      recommendationsGenerated: prev.recommendationsGenerated + 1
    }));
    console.log('Generated plan:', plan);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
              <SmartToy fontSize="large" />
              AI Trip Planner Demo
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, mb: 2 }}>
              🚀 Experience machine learning-powered travel recommendations that get smarter with every interaction
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip icon={<Psychology />} label="Machine Learning Engine" sx={{ color: 'white', borderColor: 'white' }} variant="outlined" />
              <Chip icon={<Analytics />} label="Behavioral Analysis" sx={{ color: 'white', borderColor: 'white' }} variant="outlined" />
              <Chip icon={<TrendingUp />} label="Real-time Learning" sx={{ color: 'white', borderColor: 'white' }} variant="outlined" />
              <Chip icon={<AutoAwesome />} label="Personalized Recommendations" sx={{ color: 'white', borderColor: 'white' }} variant="outlined" />
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Demo Statistics
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      User Interactions
                    </Typography>
                    <Typography variant="h4" sx={{ color: 'white' }}>
                      {demoStats.interactions}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Profile Confidence
                    </Typography>
                    <Typography variant="h4" sx={{ color: 'white' }}>
                      {demoStats.profileConfidence}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      AI Recommendations
                    </Typography>
                    <Typography variant="h4" sx={{ color: 'white' }}>
                      {demoStats.recommendationsGenerated}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Feature Showcase */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', border: '2px solid', borderColor: 'primary.main' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Psychology sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Machine Learning Engine
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Advanced AI that learns from user behavior, preferences, and feedback to provide increasingly accurate recommendations.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', border: '2px solid', borderColor: 'secondary.main' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Analytics sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Behavioral Tracking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Intelligent tracking of user interactions, preferences, and travel patterns to build comprehensive user profiles.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', border: '2px solid', borderColor: 'success.main' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Continuous Learning
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time model updates based on user feedback, ensuring recommendations improve with every interaction.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Features List */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome />
          AI-Powered Features
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              🧠 Learning Capabilities
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><Star color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Preference Learning" 
                  secondary="Learns from user interactions and trip history"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Analytics color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Behavioral Analysis" 
                  secondary="Tracks clicking patterns, engagement levels, and feedback"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><TrendingUp color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Collaborative Filtering" 
                  secondary="Learns from similar users' preferences and choices"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Timeline color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Pattern Recognition" 
                  secondary="Identifies seasonal trends and travel patterns"
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="secondary">
              🎯 Smart Recommendations
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><Lightbulb color="secondary" /></ListItemIcon>
                <ListItemText 
                  primary="Destination Scoring" 
                  secondary="ML-powered destination matching based on preferences"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><DataUsage color="secondary" /></ListItemIcon>
                <ListItemText 
                  primary="Budget Optimization" 
                  secondary="Smart budget allocation based on spending patterns"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><School color="secondary" /></ListItemIcon>
                <ListItemText 
                  primary="Activity Predictions" 
                  secondary="Predicts activity enjoyment with confidence scores"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><TravelExplore color="secondary" /></ListItemIcon>
                <ListItemText 
                  primary="Weather Integration" 
                  secondary="Weather-aware recommendations with seasonal optimization"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* Demo Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Demo Configuration
        </Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={useAdvancedAI}
                onChange={(e) => setUseAdvancedAI(e.target.checked)}
              />
            }
            label="Enable Machine Learning Features"
          />
          <Alert severity="info" sx={{ flex: 1 }}>
            {useAdvancedAI 
              ? "🧠 Advanced AI mode: Full machine learning with behavior tracking and personalization" 
              : "🤖 Basic mode: Standard AI trip planner without learning features"
            }
          </Alert>
        </Stack>
      </Paper>

      {/* Demo Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="AI Trip Planner Demo" />
          <Tab label="Technical Overview" />
          <Tab label="Learning Analytics" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          {/* Main Demo */}
          {useAdvancedAI ? (
            <AITripPlannerWithLearning
              userId={demoUserId}
              onPlanGenerated={handlePlanGenerated}
              userPreferences={{
                budgetRange: [1500, 4000],
                interests: ['culture', 'food', 'nature'],
                preferredTravelStyle: ['comfort']
              }}
            />
          ) : (
            <AITripPlanner
              onPlanGenerated={handlePlanGenerated}
              userPreferences={{
                budget: [1500, 4000],
                interests: ['culture', 'food', 'nature'],
                travelStyle: 'comfort'
              }}
            />
          )}
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          {/* Technical Overview */}
          <Box>
            <Typography variant="h5" gutterBottom>
              🔧 Technical Architecture
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Machine Learning Pipeline
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Feature Extraction"
                          secondary="15-dimensional user feature vectors"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Reinforcement Learning"
                          secondary="Model weights updated based on satisfaction scores"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Collaborative Filtering"
                          secondary="Cosine similarity matching with similar users"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Online Learning"
                          secondary="Real-time model updates from user feedback"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="secondary">
                      Data Sources
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="User Behavior Tracking"
                          secondary="Clicks, views, saves, bookings, ratings"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Trip History Analysis"
                          secondary="Past destinations, satisfaction scores, activities"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Weather Integration"
                          secondary="Current conditions, forecasts, historical data"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Preference Learning"
                          secondary="Implicit and explicit preference extraction"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Key Technical Features:
              </Typography>
              <Typography variant="body2">
                • <strong>Real-time Learning:</strong> Model updates with every user interaction<br/>
                • <strong>Privacy-First:</strong> All data stored locally with optional cloud sync<br/>
                • <strong>Scalable Architecture:</strong> Efficient batch processing and caching<br/>
                • <strong>Confidence Scoring:</strong> Transparent prediction confidence levels<br/>
                • <strong>A/B Testing Ready:</strong> Built-in experiment framework
              </Typography>
            </Alert>
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          {/* Learning Analytics */}
          <Box>
            <Typography variant="h5" gutterBottom>
              📊 Learning Analytics Dashboard
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Model Performance
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Prediction Accuracy
                      </Typography>
                      <Typography variant="h4" color="primary">
                        87.3%
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        User Satisfaction
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        4.6/5.0
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Learning Rate
                      </Typography>
                      <Typography variant="h4" color="secondary.main">
                        0.025
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Feature Importance
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Budget Factor (0.20)"
                          secondary="Primary decision driver"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Seasonality (0.15)"
                          secondary="Weather preferences"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Activity Intensity (0.12)"
                          secondary="Adventure vs relaxation"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Cultural Immersion (0.08)"
                          secondary="Local experiences"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Learning Insights
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <TrendingUp color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Improving Accuracy"
                          secondary="5% increase this month"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Analytics color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Pattern Recognition"
                          secondary="Seasonal trends detected"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <School color="secondary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="User Clustering"
                          secondary="7 distinct user personas"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {/* Usage Instructions */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          🚀 Try the Demo:
        </Typography>
        <Typography variant="body2">
          1. <strong>Set your preferences</strong> using the controls on the left<br/>
          2. <strong>Generate recommendations</strong> by clicking "Generate AI Plan"<br/>
          3. <strong>Interact with results</strong> - like, save, or provide feedback on recommendations<br/>
          4. <strong>Watch the learning</strong> - see how your personalization level increases with interactions<br/>
          5. <strong>Generate again</strong> - notice how recommendations become more tailored to your preferences
        </Typography>
      </Alert>
    </Container>
  );
};

export default AITripPlannerDemo;