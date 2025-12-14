export interface WeatherData {
  city?: string;
  country?: string;
  description?: string;
  tempC?: number;
  feelsLikeC?: number;
  humidity?: number; // %
  windSpeedMs?: number; // meters/sec
  windDeg?: number; // degrees
  pressure?: number; // hPa
  visibility?: number; // meters
  clouds?: number; // % cloudiness
  rain1h?: number; // mm
  rain3h?: number; // mm
}

export interface AirQualityData {
  aqi?: number; // 1-5 (Good..Very Poor) for OWM
  components?: { [k: string]: number };
}

export interface WeatherInsights {
  summary: string;
  tips: string[];
}

export interface HealthInsights {
  riskLevel: 'Low' | 'Moderate' | 'High';
  notes: string[];
}

export interface ForecastPoint { dt: number; tempC: number; description?: string }

export interface RainPoint { lat: number; lon: number; name?: string }

export function inferSeason(lat: number, date: Date = new Date()): 'Winter' | 'Spring' | 'Summer' | 'Autumn' {
  // Simple meteorological seasons; flip for southern hemisphere
  const m = date.getUTCMonth(); // 0-11
  const north = lat >= 0;
  // Seasons for northern hemisphere: DJF winter, MAM spring, JJA summer, SON autumn
  let season: 'Winter' | 'Spring' | 'Summer' | 'Autumn';
  if (m === 11 || m <= 1) season = 'Winter';
  else if (m >= 2 && m <= 4) season = 'Spring';
  else if (m >= 5 && m <= 7) season = 'Summer';
  else season = 'Autumn';
  if (!north) {
    // Opposite seasons in southern hemisphere
    season = season === 'Winter' ? 'Summer'
      : season === 'Summer' ? 'Winter'
      : season === 'Spring' ? 'Autumn'
      : 'Spring';
  }
  return season;
}

const OWM_KEY = process.env.REACT_APP_OWM_API_KEY;

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    if (OWM_KEY) {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`);
      if (!res.ok) throw new Error('owm-failed');
      const data = await res.json();
      return {
        city: data.name,
        country: data.sys?.country,
        description: data.weather?.[0]?.description,
        tempC: data.main?.temp,
        feelsLikeC: data.main?.feels_like,
        humidity: data.main?.humidity,
        windSpeedMs: data.wind?.speed,
        windDeg: data.wind?.deg,
        pressure: data.main?.pressure,
        visibility: data.visibility,
        clouds: data.clouds?.all,
        rain1h: data.rain?.['1h'],
        rain3h: data.rain?.['3h'],
      };
    }
  } catch (e) {
    // fallback
  }
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`);
    const data = await res.json();
    const tempC = data?.current?.temperature_2m;
    const humidity = data?.current?.relative_humidity_2m;
    const windSpeedMs = typeof data?.current?.wind_speed_10m === 'number' ? (data.current.wind_speed_10m / 3.6) : undefined; // km/h -> m/s if returned
    return { description: 'Current conditions', tempC, humidity, windSpeedMs };
  } catch (e) {
    return null;
  }
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData | null> {
  if (!OWM_KEY) return null;
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_KEY}`);
    const json = await res.json();
    const item = json?.list?.[0];
    return item ? { aqi: item.main?.aqi, components: item.components } : null;
  } catch (e) {
    return null;
  }
}

// Lightweight heuristic-based insights (no external AI service needed)
export function generateWeatherInsights(wx: WeatherData | null, aq: AirQualityData | null): WeatherInsights {
  if (!wx) return { summary: 'No weather data available.', tips: [] };
  const t = wx.tempC ?? 20;
  const feels = wx.feelsLikeC ?? t;
  const hum = wx.humidity ?? 50;
  const wind = wx.windSpeedMs ?? 0;
  const rain = (wx.rain1h ?? 0) + (wx.rain3h ?? 0);
  const aqi = aq?.aqi ?? 2;

  // Build summary
  const parts: string[] = [];
  parts.push(`It is ${t.toFixed(1)}°C (feels like ${feels.toFixed(1)}°C) with ${wx.description || 'stable conditions'}.`);
  if (rain > 0) parts.push(`Recent rainfall detected (~${rain.toFixed(1)} mm).`);
  if (wind >= 8) parts.push(`Winds are ${wind.toFixed(1)} m/s; expect a breezy feel.`);
  parts.push(`Humidity at ${hum}%${wx.pressure ? ` and pressure near ${wx.pressure} hPa` : ''}.`);
  if (typeof wx.clouds === 'number') parts.push(`${wx.clouds}% cloud cover.`);
  if (typeof wx.visibility === 'number') parts.push(`Visibility about ${Math.round(wx.visibility/1000)} km.`);

  // AQI guidance
  const tips: string[] = [];
  const aqiMap: Record<number, string> = {1: 'Good', 2: 'Fair', 3: 'Moderate', 4: 'Poor', 5: 'Very Poor'};
  tips.push(`Air quality: ${aqiMap[aqi] || 'Unknown'}${aq?.components?.pm2_5 ? ` (PM2.5 ${Math.round(aq.components.pm2_5)} µg/m³)` : ''}.`);
  if (aqi >= 4) tips.push('Consider a mask outdoors and limit strenuous activities.');
  if (rain > 2) tips.push('Carry an umbrella or raincoat.');
  if (t > 30) tips.push('Stay hydrated and avoid midday heat.');
  if (t < 5) tips.push('Dress in layers and protect extremities.');
  if (wind > 12) tips.push('Secure loose items; cycling may be challenging.');

  return { summary: parts.join(' '), tips };
}

// Health risk assessment based on temp, humidity, wind, rain, and AQI/PM2.5
export function generateHealthInsights(wx: WeatherData | null, aq: AirQualityData | null): HealthInsights {
  if (!wx) return { riskLevel: 'Low', notes: ['No weather data available.'] };
  const notes: string[] = [];
  let score = 0;

  const t = wx.tempC ?? 20;
  const hum = wx.humidity ?? 50;
  const wind = wx.windSpeedMs ?? 0;
  const rain = (wx.rain1h ?? 0) + (wx.rain3h ?? 0);
  const aqi = aq?.aqi ?? 2;
  const pm25 = aq?.components?.pm2_5 ?? 0;

  // Temperature stress
  if (t >= 33) { score += 2; notes.push('Heat stress possible; hydrate and limit midday exertion.'); }
  else if (t <= 0) { score += 2; notes.push('Risk of cold stress; dress warmly and protect extremities.'); }
  else if (t <= 8) { score += 1; notes.push('Chilly conditions; wear layers.'); }

  // Humidity modifies heat stress (simplified)
  if (t >= 30 && hum >= 60) { score += 1; notes.push('High humidity increases perceived heat.'); }

  // Wind hazards
  if (wind >= 12) { score += 1; notes.push('Strong winds; secure loose items and caution for cyclists.'); }

  // Precipitation
  if (rain >= 2) { score += 1; notes.push('Rain may cause slippery surfaces; carry rain gear.'); }

  // Air quality
  if (aqi >= 4) { score += 2; notes.push('Poor air quality; consider a mask and reduce outdoor exertion.'); }
  else if (pm25 >= 35) { score += 1; notes.push('Elevated PM2.5; sensitive groups should limit prolonged outdoor activity.'); }

  let riskLevel: HealthInsights['riskLevel'] = 'Low';
  if (score >= 4) riskLevel = 'High';
  else if (score >= 2) riskLevel = 'Moderate';

  return { riskLevel, notes };
}

// Place recommendations based on conditions
export function recommendPlaces(wx: WeatherData | null, aq: AirQualityData | null, season?: string): string[] {
  if (!wx) return [];
  const t = wx.tempC ?? 20;
  const rain = (wx.rain1h ?? 0) + (wx.rain3h ?? 0);
  const aqi = aq?.aqi ?? 2;
  const clouds = wx.clouds ?? 0;
  const ideas: string[] = [];

  const poorAir = aqi >= 4;
  const rainy = rain >= 1;
  const hot = t >= 30;
  const cold = t <= 8;
  const clear = clouds <= 40 && !rainy;

  if (poorAir || rainy || cold) {
    ideas.push('Museums', 'Art galleries', 'Aquariums', 'Indoor markets', 'Cafés', 'Malls');
  }
  if (clear && !poorAir && !hot) {
    ideas.push('City parks', 'Waterfront walks', 'Botanical gardens', 'Viewpoints');
  }
  if (!poorAir && t >= 18 && t <= 28 && !rainy) {
    ideas.push('Walking tours', 'Open-air plazas', 'Street food areas');
  }
  if (hot && !poorAir) {
    ideas.push('Lakeside spots', 'Shaded parks', 'Evening markets');
  }

  // Season touches
  if (season === 'Summer') ideas.push('Sunset viewpoints');
  if (season === 'Winter') ideas.push('Cozy cafés');

  // Deduplicate while preserving order
  return Array.from(new Set(ideas)).slice(0, 8);
}

export async function fetchRainNearby(lat: number, lon: number): Promise<RainPoint[] | null> {
  if (!OWM_KEY) return null;
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=50&appid=${OWM_KEY}&units=metric`);
    const json = await res.json();
    const list = Array.isArray(json?.list) ? json.list : [];
    const rains = list.filter((it: any) => {
      const hasRainMain = (it.weather || []).some((w: any) => String(w.main).toLowerCase().includes('rain'));
      const hasRainField = !!it.rain;
      return hasRainMain || hasRainField;
    }).map((it: any) => ({ lat: it.coord?.lat, lon: it.coord?.lon, name: it.name }))
    .filter((p: any) => typeof p.lat === 'number' && typeof p.lon === 'number');
    return rains;
  } catch (e) {
    return null;
  }
}

export async function fetchForecast(lat: number, lon: number): Promise<ForecastPoint[] | null> {
  try {
    if (OWM_KEY) {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`);
      const json = await res.json();
      const list = Array.isArray(json?.list) ? json.list : [];
      return list.slice(0, 8).map((p: any) => ({ dt: p.dt, tempC: p.main?.temp, description: p.weather?.[0]?.description }));
    }
  } catch (e) {
    // ignore
  }
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`);
    const json = await res.json();
    const times: string[] = json?.hourly?.time || [];
    const temps: number[] = json?.hourly?.temperature_2m || [];
    return times.slice(0, 8).map((t, i) => ({ dt: Math.floor(new Date(t).getTime()/1000), tempC: temps[i] }));
  } catch {
    return null;
  }
}
