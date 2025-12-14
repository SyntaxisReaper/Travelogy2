// WeatherService.ts - Real weather integration for AI trip planning
export interface WeatherData {
  location: string;
  coordinates: [number, number];
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
  };
  forecast: DailyForecast[];
  historical: MonthlyAverage[];
}

export interface DailyForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
  humidity: number;
}

export interface MonthlyAverage {
  month: string;
  averageHigh: number;
  averageLow: number;
  rainfall: number;
  sunnyDays: number;
  bestForTravel: boolean;
  crowdLevel: 'low' | 'medium' | 'high';
}

export interface WeatherRecommendation {
  score: number; // 0-100
  bestMonths: string[];
  worstMonths: string[];
  packingRecommendations: string[];
  activityRecommendations: {
    indoor: string[];
    outdoor: string[];
  };
}

class WeatherService {
  private readonly API_KEY = process.env.REACT_APP_WEATHER_API_KEY || 'demo_key';
  private readonly BASE_URL = 'https://api.weatherapi.com/v1';
  private cache = new Map<string, { data: WeatherData; timestamp: number }>();

  // Cache duration: 1 hour
  private readonly CACHE_DURATION = 60 * 60 * 1000;

  async getWeatherData(location: string, coordinates?: [number, number]): Promise<WeatherData> {
    const cacheKey = location.toLowerCase();
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // For demo purposes, return mock data
      const mockData = this.generateMockWeatherData(location, coordinates);
      
      // In production, you would make actual API calls:
      // const response = await fetch(`${this.BASE_URL}/current.json?key=${this.API_KEY}&q=${location}&aqi=no`);
      // const data = await response.json();
      
      this.cache.set(cacheKey, { data: mockData, timestamp: Date.now() });
      return mockData;
    } catch (error) {
      console.error('Weather API error:', error);
      // Fallback to mock data
      return this.generateMockWeatherData(location, coordinates);
    }
  }

  async getHistoricalWeather(location: string, months: number = 12): Promise<MonthlyAverage[]> {
    // Mock historical data - in production, this would fetch real historical data
    return this.generateMockHistoricalData(location);
  }

  async getForecast(location: string, days: number = 7): Promise<DailyForecast[]> {
    try {
      // Mock forecast data
      return this.generateMockForecast(location, days);
    } catch (error) {
      console.error('Forecast API error:', error);
      return this.generateMockForecast(location, days);
    }
  }

  analyzeWeatherForTravel(weatherData: WeatherData, travelDates?: string[]): WeatherRecommendation {
    const { current, historical } = weatherData;
    
    // Calculate travel score based on multiple factors
    let score = 50; // Base score
    
    // Temperature comfort (20-25°C is ideal)
    const tempScore = Math.max(0, 100 - Math.abs(current.temperature - 22.5) * 4);
    score += tempScore * 0.3;
    
    // Weather condition bonus/penalty
    const conditionBonus = this.getConditionScore(current.condition);
    score += conditionBonus * 0.2;
    
    // Humidity comfort (40-60% is ideal)
    const humidityScore = Math.max(0, 100 - Math.abs(current.humidity - 50) * 2);
    score += humidityScore * 0.1;
    
    // Wind speed (0-15 km/h is comfortable)
    const windScore = Math.max(0, 100 - Math.max(0, current.windSpeed - 15) * 5);
    score += windScore * 0.1;
    
    // UV Index consideration
    const uvScore = current.uvIndex <= 6 ? 100 : Math.max(0, 100 - (current.uvIndex - 6) * 15);
    score += uvScore * 0.1;
    
    // Historical data analysis
    const bestMonths = historical
      .filter(month => month.bestForTravel)
      .map(month => month.month)
      .slice(0, 4);
    
    const worstMonths = historical
      .filter(month => !month.bestForTravel && month.crowdLevel === 'high')
      .map(month => month.month);

    return {
      score: Math.min(100, Math.max(0, score)),
      bestMonths,
      worstMonths,
      packingRecommendations: this.generatePackingRecommendations(current),
      activityRecommendations: this.generateActivityRecommendations(current)
    };
  }

  private getConditionScore(condition: string): number {
    const conditionMap: { [key: string]: number } = {
      'sunny': 30,
      'clear': 30,
      'partly cloudy': 20,
      'cloudy': 10,
      'overcast': 5,
      'light rain': -10,
      'rain': -20,
      'heavy rain': -30,
      'thunderstorm': -40,
      'snow': -15,
      'fog': -10
    };
    
    return conditionMap[condition.toLowerCase()] || 0;
  }

  private generatePackingRecommendations(weather: WeatherData['current']): string[] {
    const recommendations: string[] = [];
    
    if (weather.temperature < 10) {
      recommendations.push('Pack warm layers, winter coat, and thermal underwear');
      recommendations.push('Bring waterproof boots and gloves');
    } else if (weather.temperature < 20) {
      recommendations.push('Pack layers for varying temperatures');
      recommendations.push('Bring a light jacket for evenings');
    } else if (weather.temperature > 30) {
      recommendations.push('Pack light, breathable clothing');
      recommendations.push('Bring sun protection and plenty of water');
    }
    
    if (weather.humidity > 70) {
      recommendations.push('Choose moisture-wicking fabrics');
    }
    
    if (weather.uvIndex > 6) {
      recommendations.push('Pack sunscreen SPF 30+, hat, and sunglasses');
    }
    
    if (weather.condition.toLowerCase().includes('rain')) {
      recommendations.push('Bring waterproof jacket and umbrella');
    }
    
    return recommendations;
  }

  private generateActivityRecommendations(weather: WeatherData['current']): {
    indoor: string[];
    outdoor: string[];
  } {
    const indoor: string[] = [];
    const outdoor: string[] = [];
    
    if (weather.condition.toLowerCase().includes('rain')) {
      indoor.push('Visit museums and galleries', 'Explore local markets', 'Try cooking classes');
    } else {
      outdoor.push('Walking tours', 'Outdoor dining', 'Parks and gardens');
    }
    
    if (weather.temperature > 25 && weather.condition.toLowerCase().includes('sunny')) {
      outdoor.push('Beach activities', 'Swimming', 'Outdoor sports');
    }
    
    if (weather.temperature < 15) {
      indoor.push('Hot springs', 'Indoor attractions', 'Cozy cafes');
      outdoor.push('Winter sports', 'Holiday markets');
    }
    
    return { indoor, outdoor };
  }

  private generateMockWeatherData(location: string, coordinates?: [number, number]): WeatherData {
    // Generate realistic mock data based on location
    const baseTemp = this.getLocationBaseTemperature(location);
    const variation = (Math.random() - 0.5) * 10;
    
    return {
      location,
      coordinates: coordinates || [0, 0],
      current: {
        temperature: Math.round(baseTemp + variation),
        condition: this.getRandomCondition(),
        humidity: Math.round(40 + Math.random() * 40),
        windSpeed: Math.round(Math.random() * 20),
        pressure: Math.round(1000 + Math.random() * 50),
        visibility: Math.round(8 + Math.random() * 7),
        uvIndex: Math.round(Math.random() * 11)
      },
      forecast: this.generateMockForecast(location, 7),
      historical: this.generateMockHistoricalData(location)
    };
  }

  private generateMockForecast(location: string, days: number): DailyForecast[] {
    const baseTemp = this.getLocationBaseTemperature(location);
    const forecast: DailyForecast[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const dayVariation = (Math.random() - 0.5) * 15;
      const high = Math.round(baseTemp + dayVariation + 3);
      const low = Math.round(baseTemp + dayVariation - 3);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        high,
        low,
        condition: this.getRandomCondition(),
        precipitation: Math.round(Math.random() * 30),
        windSpeed: Math.round(Math.random() * 25),
        humidity: Math.round(40 + Math.random() * 40)
      });
    }
    
    return forecast;
  }

  private generateMockHistoricalData(location: string): MonthlyAverage[] {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return months.map((month, index) => {
      const baseTemp = this.getLocationBaseTemperature(location);
      const seasonalVariation = Math.sin((index - 2) * Math.PI / 6) * 15; // Peak in summer
      const avgHigh = Math.round(baseTemp + seasonalVariation + 5);
      const avgLow = Math.round(baseTemp + seasonalVariation - 5);
      
      return {
        month,
        averageHigh: avgHigh,
        averageLow: avgLow,
        rainfall: Math.round(Math.random() * 150),
        sunnyDays: Math.round(15 + Math.random() * 15),
        bestForTravel: avgHigh > 15 && avgHigh < 30,
        crowdLevel: index >= 5 && index <= 7 ? 'high' : index >= 3 && index <= 4 ? 'medium' : 'low'
      };
    });
  }

  private getLocationBaseTemperature(location: string): number {
    // Rough temperature estimates for demo
    const locationTemps: { [key: string]: number } = {
      'kyoto': 18,
      'japan': 18,
      'santorini': 24,
      'greece': 22,
      'patagonia': 12,
      'chile': 15,
      'argentina': 18,
      'london': 12,
      'paris': 14,
      'rome': 20,
      'bangkok': 30,
      'tokyo': 17,
      'new york': 15,
      'los angeles': 22,
      'sydney': 20,
      'dubai': 32
    };
    
    const key = location.toLowerCase();
    return locationTemps[key] || Object.keys(locationTemps).find(k => 
      location.toLowerCase().includes(k)
    ) ? locationTemps[Object.keys(locationTemps).find(k => 
      location.toLowerCase().includes(k))!] : 20;
  }

  private getRandomCondition(): string {
    const conditions = [
      'Sunny', 'Partly Cloudy', 'Cloudy', 'Clear', 
      'Light Rain', 'Overcast', 'Fog', 'Windy'
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  // Utility method for getting weather-based travel scores
  static getSeasonalScore(month: string, destination: string): number {
    // This would normally use real historical data
    const seasonalData: { [key: string]: { [key: string]: number } } = {
      'kyoto': {
        'march': 85, 'april': 95, 'may': 90, 'october': 95, 'november': 85,
        'december': 40, 'january': 35, 'february': 45, 'june': 60, 'july': 45, 'august': 50, 'september': 75
      },
      'santorini': {
        'april': 80, 'may': 90, 'june': 95, 'september': 95, 'october': 85,
        'july': 85, 'august': 80, 'november': 60, 'march': 70, 'december': 40, 'january': 35, 'february': 40
      },
      'patagonia': {
        'november': 85, 'december': 95, 'january': 95, 'february': 90, 'march': 85,
        'april': 60, 'may': 35, 'june': 25, 'july': 25, 'august': 35, 'september': 50, 'october': 70
      }
    };
    
    const destKey = destination.toLowerCase();
    const monthKey = month.toLowerCase();
    
    return seasonalData[destKey]?.[monthKey] || 60; // Default score
  }
}

export default new WeatherService();