import { Client, PlaceDetailsRequest, PlaceDetailsResponse, FindPlaceFromTextRequest, FindPlaceFromTextResponse, PlacesNearbyRequest, PlacesNearbyResponse, UnitSystem, PlaceInputType } from '@googlemaps/google-maps-services-js';
import { Location } from './types';

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  priceLevel?: number;
  photos?: string[];
  openingHours?: string[];
  website?: string;
  phoneNumber?: string;
}

export class GoogleMapsService {
  private client: Client;
  private apiKey: string;

  constructor(apiKey: string) {
    this.client = new Client({});
    this.apiKey = apiKey;
  }

  async getDestinationInfo(destination: string): Promise<any> {
    try {
      const request: FindPlaceFromTextRequest = {
        params: {
          input: destination,
          inputtype: PlaceInputType.textQuery,
          fields: ['place_id', 'name', 'geometry', 'formatted_address', 'rating', 'photos'],
          key: this.apiKey,
        },
      };

      const response: FindPlaceFromTextResponse = await this.client.findPlaceFromText(request);
      
      if (response.data.candidates && response.data.candidates.length > 0) {
        const place = response.data.candidates[0];
        return {
          placeId: place.place_id,
          name: place.name,
          address: place.formatted_address,
          coordinates: place.geometry?.location,
          rating: place.rating,
          photos: place.photos?.map((photo: any) => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
          )
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting destination info:', error);
      return null;
    }
  }

  async getPlaceDetails(query: string): Promise<PlaceDetails | null> {
    try {
      // First, find the place
      const findRequest: FindPlaceFromTextRequest = {
        params: {
          input: query,
          inputtype: PlaceInputType.textQuery,
          fields: ['place_id'],
          key: this.apiKey,
        },
      };

      const findResponse = await this.client.findPlaceFromText(findRequest);
      
      if (!findResponse.data.candidates || findResponse.data.candidates.length === 0) {
        return null;
      }

      const placeId = findResponse.data.candidates[0].place_id!;

      // Get detailed information
      const detailsRequest: PlaceDetailsRequest = {
        params: {
          place_id: placeId,
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'rating',
            'price_level',
            'photos',
            'opening_hours',
            'website',
            'formatted_phone_number'
          ],
          key: this.apiKey,
        },
      };

      const detailsResponse: PlaceDetailsResponse = await this.client.placeDetails(detailsRequest);
      const place = detailsResponse.data.result;

      return {
        placeId: placeId,
        name: place.name || '',
        address: place.formatted_address || '',
        coordinates: {
          latitude: place.geometry?.location?.lat || 0,
          longitude: place.geometry?.location?.lng || 0,
        },
        rating: place.rating,
        priceLevel: place.price_level,
        photos: place.photos?.map((photo: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
        ),
        openingHours: place.opening_hours?.weekday_text,
        website: place.website,
        phoneNumber: place.formatted_phone_number,
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  async getNearbyPlaces(
    location: { lat: number; lng: number },
    radius: number = 5000,
    type?: string
  ): Promise<PlaceDetails[]> {
    try {
      const request: PlacesNearbyRequest = {
        params: {
          location: location,
          radius: radius,
          type: type,
          key: this.apiKey,
        },
      };

      const response: PlacesNearbyResponse = await this.client.placesNearby(request);
      
      const places: PlaceDetails[] = [];
      for (const place of response.data.results) {
        if (place.place_id) {
          places.push({
            placeId: place.place_id,
            name: place.name || '',
            address: place.vicinity || '',
            coordinates: {
              latitude: place.geometry?.location?.lat || 0,
              longitude: place.geometry?.location?.lng || 0,
            },
            rating: place.rating,
            priceLevel: place.price_level,
            photos: place.photos?.map((photo: any) => 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
            ),
          });
        }
      }

      return places;
    } catch (error) {
      console.error('Error getting nearby places:', error);
      return [];
    }
  }

  async getRouteOptimization(waypoints: Location[]): Promise<any> {
    try {
      if (waypoints.length < 2) return null;

      const origin = waypoints[0];
      const destination = waypoints[waypoints.length - 1];
      const intermediateWaypoints = waypoints.slice(1, -1);

      const request = {
        params: {
          origin: `${origin.coordinates.latitude},${origin.coordinates.longitude}`,
          destination: `${destination.coordinates.latitude},${destination.coordinates.longitude}`,
          waypoints: intermediateWaypoints.map(wp => 
            `${wp.coordinates.latitude},${wp.coordinates.longitude}`
          ),
          optimize: true,
          key: this.apiKey,
        },
      };

      const response = await this.client.directions(request);
      return response.data;
    } catch (error) {
      console.error('Error optimizing route:', error);
      return null;
    }
  }

  async getDistanceMatrix(origins: Location[], destinations: Location[]): Promise<any> {
    try {
      const request = {
        params: {
          origins: origins.map(o => ({ lat: o.coordinates.latitude, lng: o.coordinates.longitude })),
          destinations: destinations.map(d => ({ lat: d.coordinates.latitude, lng: d.coordinates.longitude })),
          units: UnitSystem.metric,
          key: this.apiKey,
        },
      };

      const response = await this.client.distancematrix(request);
      return response.data;
    } catch (error) {
      console.error('Error getting distance matrix:', error);
      return null;
    }
  }

  async searchRestaurants(location: { lat: number; lng: number }, cuisine?: string): Promise<PlaceDetails[]> {
    try {
      const request: PlacesNearbyRequest = {
        params: {
          location: location,
          radius: 2000,
          type: 'restaurant',
          keyword: cuisine,
          key: this.apiKey,
        },
      };

      const response = await this.client.placesNearby(request);
      
      const restaurants: PlaceDetails[] = [];
      for (const place of response.data.results.slice(0, 10)) { // Limit to 10 results
        if (place.place_id) {
          restaurants.push({
            placeId: place.place_id,
            name: place.name || '',
            address: place.vicinity || '',
            coordinates: {
              latitude: place.geometry?.location?.lat || 0,
              longitude: place.geometry?.location?.lng || 0,
            },
            rating: place.rating,
            priceLevel: place.price_level,
            photos: place.photos?.map((photo: any) => 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
            ),
          });
        }
      }

      return restaurants;
    } catch (error) {
      console.error('Error searching restaurants:', error);
      return [];
    }
  }

  async searchAccommodations(location: { lat: number; lng: number }, type: string = 'lodging'): Promise<PlaceDetails[]> {
    try {
      const request: PlacesNearbyRequest = {
        params: {
          location: location,
          radius: 5000,
          type: 'lodging',
          keyword: type,
          key: this.apiKey,
        },
      };

      const response = await this.client.placesNearby(request);
      
      const accommodations: PlaceDetails[] = [];
      for (const place of response.data.results.slice(0, 15)) { // Limit to 15 results
        if (place.place_id) {
          accommodations.push({
            placeId: place.place_id,
            name: place.name || '',
            address: place.vicinity || '',
            coordinates: {
              latitude: place.geometry?.location?.lat || 0,
              longitude: place.geometry?.location?.lng || 0,
            },
            rating: place.rating,
            priceLevel: place.price_level,
            photos: place.photos?.map((photo: any) => 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
            ),
          });
        }
      }

      return accommodations;
    } catch (error) {
      console.error('Error searching accommodations:', error);
      return [];
    }
  }
}