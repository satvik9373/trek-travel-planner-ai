import axios from 'axios';
import { GeneratedItinerary, RealTimeUpdate, Weather } from './types';
import * as admin from 'firebase-admin';

export class RealTimeAdjustmentService {
  private db: FirebaseFirestore.Firestore;
  private weatherApiKey: string;

  constructor(weatherApiKey: string) {
    this.db = admin.firestore();
    this.weatherApiKey = weatherApiKey;
  }

  async checkWeatherUpdates(itinerary: GeneratedItinerary): Promise<RealTimeUpdate[]> {
    const updates: RealTimeUpdate[] = [];

    try {
      for (const day of itinerary.days) {
        if (day.activities.length === 0) continue;

        // Get weather for the day
        const weather = await this.getWeatherForLocation(
          itinerary.destination,
          day.date
        );

        if (!weather) continue;

        // Check for weather that might affect outdoor activities
        const outdoorActivities = day.activities.filter(activity => 
          this.isOutdoorActivity(activity.category)
        );

        if (outdoorActivities.length > 0) {
          const weatherUpdate = this.analyzeWeatherImpact(weather, day, outdoorActivities);
          if (weatherUpdate) {
            updates.push(weatherUpdate);
          }
        }
      }

      return updates;
    } catch (error) {
      console.error('Error checking weather updates:', error);
      return [];
    }
  }

  private async getWeatherForLocation(location: string, date: Date): Promise<Weather | null> {
    try {
      // Using OpenWeatherMap API as example
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast`, {
          params: {
            q: location,
            appid: this.weatherApiKey,
            units: 'metric'
          }
        }
      );

      // Find forecast for the specific date
      const targetDate = date.toISOString().split('T')[0];
      const forecast = response.data.list.find((item: any) => 
        item.dt_txt.startsWith(targetDate)
      );

      if (!forecast) return null;

      return {
        location: location,
        date: date,
        condition: forecast.weather[0].main,
        temperature: {
          min: forecast.main.temp_min,
          max: forecast.main.temp_max,
          unit: 'C'
        },
        precipitation: forecast.rain ? forecast.rain['3h'] || 0 : 0,
        humidity: forecast.main.humidity,
        windSpeed: forecast.wind.speed,
        recommendations: this.getWeatherRecommendations(forecast)
      };
    } catch (error) {
      console.error('Error getting weather:', error);
      return null;
    }
  }

  private isOutdoorActivity(category: string): boolean {
    const outdoorCategories = ['adventure', 'nature', 'photography', 'spiritual'];
    return outdoorCategories.includes(category);
  }

  private analyzeWeatherImpact(weather: Weather, day: any, outdoorActivities: any[]): RealTimeUpdate | null {
    let impact: 'low' | 'medium' | 'high' = 'low';
    let title = '';
    let description = '';
    const suggestedActions: string[] = [];

    // Rain impact
    if (weather.precipitation > 5) {
      impact = 'high';
      title = `Heavy Rain Expected on Day ${day.day}`;
      description = `Heavy rainfall (${weather.precipitation}mm) expected in ${weather.location}. This may affect outdoor activities.`;
      suggestedActions.push('Consider indoor alternatives');
      suggestedActions.push('Bring rain gear if proceeding with outdoor activities');
      suggestedActions.push('Check if activities offer covered areas');
    } else if (weather.precipitation > 1) {
      impact = 'medium';
      title = `Light Rain Expected on Day ${day.day}`;
      description = `Light rain expected in ${weather.location}. Outdoor activities may be affected.`;
      suggestedActions.push('Bring umbrella or light rain jacket');
    }

    // Extreme temperature impact
    if (weather.temperature.max > 40) {
      impact = impact === 'high' ? 'high' : 'medium';
      title = title || `High Temperature Alert - Day ${day.day}`;
      description = description || `Very hot weather expected (${weather.temperature.max}°C). Take precautions for outdoor activities.`;
      suggestedActions.push('Stay hydrated');
      suggestedActions.push('Avoid outdoor activities during peak hours (12-4 PM)');
      suggestedActions.push('Wear sun protection');
    } else if (weather.temperature.min < 5) {
      impact = impact === 'high' ? 'high' : 'medium';
      title = title || `Cold Weather Alert - Day ${day.day}`;
      description = description || `Cold weather expected (${weather.temperature.min}°C). Dress warmly for outdoor activities.`;
      suggestedActions.push('Wear warm clothing');
      suggestedActions.push('Check if venues have heating');
    }

    if (impact === 'low') return null;

    return {
      id: `weather_${day.day}_${Date.now()}`,
      itineraryId: day.itineraryId || '',
      type: 'weather',
      title,
      description,
      impact,
      suggestedActions,
      affectedItems: outdoorActivities.map(activity => activity.id),
      createdAt: new Date(),
      acknowledged: false
    };
  }

  private getWeatherRecommendations(forecast: any): string[] {
    const recommendations: string[] = [];
    const condition = forecast.weather[0].main.toLowerCase();
    
    switch (condition) {
      case 'rain':
        recommendations.push('Carry umbrella or raincoat');
        recommendations.push('Wear waterproof shoes');
        break;
      case 'snow':
        recommendations.push('Dress warmly in layers');
        recommendations.push('Wear non-slip footwear');
        break;
      case 'clear':
        recommendations.push('Perfect weather for outdoor activities');
        recommendations.push('Don\'t forget sunscreen');
        break;
      case 'clouds':
        recommendations.push('Good weather for sightseeing');
        break;
    }

    return recommendations;
  }

  async checkLocalEvents(itinerary: GeneratedItinerary): Promise<RealTimeUpdate[]> {
    // This would integrate with local events APIs
    // For now, returning mock data
    const updates: RealTimeUpdate[] = [];

    try {
      // Simulate checking for local events, festivals, closures
      const mockEvents = await this.getMockLocalEvents(itinerary.destination);
      
      for (const event of mockEvents) {
        if (this.doesEventAffectItinerary(event, itinerary)) {
          updates.push({
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            itineraryId: itinerary.id,
            type: 'event',
            title: event.title,
            description: event.description,
            impact: event.impact,
            suggestedActions: event.suggestedActions,
            affectedItems: event.affectedItems,
            createdAt: new Date(),
            acknowledged: false
          });
        }
      }
    } catch (error) {
      console.error('Error checking local events:', error);
    }

    return updates;
  }

  private async getMockLocalEvents(destination: string): Promise<any[]> {
    // In real implementation, this would call local events APIs
    return [
      {
        title: 'Local Festival',
        description: 'Annual cultural festival happening in the city center',
        impact: 'medium',
        suggestedActions: ['Book accommodations early', 'Expect crowds at tourist attractions'],
        affectedItems: ['city-center-activities']
      },
      {
        title: 'Monument Closure',
        description: 'Historical monument closed for maintenance',
        impact: 'high',
        suggestedActions: ['Visit alternative historical sites', 'Reschedule visit for later dates'],
        affectedItems: ['monument-visit']
      }
    ];
  }

  private doesEventAffectItinerary(event: any, itinerary: GeneratedItinerary): boolean {
    // Check if event affects any activities in the itinerary
    // This is a simplified check
    return Math.random() > 0.7; // 30% chance of affecting itinerary
  }

  async generateSmartAdjustments(itinerary: GeneratedItinerary, updates: RealTimeUpdate[]): Promise<any> {
    const adjustments: any = {
      rescheduledActivities: [],
      alternativeActivities: [],
      routeOptimizations: [],
      accommodationChanges: []
    };

    for (const update of updates) {
      switch (update.type) {
        case 'weather':
          if (update.impact === 'high') {
            const alternatives = await this.suggestIndoorAlternatives(itinerary, update.affectedItems);
            adjustments.alternativeActivities.push(...alternatives);
          }
          break;
        
        case 'closure':
          const rescheduled = await this.rescheduleActivities(itinerary, update.affectedItems);
          adjustments.rescheduledActivities.push(...rescheduled);
          break;
        
        case 'delay':
          const optimized = await this.optimizeRoute(itinerary, update.affectedItems);
          adjustments.routeOptimizations.push(...optimized);
          break;
      }
    }

    return adjustments;
  }

  private async suggestIndoorAlternatives(itinerary: GeneratedItinerary, affectedItemIds: string[]): Promise<any[]> {
    // Generate indoor alternatives for outdoor activities
    const alternatives = [];
    
    for (const day of itinerary.days) {
      for (const activity of day.activities) {
        if (affectedItemIds.includes(activity.id)) {
          alternatives.push({
            originalActivityId: activity.id,
            alternative: {
              name: `Indoor alternative to ${activity.name}`,
              description: 'Museum or cultural center visit',
              location: activity.location,
              cost: activity.cost * 0.8,
              duration: activity.duration
            }
          });
        }
      }
    }
    
    return alternatives;
  }

  private async rescheduleActivities(itinerary: GeneratedItinerary, affectedItemIds: string[]): Promise<any[]> {
    // Reschedule affected activities to different days
    return [{
      message: 'Activities rescheduled due to closures',
      changes: affectedItemIds.length
    }];
  }

  private async optimizeRoute(itinerary: GeneratedItinerary, affectedItemIds: string[]): Promise<any[]> {
    // Optimize route based on delays or changes
    return [{
      message: 'Route optimized to account for delays',
      timeSaved: '30 minutes'
    }];
  }

  async saveUpdates(updates: RealTimeUpdate[]): Promise<void> {
    const batch = this.db.batch();

    for (const update of updates) {
      const updateRef = this.db.collection('realTimeUpdates').doc(update.id);
      batch.set(updateRef, {
        ...update,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    await batch.commit();
  }

  async getUpdatesForItinerary(itineraryId: string): Promise<RealTimeUpdate[]> {
    try {
      const snapshot = await this.db
        .collection('realTimeUpdates')
        .where('itineraryId', '==', itineraryId)
        .where('acknowledged', '==', false)
        .orderBy('createdAt', 'desc')
        .get();

      const updates: RealTimeUpdate[] = [];
      snapshot.forEach(doc => {
        updates.push({ id: doc.id, ...doc.data() } as RealTimeUpdate);
      });

      return updates;
    } catch (error) {
      console.error('Error getting updates:', error);
      return [];
    }
  }

  async acknowledgeUpdate(updateId: string): Promise<void> {
    await this.db.collection('realTimeUpdates').doc(updateId).update({
      acknowledged: true,
      acknowledgedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}