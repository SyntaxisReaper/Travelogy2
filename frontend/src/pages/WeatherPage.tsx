import React, { useEffect, useMemo, useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Chip, List, ListItem, ListItemIcon, ListItemText, Alert } from '@mui/material';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Cloud, LocationOn, AutoAwesome, Lightbulb, BeachAccess, Landscape, Restaurant, LocalActivity, Backpack, Umbrella, WbSunny, AcUnit } from '@mui/icons-material';
import { travelColors } from '../styles/travelTheme';
import TravelCard from '../components/TravelCard';
import TravelText from '../components/TravelText';
import AdventureButton from '../components/AdventureButton';
import GlobeMap from '../components/maps/GlobeMap';
import LeafletMap from '../components/maps/LeafletMap';
import WeatherMapModal from '../components/maps/WeatherMapModal';
import MapToolbar from '../components/maps/MapToolbar';
import PlaceSearch, { PlaceSuggestion } from '../components/maps/PlaceSearch';
import { fetchWeather, WeatherData, fetchAirQuality, fetchForecast, AirQualityData, ForecastPoint, inferSeason, fetchRainNearby, RainPoint, generateWeatherInsights, generateHealthInsights, recommendPlaces } from '../services/weather';

const WeatherPage: React.FC = () => {
  const [place, setPlace] = useState<PlaceSuggestion | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aq, setAQ] = useState<AirQualityData | null>(null);
  const [fc, setFC] = useState<ForecastPoint[] | null>(null);
  const [rains, setRains] = useState<RainPoint[] | null>(null);
  const [showRadar, setShowRadar] = useState<boolean>(!!process.env.REACT_APP_OWM_API_KEY);
  const [maximized, setMaximized] = useState<boolean>(false);
  const [geminiText, setGeminiText] = useState<string>('');
  const [geminiLoading, setGeminiLoading] = useState<boolean>(false);
  const [aiRecommendations, setAIRecommendations] = useState<{
    placesToVisit: Array<{ name: string; icon: string; reason: string }>;
    whatToBring: Array<{ item: string; priority: string; reason: string }>;
    activities: string[];
    tips: string[];
  } | null>(null);
  const [aiLoading, setAILoading] = useState<boolean>(false);
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
  const hasMapbox = !!mapboxToken && mapboxToken.startsWith('pk.');
  const [provider, setProvider] = useState<'mapbox' | 'leaflet' | 'both'>(() => (hasMapbox ? 'mapbox' : 'leaflet'));
  const [mapboxStyle, setMapboxStyle] = useState<'dark' | 'streets' | 'satellite'>('dark');
  const [leafletStyle, setLeafletStyle] = useState<'dark' | 'osm' | 'topo'>('dark');

  useEffect(() => {
    let cancelled = false;
    let timer: any;
    // Clear previous data immediately to avoid stale display for new location
    setWeather(null); setAQ(null); setFC(null); setRains(null);
    const run = async () => {
      if (!place) return;
      const [w, air, fore, rainpts] = await Promise.all([
        fetchWeather(place.latitude, place.longitude),
        fetchAirQuality(place.latitude, place.longitude),
        fetchForecast(place.latitude, place.longitude),
        fetchRainNearby(place.latitude, place.longitude),
      ]);
      if (!cancelled) { setWeather(w); setAQ(air); setFC(fore); setRains(rainpts); }
    };
    run();
    // Live updates every 60 seconds
    if (place) {
      timer = setInterval(run, 60000);
    }
    return () => { cancelled = true; if (timer) clearInterval(timer); };
  }, [place]);

  const mapLabel = useMemo(() => {
    if (place?.city) return `${place.city}${place.country ? ', ' + place.country : ''}`;
    if (place?.name) return place.name;
    return undefined;
  }, [place]);

  // Generate AI recommendations based on weather
  const generateAIRecommendations = async () => {
    if (!weather || !place) return;
    
    setAILoading(true);
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const temp = weather.tempC || 20;
      const isRainy = weather.description?.toLowerCase().includes('rain') || false;
      const isCold = temp < 10;
      const isHot = temp > 30;
      const isMild = temp >= 10 && temp <= 30;
      
      const recommendations = {
        placesToVisit: [] as Array<{ name: string; icon: string; reason: string }>,
        whatToBring: [] as Array<{ item: string; priority: string; reason: string }>,
        activities: [] as string[],
        tips: [] as string[]
      };

      // Places to visit based on weather
      if (isMild && !isRainy) {
        recommendations.placesToVisit.push(
          { name: 'City Parks & Gardens', icon: 'park', reason: 'Perfect weather for outdoor exploration' },
          { name: 'Historical Districts', icon: 'museum', reason: 'Comfortable walking conditions' },
          { name: 'Outdoor Markets', icon: 'store', reason: 'Great weather for browsing local markets' }
        );
      }
      
      if (isHot) {
        recommendations.placesToVisit.push(
          { name: 'Museums & Galleries', icon: 'museum', reason: 'Air-conditioned indoor attractions' },
          { name: 'Shopping Malls', icon: 'store', reason: 'Cool indoor environments' },
          { name: 'Beaches & Water Parks', icon: 'beach', reason: 'Perfect for cooling off' }
        );
      }
      
      if (isCold) {
        recommendations.placesToVisit.push(
          { name: 'Indoor Attractions', icon: 'museum', reason: 'Stay warm while sightseeing' },
          { name: 'Cafes & Restaurants', icon: 'restaurant', reason: 'Cozy warm spaces' },
          { name: 'Thermal Baths/Spas', icon: 'spa', reason: 'Perfect for cold weather relaxation' }
        );
      }
      
      if (isRainy) {
        recommendations.placesToVisit.push(
          { name: 'Shopping Centers', icon: 'store', reason: 'Covered areas to stay dry' },
          { name: 'Museums & Art Galleries', icon: 'museum', reason: 'Perfect indoor activities' },
          { name: 'Movie Theaters', icon: 'theater', reason: 'Entertainment while staying dry' }
        );
      }
      
      // What to bring
      if (isRainy) {
        recommendations.whatToBring.push(
          { item: 'Umbrella or Rain Jacket', priority: 'essential', reason: 'Stay dry in wet conditions' },
          { item: 'Waterproof Bag', priority: 'important', reason: 'Protect electronics and documents' },
          { item: 'Extra Socks', priority: 'useful', reason: 'In case feet get wet' }
        );
      }
      
      if (isCold) {
        recommendations.whatToBring.push(
          { item: 'Warm Jacket/Coat', priority: 'essential', reason: 'Essential for comfort in cold weather' },
          { item: 'Gloves & Hat', priority: 'important', reason: 'Keep extremities warm' },
          { item: 'Thermal Layers', priority: 'useful', reason: 'Extra warmth when needed' }
        );
      }
      
      if (isHot) {
        recommendations.whatToBring.push(
          { item: 'Sunscreen & Hat', priority: 'essential', reason: 'Protect from harmful UV rays' },
          { item: 'Water Bottle', priority: 'essential', reason: 'Stay hydrated in hot weather' },
          { item: 'Light, Breathable Clothing', priority: 'important', reason: 'Stay cool and comfortable' }
        );
      }
      
      // General items
      recommendations.whatToBring.push(
        { item: 'Comfortable Walking Shoes', priority: 'essential', reason: 'Essential for any travel day' },
        { item: 'Portable Charger', priority: 'useful', reason: 'Keep devices powered for navigation and photos' }
      );
      
      // Activities based on weather
      if (isMild && !isRainy) {
        recommendations.activities.push(
          'Walking Tours', 'Outdoor Photography', 'Street Food Tasting', 'Park Visits'
        );
      } else if (isHot) {
        recommendations.activities.push(
          'Early Morning Sightseeing', 'Indoor Cultural Visits', 'Water Activities', 'Air-conditioned Shopping'
        );
      } else if (isCold) {
        recommendations.activities.push(
          'Museum Visits', 'Cozy Cafe Hopping', 'Indoor Markets', 'Thermal Bath Visits'
        );
      } else if (isRainy) {
        recommendations.activities.push(
          'Museum Tours', 'Shopping', 'Indoor Entertainment', 'Covered Market Visits'
        );
      }
      
      // Tips based on conditions
      if (isRainy) {
        recommendations.tips.push(
          'Check attraction schedules - some outdoor activities might be cancelled',
          'Plan indoor backup activities',
          'Wear quick-dry materials'
        );
      }
      
      if (isCold) {
        recommendations.tips.push(
          'Layer clothing for temperature changes',
          'Many outdoor attractions have shorter hours in cold weather',
          'Warm up in cafes between outdoor activities'
        );
      }
      
      if (isHot) {
        recommendations.tips.push(
          'Plan outdoor activities for early morning or late afternoon',
          'Take frequent shade/cooling breaks',
          'Stay well hydrated throughout the day'
        );
      }
      
      recommendations.tips.push(
        'Check local weather updates regularly',
        'Consider weather when booking outdoor activities',
        'Pack layers for temperature changes throughout the day'
      );
      
      setAIRecommendations(recommendations);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
    } finally {
      setAILoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.sky}12 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          right: '7%',
          width: '170px',
          height: '170px',
          background: `radial-gradient(circle, ${travelColors.primary.ocean}15 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '8%',
          left: '6%',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${travelColors.primary.forest}10 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
            <Cloud sx={{ fontSize: 40, color: travelColors.primary.sky, mr: 2 }} />
            <TravelText
              text="Weather Insights"
              textVariant="adventure"
              animated
              variant="h3"
            />
          </Box>
          
          <TravelCard cardVariant="ocean" cardElevation="medium" borderAccent sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <TravelText
                text="Discover Weather Anywhere"
                textVariant="gradient"
                variant="h6"
                sx={{ mb: 3 }}
              />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
                <Box sx={{ flex: 1, minWidth: 280 }}>
                  <PlaceSearch onSelect={setPlace} placeholder="Search city, place…" />
                </Box>
                <AdventureButton 
                  buttonVariant="ocean" 
                  size="small" 
                  startIcon={<LocationOn />}
                  onClick={() => {
                    if (!navigator.geolocation) return;
                    navigator.geolocation.getCurrentPosition((pos) => {
                      const { latitude, longitude } = pos.coords as GeolocationCoordinates;
                      setPlace({ name: 'Current Location', latitude, longitude } as any);
                    });
                  }}
                >
                  Use My Location
                </AdventureButton>
                <MapToolbar
                  hasMapbox={hasMapbox}
                  provider={provider}
                  onProviderChange={setProvider}
                  mapboxStyle={mapboxStyle}
                  onMapboxStyleChange={setMapboxStyle}
                  leafletStyle={leafletStyle}
                  onLeafletStyleChange={setLeafletStyle}
                  showRadar={showRadar}
                  onToggleRadar={() => setShowRadar(v => !v)}
                  onMaximize={() => setMaximized(true)}
                />
                <AdventureButton 
                  size="small" 
                  buttonVariant="sunset" 
                  disabled={!place || geminiLoading}
                  onClick={async () => {
                    if (!place) return;
                    setGeminiLoading(true);
                    try {
                      const { analyticsAPI } = await import('../services/api');
                      const result = await analyticsAPI.askGeminiWeather({
                        place: { name: place.name, city: place.city, country: place.country, lat: place.latitude, lon: place.longitude },
                        weather, aq,
                      });
                      setGeminiText(result?.insights || '');
                    } catch (e) {
                      setGeminiText('Sorry, Gemini insights are unavailable right now.');
                    } finally {
                      setGeminiLoading(false);
                    }
                  }}
                >
                  {geminiLoading ? 'Asking Gemini…' : 'Ask Gemini'}
                </AdventureButton>
                <AdventureButton 
                  size="small" 
                  buttonVariant="coral" 
                  startIcon={<AutoAwesome />}
                  disabled={!place || !weather || aiLoading}
                  onClick={generateAIRecommendations}
                >
                  {aiLoading ? 'Generating…' : 'AI Travel Plan'}
                </AdventureButton>
              </Box>
              {weather ? (
                <Box sx={{ mt: 2 }}>
                  <TravelText
                    text={mapLabel || 'Current Location'}
                    textVariant="adventure"
                    variant="h5"
                    sx={{ mb: 1 }}
                  />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: travelColors.text.secondary, 
                      mb: 2,
                      textTransform: 'capitalize'
                    }}
                  >
                    {weather.description || 'Current weather'}
                  </Typography>
                  {typeof weather.tempC === 'number' && (
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        color: travelColors.primary.sunset,
                        mb: 1
                      }}
                    >
                      {weather.tempC.toFixed(1)}°C
                    </Typography>
                  )}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: travelColors.text.secondary,
                      fontStyle: 'italic',
                      mb: 2
                    }}
                  >
                    {generateWeatherInsights(weather, aq).summary}
                  </Typography>
                  <Grid container spacing={1}>
                    {typeof weather.feelsLikeC === 'number' && (
                      <Grid item>
                        <Typography variant="caption" sx={{ color: travelColors.text.primary }}>
                          Feels: {weather.feelsLikeC.toFixed(1)}°C
                        </Typography>
                      </Grid>
                    )}
                    {typeof weather.humidity === 'number' && (
                      <Grid item>
                        <Typography variant="caption" sx={{ color: travelColors.text.primary }}>
                          Humidity: {weather.humidity}%
                        </Typography>
                      </Grid>
                    )}
                    {typeof weather.windSpeedMs === 'number' && (
                      <Grid item>
                        <Typography variant="caption" sx={{ color: travelColors.text.primary }}>
                          Wind: {(weather.windSpeedMs * 3.6).toFixed(0)} km/h
                        </Typography>
                      </Grid>
                    )}
                    {typeof weather.pressure === 'number' && (
                      <Grid item>
                        <Typography variant="caption" sx={{ color: travelColors.text.primary }}>
                          Pressure: {weather.pressure} hPa
                        </Typography>
                      </Grid>
                    )}
                    {typeof weather.clouds === 'number' && (
                      <Grid item>
                        <Typography variant="caption" sx={{ color: travelColors.text.primary }}>
                          Clouds: {weather.clouds}%
                        </Typography>
                      </Grid>
                    )}
                    {typeof weather.rain1h === 'number' && weather.rain1h > 0 && (
                      <Grid item>
                        <Typography variant="caption" sx={{ color: travelColors.text.primary }}>
                          Rain(1h): {weather.rain1h.toFixed(1)} mm
                        </Typography>
                      </Grid>
                    )}
                    {typeof weather.visibility === 'number' && (
                      <Grid item>
                        <Typography variant="caption" sx={{ color: travelColors.text.primary }}>
                          Visibility: {Math.round(weather.visibility/1000)} km
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              ) : (
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: travelColors.text.secondary,
                    textAlign: 'center',
                    py: 3,
                    fontStyle: 'italic'
                  }}
                >
                  Type to search a place. Select one to see its weather and map.
                </Typography>
              )}
            </Box>
          </TravelCard>

          {/* Insights */}
          {place && (
            <>
              <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TravelCard cardVariant="forest" cardElevation="medium" borderAccent>
                  <Box sx={{ p: 3 }}>
                    <TravelText
                      text="Air Quality"
                      textVariant="wanderlust"
                      variant="h6"
                      sx={{ mb: 2 }}
                    />
                    {aq ? (
                      <Box sx={{ color: travelColors.text.primary }}>
                        {(() => { 
                          const map: Record<number,string> = {1:'Good',2:'Fair',3:'Moderate',4:'Poor',5:'Very Poor'}; 
                          const aqiColor = aq.aqi && aq.aqi <= 2 ? travelColors.primary.forest : 
                                          aq.aqi && aq.aqi <= 3 ? travelColors.primary.sunset : 
                                          travelColors.primary.coral;
                          return (
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: aqiColor, mb: 1 }}>
                              AQI: {map[aq.aqi || 0] || 'Unknown'}{aq.aqi ? ` (${aq.aqi}/5)` : ''}
                            </Typography>
                          ); 
                        })()}
                        {aq.components?.pm2_5 !== undefined && (
                          <Typography variant="body2" sx={{ color: travelColors.text.secondary }}>
                            PM2.5: {Math.round(aq.components.pm2_5)} μg/m³
                          </Typography>
                        )}
                        {aq.components?.pm10 !== undefined && (
                          <Typography variant="body2" sx={{ color: travelColors.text.secondary }}>
                            PM10: {Math.round(aq.components.pm10)} μg/m³
                          </Typography>
                        )}
                        {aq.components?.no2 !== undefined && (
                          <Typography variant="body2" sx={{ color: travelColors.text.secondary }}>
                            NO₂: {Math.round(aq.components.no2)} μg/m³
                          </Typography>
                        )}
                        {aq.components?.o3 !== undefined && (
                          <Typography variant="body2" sx={{ color: travelColors.text.secondary }}>
                            O₃: {Math.round(aq.components.o3)} μg/m³
                          </Typography>
                        )}
                        {aq.components?.so2 !== undefined && (
                          <Typography variant="body2" sx={{ color: travelColors.text.secondary }}>
                            SO₂: {Math.round(aq.components.so2)} μg/m³
                          </Typography>
                        )}
                        {aq.components?.co !== undefined && (
                          <Typography variant="body2" sx={{ color: travelColors.text.secondary }}>
                            CO: {Math.round(aq.components.co)} μg/m³
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: travelColors.text.secondary, fontStyle: 'italic' }}>
                        Unavailable
                      </Typography>
                    )}
                  </Box>
                </TravelCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <TravelCard cardVariant="ocean" cardElevation="medium" borderAccent sx={{ height: { xs: 240, md: 280 } }}>
                  <Box sx={{ p: 3, height: '100%' }}>
                    <TravelText
                      text="Forecast (Next Hours)"
                      textVariant="gradient"
                      variant="h6"
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ height: { xs: 160, md: 200 } }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={(fc || []).slice(0, 8).map(p => ({ time: new Date(p.dt*1000).toLocaleTimeString([], { hour: '2-digit' }), temp: Math.round(p.tempC) }))}>
                          <defs>
                            <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={travelColors.primary.ocean} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={travelColors.primary.sky} stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={`${travelColors.primary.ocean}30`} />
                          <XAxis dataKey="time" stroke={travelColors.text.secondary} />
                          <YAxis stroke={travelColors.text.secondary} />
                          <Tooltip 
                            contentStyle={{ 
                              background: travelColors.backgrounds.paper, 
                              border: `1px solid ${travelColors.primary.ocean}40`, 
                              borderRadius: '8px',
                              color: travelColors.text.primary 
                            }} 
                          />
                          <Area type="monotone" dataKey="temp" stroke={travelColors.primary.ocean} fill="url(#gradTemp)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </TravelCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <TravelCard cardVariant="sunset" cardElevation="medium" borderAccent>
                  <Box sx={{ p: 3 }}>
                    <TravelText
                      text="AI Insights"
                      textVariant="adventure"
                      variant="h6"
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ color: travelColors.text.primary }}>
                      {geminiText ? (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: travelColors.text.primary }}>
                          {geminiText}
                        </Typography>
                      ) : (
                        (() => {
                          const gi = generateWeatherInsights(weather, aq);
                          return (
                            <>
                              <Typography variant="body2" sx={{ mb: 2, color: travelColors.text.primary }}>
                                {gi.summary}
                              </Typography>
                              {gi.tips.map((t, i) => (
                                <Typography key={i} variant="caption" display="block" sx={{ color: travelColors.text.secondary, mb: 0.5 }}>
                                  • {t}
                                </Typography>
                              ))}
                            </>
                          );
                        })()
                      )}
                    </Box>
                  </Box>
                </TravelCard>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TravelCard cardVariant="sunset" cardElevation="medium" borderAccent>
                  <Box sx={{ p: 3 }}>
                    <TravelText
                      text="Health & Safety"
                      textVariant="wanderlust"
                      variant="h6"
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ color: travelColors.text.primary }}>
                      {(() => {
                        const hi = generateHealthInsights(weather, aq);
                        const riskColor = hi.riskLevel === 'Low' ? travelColors.primary.forest :
                                         hi.riskLevel === 'Moderate' ? travelColors.primary.sunset :
                                         travelColors.primary.coral;
                        return (
                          <>
                            <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
                              Overall risk: <span style={{ color: riskColor }}>{hi.riskLevel}</span>
                            </Typography>
                            {hi.notes.map((n, i) => (
                              <Typography key={i} variant="body2" display="block" sx={{ color: travelColors.text.secondary, mb: 1 }}>
                                • {n}
                              </Typography>
                            ))}
                          </>
                        );
                      })()}
                    </Box>
                  </Box>
                </TravelCard>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TravelCard cardVariant="paper" cardElevation="medium" borderAccent>
                  <Box sx={{ p: 3 }}>
                    <TravelText
                      text="Recommended Places"
                      textVariant="gradient"
                      variant="h6"
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ color: travelColors.text.primary }}>
                      {(() => {
                        const recs = recommendPlaces(weather, aq, place ? inferSeason(place.latitude, new Date()) : undefined);
                        if (!recs.length) return (
                          <Typography variant="body2" sx={{ color: travelColors.text.secondary, fontStyle: 'italic' }}>
                            No suggestions available.
                          </Typography>
                        );
                        return (
                          <Grid container spacing={1}>
                            {recs.map((r, i) => (
                              <Grid key={i} item>
                                <Box sx={{ 
                                  border: `2px solid ${travelColors.primary.ocean}40`, 
                                  borderRadius: '12px', 
                                  px: 2, 
                                  py: 1,
                                  backgroundColor: `${travelColors.primary.ocean}10`,
                                  color: travelColors.primary.ocean,
                                  fontWeight: 'bold'
                                }}>
                                  {r}
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        );
                      })()}
                    </Box>
                    
                    <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${travelColors.primary.ocean}30` }}>
                      <Typography variant="body2" sx={{ color: travelColors.text.secondary }}>
                        <strong>Current Season:</strong> {place ? inferSeason(place.latitude, new Date()) : '—'}
                      </Typography>
                    </Box>
                  </Box>
                </TravelCard>
              </Grid>
            </Grid>

            {/* AI Travel Recommendations */}
            {aiRecommendations && (
              <TravelCard cardVariant="forest" cardElevation="medium" borderAccent sx={{ mb: 3 }}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AutoAwesome sx={{ fontSize: 28, color: travelColors.primary.forest, mr: 2 }} />
                    <TravelText
                      text="AI Travel Recommendations"
                      textVariant="adventure"
                      variant="h5"
                    />
                  </Box>
                  
                  <Grid container spacing={3}>
                    {/* Places to Visit */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%', bgcolor: `${travelColors.primary.ocean}08` }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Landscape sx={{ color: travelColors.primary.ocean, mr: 1 }} />
                            <Typography variant="h6" sx={{ color: travelColors.primary.ocean }}>
                              Places to Visit
                            </Typography>
                          </Box>
                          <List sx={{ py: 0 }}>
                            {aiRecommendations.placesToVisit.map((place: { name: string; icon: string; reason: string }, index: number) => (
                              <ListItem key={index} sx={{ px: 0, py: 1 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  {place.icon === 'museum' && <LocalActivity sx={{ color: travelColors.primary.sunset }} />}
                                  {place.icon === 'park' && <Landscape sx={{ color: travelColors.primary.forest }} />}
                                  {place.icon === 'beach' && <BeachAccess sx={{ color: travelColors.primary.sky }} />}
                                  {place.icon === 'restaurant' && <Restaurant sx={{ color: travelColors.primary.coral }} />}
                                  {place.icon === 'store' && <LocalActivity sx={{ color: travelColors.primary.sunset }} />}
                                  {!['museum', 'park', 'beach', 'restaurant', 'store'].includes(place.icon) && <LocationOn sx={{ color: travelColors.primary.ocean }} />}
                                </ListItemIcon>
                                <ListItemText
                                  primary={place.name}
                                  secondary={place.reason}
                                  primaryTypographyProps={{ sx: { color: travelColors.text.primary, fontWeight: 'medium' } }}
                                  secondaryTypographyProps={{ sx: { color: travelColors.text.secondary, fontSize: '0.8rem' } }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* What to Bring */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%', bgcolor: `${travelColors.primary.sunset}08` }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Backpack sx={{ color: travelColors.primary.sunset, mr: 1 }} />
                            <Typography variant="h6" sx={{ color: travelColors.primary.sunset }}>
                              What to Bring
                            </Typography>
                          </Box>
                          <List sx={{ py: 0 }}>
                            {aiRecommendations.whatToBring.map((item: { item: string; priority: string; reason: string }, index: number) => (
                              <ListItem key={index} sx={{ px: 0, py: 1 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  {item.item.toLowerCase().includes('umbrella') && <Umbrella sx={{ color: travelColors.primary.sky }} />}
                                  {item.item.toLowerCase().includes('sunscreen') && <WbSunny sx={{ color: travelColors.primary.sunset }} />}
                                  {(item.item.toLowerCase().includes('jacket') || item.item.toLowerCase().includes('coat')) && <AcUnit sx={{ color: travelColors.primary.ocean }} />}
                                  {!item.item.toLowerCase().match(/(umbrella|sunscreen|jacket|coat)/) && <Backpack sx={{ color: travelColors.primary.forest }} />}
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography sx={{ color: travelColors.text.primary, fontWeight: 'medium', fontSize: '0.9rem' }}>
                                        {item.item}
                                      </Typography>
                                      <Chip
                                        label={item.priority}
                                        size="small"
                                        color={
                                          item.priority === 'essential' ? 'error' :
                                          item.priority === 'important' ? 'warning' : 'info'
                                        }
                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                      />
                                    </Box>
                                  }
                                  secondary={item.reason}
                                  secondaryTypographyProps={{ sx: { color: travelColors.text.secondary, fontSize: '0.75rem' } }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Activities & Tips */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%', bgcolor: `${travelColors.primary.forest}08` }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Lightbulb sx={{ color: travelColors.primary.forest, mr: 1 }} />
                            <Typography variant="h6" sx={{ color: travelColors.primary.forest }}>
                              Activities & Tips
                            </Typography>
                          </Box>
                          
                          <Typography variant="subtitle2" sx={{ color: travelColors.text.primary, mb: 1, fontWeight: 'bold' }}>
                            Recommended Activities:
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            {aiRecommendations.activities.map((activity: string, index: number) => (
                              <Chip
                                key={index}
                                label={activity}
                                size="small"
                                sx={{ 
                                  m: 0.25, 
                                  bgcolor: `${travelColors.primary.forest}15`,
                                  color: travelColors.primary.forest,
                                  fontSize: '0.75rem'
                                }}
                              />
                            ))}
                          </Box>
                          
                          <Typography variant="subtitle2" sx={{ color: travelColors.text.primary, mb: 1, fontWeight: 'bold' }}>
                            Smart Tips:
                          </Typography>
                          <List sx={{ py: 0 }}>
                            {aiRecommendations.tips.slice(0, 4).map((tip: string, index: number) => (
                              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 20 }}>
                                  <Lightbulb sx={{ color: travelColors.primary.forest, fontSize: 16 }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={tip}
                                  primaryTypographyProps={{ 
                                    sx: { 
                                      color: travelColors.text.primary, 
                                      fontSize: '0.8rem',
                                      lineHeight: 1.3
                                    } 
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mt: 3, 
                      bgcolor: `${travelColors.primary.sky}10`,
                      '& .MuiAlert-message': { color: travelColors.text.primary }
                    }}
                  >
                    <Typography variant="body2">
                      🤖 <strong>AI-Generated recommendations</strong> based on current weather conditions in {mapLabel || place?.name}. 
                      Weather can change quickly - always check for updates before heading out!
                    </Typography>
                  </Alert>
                </Box>
              </TravelCard>
            )}
            </>
          )}

          {provider === 'both' && hasMapbox ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TravelCard cardVariant="default" cardElevation="high" borderAccent>
                  <Box sx={{ p: 0, overflow: 'hidden', height: { xs: 320, md: 460 } }}>
                    <GlobeMap
                      latitude={place?.latitude}
                      longitude={place?.longitude}
                      label={mapLabel}
                      weather={weather}
                      showRadar={showRadar}
                      styleName={mapboxStyle}
                      rainPoints={rains || undefined}
                    />
                  </Box>
                </TravelCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <TravelCard cardVariant="default" cardElevation="high" borderAccent>
                  <Box sx={{ p: 0, overflow: 'hidden', height: { xs: 260, md: 420 } }}>
                    <LeafletMap
                      latitude={place?.latitude}
                      longitude={place?.longitude}
                      label={mapLabel}
                      weather={weather}
                      showRadar={showRadar}
                      tileName={leafletStyle}
                      rainPoints={rains || undefined}
                    />
                  </Box>
                </TravelCard>
              </Grid>
            </Grid>
          ) : provider === 'mapbox' && hasMapbox ? (
            <TravelCard cardVariant="default" cardElevation="high" borderAccent sx={{ mb: 3 }}>
              <Box sx={{ p: 0, overflow: 'hidden', height: { xs: 260, md: 420 } }}>
                <GlobeMap
                  latitude={place?.latitude}
                  longitude={place?.longitude}
                  label={mapLabel}
                  weather={weather}
                  showRadar={showRadar}
                  styleName={mapboxStyle}
                  rainPoints={rains || undefined}
                />
              </Box>
            </TravelCard>
          ) : (
            <TravelCard cardVariant="default" cardElevation="high" borderAccent sx={{ mb: 3 }}>
              <Box sx={{ p: 0, overflow: 'hidden', height: { xs: 260, md: 420 } }}>
                <LeafletMap
                  latitude={place?.latitude}
                  longitude={place?.longitude}
                  label={mapLabel}
                  weather={weather}
                  showRadar={showRadar}
                  tileName={leafletStyle}
                  rainPoints={rains || undefined}
                />
              </Box>
            </TravelCard>
          )}

          <WeatherMapModal
            open={maximized}
            onClose={() => setMaximized(false)}
            useMapbox={provider !== 'leaflet' && hasMapbox}
            showRadar={showRadar}
            place={place}
            onSelectPlace={setPlace}
            weather={weather}
            mapboxStyle={mapboxStyle}
            leafletStyle={leafletStyle}
          />
        </motion.div>
      </Container>
    </Box>
  );
};

export default WeatherPage;