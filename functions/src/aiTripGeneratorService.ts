import { GoogleGenerativeAI } from '@google/generative-ai';
import { TripRequest, GeneratedItinerary, DayPlan, Activity, Meal, Accommodation, Transportation, CostBreakdown } from './types';
import { GoogleMapsService } from './googleMapsService';
import { format, addDays } from 'date-fns';

export class AITripGeneratorService {
  private genAI: GoogleGenerativeAI;
  private mapsService: GoogleMapsService;

  constructor(apiKey: string, mapsApiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.mapsService = new GoogleMapsService(mapsApiKey);
  }

  async generateItinerary(tripRequest: TripRequest): Promise<GeneratedItinerary> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

      // Get destination information from Google Maps
      const destinationInfo = await this.mapsService.getDestinationInfo(tripRequest.destination);
      
      // Calculate trip duration
      const duration = Math.ceil((tripRequest.endDate.getTime() - tripRequest.startDate.getTime()) / (1000 * 60 * 60 * 24));

      const prompt = this.buildPrompt(tripRequest, destinationInfo, duration);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the AI response and structure it
      const structuredItinerary = await this.parseAIResponse(text, tripRequest, duration);

      // Enhance with real data from Google Maps and other sources
      const enhancedItinerary = await this.enhanceWithRealData(structuredItinerary);

      return enhancedItinerary;
    } catch (error) {
      console.error('Error generating itinerary:', error);
      throw new Error('Failed to generate itinerary');
    }
  }

  private buildPrompt(tripRequest: TripRequest, destinationInfo: any, duration: number): string {
    return `
You are an expert travel planner specializing in India tourism. Generate a detailed, personalized ${duration}-day itinerary for ${tripRequest.destination}.

TRIP DETAILS:
- Destination: ${tripRequest.destination}
- Duration: ${duration} days
- Budget: ₹${tripRequest.budget.min} - ₹${tripRequest.budget.max}
- Group Size: ${tripRequest.groupSize} people
- Travel Style: ${tripRequest.travelStyle}
- Interests: ${tripRequest.interests.join(', ')}
- Accommodation Type: ${tripRequest.accommodationType}
- Transport Preference: ${tripRequest.transportPreference}
- Special Requirements: ${tripRequest.specialRequirements || 'None'}

REQUIREMENTS:
1. Create a day-by-day itinerary with specific activities, timings, and locations
2. Include accommodation recommendations with pricing
3. Suggest transportation options between locations
4. Recommend authentic local restaurants and cuisines
5. Include cultural experiences, heritage sites, and local attractions
6. Provide cost estimates for each activity and meal
7. Consider the interests: ${tripRequest.interests.join(', ')}
8. Stay within the budget range of ₹${tripRequest.budget.min} - ₹${tripRequest.budget.max}

FORMAT YOUR RESPONSE AS JSON:
{
  "overview": "Brief trip overview",
  "days": [
    {
      "day": 1,
      "theme": "Day theme",
      "activities": [
        {
          "name": "Activity name",
          "description": "Detailed description",
          "category": "heritage/nightlife/adventure/etc",
          "location": {
            "name": "Location name",
            "address": "Full address"
          },
          "duration": 2.5,
          "cost": 500,
          "rating": 4.5,
          "bestTimeToVisit": "Morning/Afternoon/Evening",
          "openingHours": "9 AM - 6 PM"
        }
      ],
      "meals": [
        {
          "type": "breakfast/lunch/dinner",
          "restaurant": "Restaurant name",
          "cuisine": "Indian/Local/etc",
          "location": {
            "name": "Restaurant name",
            "address": "Full address"
          },
          "estimatedCost": 300,
          "rating": 4.2,
          "specialties": ["Dish 1", "Dish 2"]
        }
      ],
      "estimatedBudget": 2000
    }
  ],
  "accommodations": [
    {
      "name": "Hotel name",
      "type": "hotel/hostel/resort/homestay",
      "location": {
        "name": "Hotel name",
        "address": "Full address"
      },
      "rating": 4.3,
      "pricePerNight": 3000,
      "amenities": ["WiFi", "AC", "Breakfast"]
    }
  ],
  "transport": [
    {
      "type": "flight/train/bus/taxi",
      "from": {
        "name": "Origin",
        "address": "Origin address"
      },
      "to": {
        "name": "Destination", 
        "address": "Destination address"
      },
      "cost": 5000,
      "provider": "Provider name"
    }
  ],
  "costBreakdown": {
    "accommodation": 15000,
    "transport": 8000,
    "activities": 12000,
    "meals": 9000,
    "miscellaneous": 3000,
    "total": 47000
  },
  "recommendations": [
    {
      "type": "activity/restaurant/accommodation",
      "title": "Recommendation title",
      "description": "Why this is recommended",
      "estimatedCost": 800,
      "rating": 4.4,
      "reasons": ["Reason 1", "Reason 2"]
    }
  ]
}

Focus on authentic Indian experiences, local culture, hidden gems, and ensure all recommendations are realistic and accessible. Include specific addresses where possible.
`;
  }

  private async parseAIResponse(aiResponse: string, tripRequest: TripRequest, duration: number): Promise<GeneratedItinerary> {
    try {
      // Clean the response to extract JSON
      let jsonString = aiResponse;
      if (jsonString.includes('```json')) {
        jsonString = jsonString.split('```json')[1].split('```')[0];
      } else if (jsonString.includes('```')) {
        jsonString = jsonString.split('```')[1];
      }

      const parsedResponse = JSON.parse(jsonString.trim());

      // Convert to our itinerary format
      const itinerary: GeneratedItinerary = {
        id: this.generateId(),
        tripRequestId: tripRequest.id,
        userId: tripRequest.userId,
        destination: tripRequest.destination,
        duration: duration,
        totalBudget: parsedResponse.costBreakdown.total,
        currency: 'INR',
        days: this.parseDayPlans(parsedResponse.days, tripRequest.startDate),
        accommodations: this.parseAccommodations(parsedResponse.accommodations),
        transport: this.parseTransportation(parsedResponse.transport),
        costBreakdown: parsedResponse.costBreakdown,
        recommendations: parsedResponse.recommendations || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      };

      return itinerary;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  private parseDayPlans(days: any[], startDate: Date): DayPlan[] {
    return days.map((day, index) => ({
      day: day.day || index + 1,
      date: addDays(startDate, index),
      theme: day.theme || `Day ${index + 1}`,
      activities: day.activities.map((activity: any) => ({
        id: this.generateId(),
        name: activity.name,
        description: activity.description,
        category: activity.category,
        location: {
          name: activity.location.name,
          address: activity.location.address,
          coordinates: { latitude: 0, longitude: 0 } // Will be filled by Maps API
        },
        duration: activity.duration,
        cost: activity.cost,
        rating: activity.rating,
        openingHours: activity.openingHours,
        bestTimeToVisit: activity.bestTimeToVisit
      })),
      meals: day.meals.map((meal: any) => ({
        type: meal.type,
        restaurant: meal.restaurant,
        cuisine: meal.cuisine,
        location: {
          name: meal.location.name,
          address: meal.location.address,
          coordinates: { latitude: 0, longitude: 0 }
        },
        estimatedCost: meal.estimatedCost,
        rating: meal.rating,
        specialties: meal.specialties
      })),
      accommodation: '', // Will be linked later
      estimatedBudget: day.estimatedBudget,
      notes: day.notes
    }));
  }

  private parseAccommodations(accommodations: any[]): Accommodation[] {
    return accommodations.map(acc => ({
      id: this.generateId(),
      name: acc.name,
      type: acc.type,
      location: {
        name: acc.location.name,
        address: acc.location.address,
        coordinates: { latitude: 0, longitude: 0 }
      },
      rating: acc.rating,
      pricePerNight: acc.pricePerNight,
      amenities: acc.amenities,
      checkIn: new Date(), // Will be set based on trip dates
      checkOut: new Date()
    }));
  }

  private parseTransportation(transport: any[]): Transportation[] {
    return transport.map(trans => ({
      id: this.generateId(),
      type: trans.type,
      from: {
        name: trans.from.name,
        address: trans.from.address,
        coordinates: { latitude: 0, longitude: 0 }
      },
      to: {
        name: trans.to.name,
        address: trans.to.address,
        coordinates: { latitude: 0, longitude: 0 }
      },
      departureTime: new Date(),
      arrivalTime: new Date(),
      cost: trans.cost,
      provider: trans.provider
    }));
  }

  private async enhanceWithRealData(itinerary: GeneratedItinerary): Promise<GeneratedItinerary> {
    // Enhance locations with real coordinates from Google Maps
    for (const day of itinerary.days) {
      for (const activity of day.activities) {
        try {
          const placeDetails = await this.mapsService.getPlaceDetails(activity.location.address);
          if (placeDetails) {
            activity.location.coordinates = placeDetails.coordinates;
            activity.location.placeId = placeDetails.placeId;
          }
        } catch (error) {
          console.warn(`Failed to get place details for ${activity.location.name}`);
        }
      }

      for (const meal of day.meals) {
        try {
          const placeDetails = await this.mapsService.getPlaceDetails(meal.location.address);
          if (placeDetails) {
            meal.location.coordinates = placeDetails.coordinates;
            meal.location.placeId = placeDetails.placeId;
          }
        } catch (error) {
          console.warn(`Failed to get place details for ${meal.location.name}`);
        }
      }
    }

    // Enhance accommodations
    for (const accommodation of itinerary.accommodations) {
      try {
        const placeDetails = await this.mapsService.getPlaceDetails(accommodation.location.address);
        if (placeDetails) {
          accommodation.location.coordinates = placeDetails.coordinates;
          accommodation.location.placeId = placeDetails.placeId;
        }
      } catch (error) {
        console.warn(`Failed to get place details for ${accommodation.location.name}`);
      }
    }

    return itinerary;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}