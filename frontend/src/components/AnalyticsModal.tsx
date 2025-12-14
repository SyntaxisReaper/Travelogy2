import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Box, 
  Grid, 
  Typography, 
  IconButton,
  Chip
} from '@mui/material';
import { Close, TrendingUp, Speed, NaturePeople } from '@mui/icons-material';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import HolographicCard from './HolographicCard';
import NeonButton from './NeonButton';
import { colors } from '../styles/techTheme';

interface AnalyticsModalProps {
  open: boolean;
  onClose: () => void;
}

// Mock analytics data
const weeklyData = [
  { day: 'Mon', trips: 3, distance: 12.5, co2: 2.3 },
  { day: 'Tue', trips: 5, distance: 18.2, co2: 3.1 },
  { day: 'Wed', trips: 2, distance: 8.7, co2: 1.8 },
  { day: 'Thu', trips: 4, distance: 15.3, co2: 2.9 },
  { day: 'Fri', trips: 6, distance: 22.1, co2: 4.2 },
  { day: 'Sat', trips: 3, distance: 9.8, co2: 1.9 },
  { day: 'Sun', trips: 1, distance: 5.2, co2: 1.1 },
];

const insights = [
  {
    icon: <TrendingUp />,
    title: 'Most Active Day',
    value: 'Friday',
    trend: '+15% vs last week',
    color: colors.neonGreen,
  },
  {
    icon: <Speed />,
    title: 'Average Speed',
    value: '24.5 km/h',
    trend: '+2.3 km/h improvement',
    color: colors.neonBlue,
  },
  {
    icon: <NaturePeople />,
    title: 'CO₂ Efficiency',
    value: '87% Green',
    trend: '13% better than average',
    color: colors.neonOrange,
  },
];

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          background: `linear-gradient(135deg, ${colors.deepSpace} 0%, ${colors.darkBg} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${colors.neonCyan}40`,
          borderRadius: '16px',
          maxHeight: '95vh',
          height: 'auto',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${colors.darkCard} 0%, ${colors.carbonFiber} 100%)`,
          borderBottom: `1px solid ${colors.neonCyan}40`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            background: `linear-gradient(45deg, ${colors.neonCyan}, ${colors.neonPink})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: '"Orbitron", monospace',
          }}
        >
          🔬 Quantum Analytics Lab
        </Typography>
        <IconButton onClick={onClose} sx={{ color: colors.neonPink }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        p: 4, 
        overflowY: 'auto',
        flex: 1,
        minHeight: 0,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Weekly Trend Chart */}
          <HolographicCard
            glowColor={colors.neonCyan}
            intensity="high"
            sx={{ mb: 4, p: 3 }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ color: colors.neonCyan, mb: 3 }}>
                📊 Weekly Travel Patterns
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.neonCyan} opacity={0.3} />
                  <XAxis dataKey="day" stroke={colors.neonCyan} />
                  <YAxis stroke={colors.neonCyan} />
                  <Tooltip
                    contentStyle={{
                      background: colors.darkCard,
                      border: `1px solid ${colors.neonCyan}`,
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="trips"
                    stroke={colors.neonCyan}
                    strokeWidth={3}
                    dot={{ fill: colors.neonCyan, strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: colors.neonCyan, strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="distance"
                    stroke={colors.neonPink}
                    strokeWidth={3}
                    dot={{ fill: colors.neonPink, strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: colors.neonPink, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </HolographicCard>

          {/* Insights Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {insights.map((insight, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <HolographicCard
                    glowColor={insight.color}
                    intensity="medium"
                    sx={{ p: 3, textAlign: 'center', height: '180px' }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <Box
                        sx={{
                          color: insight.color,
                          mb: 2,
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        {insight.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom sx={{ color: insight.color }}>
                        {insight.title}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          color: insight.color,
                          mb: 1,
                          textShadow: `0 0 10px ${insight.color}`,
                        }}
                      >
                        {insight.value}
                      </Typography>
                      <Chip
                        label={insight.trend}
                        size="small"
                        sx={{
                          color: colors.neonGreen,
                          border: `1px solid ${colors.neonGreen}`,
                          backgroundColor: 'transparent',
                        }}
                      />
                    </Box>
                  </HolographicCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* AI Predictions */}
          <HolographicCard
            glowColor={colors.neonPurple}
            intensity="high"
            sx={{ p: 3 }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ color: colors.neonPurple, mb: 3 }}>
                🤖 AI Predictions & Recommendations
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      border: `1px solid ${colors.neonPurple}40`,
                      borderRadius: 2,
                      background: `${colors.darkCard}40`,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: colors.neonGreen, mb: 1 }}>
                      💡 Next Week Forecast
                    </Typography>
                    <Typography variant="body2">
                      • Expected 15% increase in walking trips
                    </Typography>
                    <Typography variant="body2">
                      • Optimal cycling weather on Tuesday & Thursday
                    </Typography>
                    <Typography variant="body2">
                      • Recommended: Take Route A to save 12 minutes
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      border: `1px solid ${colors.neonOrange}40`,
                      borderRadius: 2,
                      background: `${colors.darkCard}40`,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: colors.neonOrange, mb: 1 }}>
                      🎯 Optimization Goals
                    </Typography>
                    <Typography variant="body2">
                      • Increase sustainable transport by 20%
                    </Typography>
                    <Typography variant="body2">
                      • Reduce average trip time by 8%
                    </Typography>
                    <Typography variant="body2">
                      • Achievement unlock: &quot;Green Warrior&quot; in 3 days
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </HolographicCard>
        </motion.div>
      </DialogContent>

      <DialogActions
        sx={{
          background: `linear-gradient(135deg, ${colors.darkCard} 0%, ${colors.carbonFiber} 100%)`,
          borderTop: `1px solid ${colors.neonCyan}40`,
          p: 3,
          gap: 2,
        }}
      >
        <NeonButton glowColor={colors.neonGreen} onClick={onClose}>
          📈 Export Report
        </NeonButton>
        <NeonButton glowColor={colors.neonBlue} onClick={onClose}>
          🔄 Sync Data
        </NeonButton>
        <NeonButton glowColor={colors.neonPink} onClick={onClose}>
          ✨ Close Lab
        </NeonButton>
      </DialogActions>
    </Dialog>
  );
};

export default AnalyticsModal;