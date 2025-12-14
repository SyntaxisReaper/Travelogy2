import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  Nature,
  Speed,
  Schedule,
  LocationOn,
  Warning,
  CheckCircle,
  Lightbulb,
  DirectionsBus,
  DirectionsWalk,
  DriveEta,
  PedalBike,
  Flight,
  Train,
  Refresh,
  Map as MapIcon,
  Analytics,
  Settings,
  Share,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TravelInsightsProps {
  userId?: string;
  onNavigate?: (view: string) => void;
}

interface Insight {
  id: string;
  type: 'efficiency' | 'sustainability' | 'cost' | 'time' | 'safety' | 'recommendation';
  title: string;
  description: string;
  value?: number;
  unit?: string;
  confidence: number;
  actionable: boolean;
  impact: 'low' | 'medium' | 'high';
  data?: any;
}

interface TravelPattern {
  route: string;
  frequency: number;
  mode: string;
  efficiency: number;
  co2_saved: number;
  time_optimal: boolean;
}

const TravelInsights: React.FC<TravelInsightsProps> = ({ userId, onNavigate }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [patterns, setPatterns] = useState<TravelPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [travelData, setTravelData] = useState<any[]>([]);
  const [modeDistribution, setModeDistribution] = useState<any[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    loadInsights();
    loadTravelData();
  }, [userId]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      // Simulate AI API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockInsights: Insight[] = [
        {
          id: '1',
          type: 'efficiency',
          title: '🚶‍♀️ Walking Opportunities',
          description: 'You could walk instead of driving for 23% of your trips under 2km, saving 45 minutes in parking time daily.',
          value: 23,
          unit: '%',
          confidence: 0.89,
          actionable: true,
          impact: 'medium',
          data: { trips_walkable: 12, time_saved: 45, co2_reduction: 2.3 }
        },
        {
          id: '2',
          type: 'sustainability',
          title: '🌱 Carbon Footprint Reduction',
          description: 'Switching to public transport for long commutes could reduce your carbon footprint by 67% this month.',
          value: 67,
          unit: '%',
          confidence: 0.92,
          actionable: true,
          impact: 'high',
          data: { co2_current: 45.2, co2_potential: 14.8, routes: ['Home-Office', 'Office-Mall'] }
        },
        {
          id: '3',
          type: 'cost',
          title: '💰 Cost Optimization',
          description: 'Your current travel expenses could be reduced by $127/month through route optimization and mode switching.',
          value: 127,
          unit: '$',
          confidence: 0.84,
          actionable: true,
          impact: 'high',
          data: { current_cost: 340, optimized_cost: 213, savings_breakdown: { fuel: 89, parking: 25, public_transport: 13 } }
        },
        {
          id: '4',
          type: 'time',
          title: '⏰ Peak Hour Avoidance',
          description: 'Adjusting departure times by 15-30 minutes could save you 23 minutes daily in traffic.',
          value: 23,
          unit: 'min',
          confidence: 0.76,
          actionable: true,
          impact: 'medium',
          data: { current_travel_time: 45, optimized_time: 22, best_departure_times: ['8:15-8:30', '17:45-18:00'] }
        },
        {
          id: '5',
          type: 'safety',
          title: '🛡️ Safety Score Analysis',
          description: 'Your current routes have a safety score of 8.4/10. Consider alternative routes for 2 high-risk segments.',
          value: 8.4,
          unit: '/10',
          confidence: 0.91,
          actionable: true,
          impact: 'medium',
          data: { risk_segments: ['Downtown Bridge', 'Industrial Area'], safer_alternatives: true }
        },
        {
          id: '6',
          type: 'recommendation',
          title: '🚴‍♂️ Bike-Friendly Routes',
          description: 'New bike lanes on Market Street make cycling 34% faster for your regular office commute.',
          value: 34,
          unit: '% faster',
          confidence: 0.88,
          actionable: true,
          impact: 'medium',
          data: { bike_lanes: ['Market St', 'River Trail'], weather_suitable: 0.72 }
        }
      ];

      const mockPatterns: TravelPattern[] = [
        { route: 'Home → Office', frequency: 10, mode: 'car', efficiency: 0.74, co2_saved: 0, time_optimal: false },
        { route: 'Office → Grocery', frequency: 5, mode: 'walking', efficiency: 0.95, co2_saved: 3.2, time_optimal: true },
        { route: 'Home → Mall', frequency: 3, mode: 'public_transport', efficiency: 0.82, co2_saved: 5.1, time_optimal: true },
        { route: 'Office → Restaurant', frequency: 8, mode: 'cycling', efficiency: 0.91, co2_saved: 2.8, time_optimal: true },
      ];

      setInsights(mockInsights);
      setPatterns(mockPatterns);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTravelData = () => {
    // Mock travel data for charts
    const data = [
      { month: 'Jan', efficiency: 72, sustainability: 65, cost: 340, co2: 45 },
      { month: 'Feb', efficiency: 75, sustainability: 68, cost: 325, co2: 42 },
      { month: 'Mar', efficiency: 79, sustainability: 72, cost: 310, co2: 38 },
      { month: 'Apr', efficiency: 82, sustainability: 76, cost: 295, co2: 35 },
      { month: 'May', efficiency: 85, sustainability: 81, cost: 280, co2: 31 },
      { month: 'Jun', efficiency: 88, sustainability: 85, cost: 265, co2: 28 },
    ];

    const modes = [
      { name: 'Walking', value: 35, color: '#4CAF50' },
      { name: 'Cycling', value: 25, color: '#2196F3' },
      { name: 'Public Transport', value: 20, color: '#FF9800' },
      { name: 'Car', value: 20, color: '#F44336' },
    ];

    setTravelData(data);
    setModeDistribution(modes);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      await loadInsights();
    } finally {
      setAnalyzing(false);
    }
  };

  const getInsightIcon = (type: string) => {
    const iconMap = {
      efficiency: <Speed color="primary" />,
      sustainability: <Nature color="success" />,
      cost: <TrendingUp color="warning" />,
      time: <Schedule color="info" />,
      safety: <Warning color="error" />,
      recommendation: <Lightbulb color="secondary" />,
    };
    return iconMap[type as keyof typeof iconMap] || <Psychology />;
  };

  const getImpactColor = (impact: string) => {
    return {
      low: 'default',
      medium: 'warning',
      high: 'error',
    }[impact] as any;
  };

  const getModeIcon = (mode: string) => {
    const icons = {
      walking: <DirectionsWalk />,
      cycling: <PedalBike />,
      public_transport: <DirectionsBus />,
      car: <DriveEta />,
      flight: <Flight />,
      train: <Train />,
    };
    return icons[mode as keyof typeof icons] || <LocationOn />;
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          🧠 Analyzing your travel patterns...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Our AI is processing your data to generate personalized insights
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          🧠 AI Travel Insights
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
          </Button>
          <Button
            variant="contained"
            startIcon={<MapIcon />}
            onClick={() => onNavigate?.('maps')}
          >
            View on Map
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Efficiency Score', value: '85%', color: 'primary.main', icon: <Analytics /> },
          { label: 'CO₂ Saved', value: '2.3kg', color: 'success.main', icon: <Nature /> },
          { label: 'Monthly Savings', value: '$127', color: 'warning.main', icon: <TrendingUp /> },
          { label: 'Time Optimized', value: '23min', color: 'info.main', icon: <Schedule /> },
        ].map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: stat.color, mx: 'auto', mb: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Insights List */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '600px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Psychology color="primary" />
              Personalized Insights
            </Typography>
            
            <AnimatePresence>
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    sx={{ 
                      mb: 2, 
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setSelectedInsight(insight)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ flexShrink: 0, mt: 0.5 }}>
                          {getInsightIcon(insight.type)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {insight.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {insight.description}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                size="small"
                                label={`${Math.round(insight.confidence * 100)}% confidence`}
                                color="primary"
                                variant="outlined"
                              />
                              <Chip 
                                size="small"
                                label={`${insight.impact} impact`}
                                color={getImpactColor(insight.impact)}
                                variant="outlined"
                              />
                              {insight.actionable && (
                                <Chip 
                                  size="small"
                                  label="Actionable"
                                  color="success"
                                  variant="outlined"
                                  icon={<CheckCircle />}
                                />
                              )}
                            </Box>
                            {insight.value && (
                              <Typography variant="h6" color="primary.main">
                                {insight.value}{insight.unit}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </Paper>
        </Grid>

        {/* Charts and Patterns */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            {/* Travel Trends */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, height: '280px' }}>
                <Typography variant="h6" gutterBottom>
                  📈 Travel Efficiency Trends
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={travelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="efficiency" stroke="#2196F3" strokeWidth={3} />
                    <Line type="monotone" dataKey="sustainability" stroke="#4CAF50" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Transport Mode Distribution */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, height: '280px' }}>
                <Typography variant="h6" gutterBottom>
                  🚶‍♀️ Transport Mode Split
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={modeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}%`}
                    >
                      {modeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Travel Patterns */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapIcon color="primary" />
              Frequent Travel Patterns
            </Typography>
            <Grid container spacing={2}>
              {patterns.map((pattern, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {getModeIcon(pattern.mode)}
                        <Typography variant="subtitle2">
                          {pattern.route}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {pattern.frequency}x per week
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={pattern.efficiency * 100}
                        sx={{ mb: 1 }}
                        color={pattern.efficiency > 0.8 ? 'success' : pattern.efficiency > 0.6 ? 'warning' : 'error'}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption">
                          {Math.round(pattern.efficiency * 100)}% efficient
                        </Typography>
                        {pattern.time_optimal && (
                          <CheckCircle color="success" fontSize="small" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Insight Detail Dialog */}
      <Dialog 
        open={!!selectedInsight} 
        onClose={() => setSelectedInsight(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedInsight && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getInsightIcon(selectedInsight.type)}
              {selectedInsight.title}
            </DialogTitle>
            <DialogContent>
              <Typography paragraph>
                {selectedInsight.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                📊 Detailed Analysis
              </Typography>
              
              {selectedInsight.data && (
                <Box sx={{ mt: 2 }}>
                  {Object.entries(selectedInsight.data).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                      </Typography>
                      <Typography variant="body2">
                        {Array.isArray(value) ? value.join(', ') : 
                         typeof value === 'number' ? value.toFixed(1) : 
                         String(value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>AI Confidence:</strong> {Math.round(selectedInsight.confidence * 100)}%
                </Typography>
                <Typography variant="body2">
                  This insight is based on your travel patterns, real-time data, and machine learning analysis.
                </Typography>
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedInsight(null)}>
                Close
              </Button>
              {selectedInsight.actionable && (
                <>
                  <Button startIcon={<Share />}>
                    Share Insight
                  </Button>
                  <Button variant="contained" startIcon={<CheckCircle />}>
                    Apply Recommendation
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TravelInsights;