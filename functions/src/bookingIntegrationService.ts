import axios from 'axios';
import { Accommodation, Transportation, Activity, BookingConfirmation } from './types';

export interface EMTInventoryConfig {
  baseUrl: string;
  apiKey: string;
  partnerId: string;
}

export class BookingIntegrationService {
  private emtConfig: EMTInventoryConfig;

  constructor(emtConfig: EMTInventoryConfig) {
    this.emtConfig = emtConfig;
  }

  // EMT Inventory Integration for seamless booking
  async searchAccommodations(
    destination: string,
    checkIn: Date,
    checkOut: Date,
    guests: number
  ): Promise<any[]> {
    try {
      const response = await axios.get(`${this.emtConfig.baseUrl}/accommodations/search`, {
        headers: {
          'Authorization': `Bearer ${this.emtConfig.apiKey}`,
          'Partner-ID': this.emtConfig.partnerId,
          'Content-Type': 'application/json'
        },
        params: {
          destination,
          check_in: checkIn.toISOString().split('T')[0],
          check_out: checkOut.toISOString().split('T')[0],
          guests,
          currency: 'INR'
        }
      });

      return response.data.accommodations.map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        type: this.mapAccommodationType(acc.property_type),
        location: {
          name: acc.name,
          address: acc.address,
          coordinates: {
            latitude: acc.latitude,
            longitude: acc.longitude
          }
        },
        rating: acc.rating,
        pricePerNight: acc.price.amount,
        amenities: acc.amenities,
        photos: acc.images,
        availability: acc.available,
        cancellationPolicy: acc.cancellation_policy,
        bookingInfo: {
          provider: 'EMT',
          bookingUrl: acc.booking_url,
          paymentRequired: true,
          cancellationPolicy: acc.cancellation_policy
        }
      }));
    } catch (error) {
      console.error('Error searching accommodations:', error);
      return [];
    }
  }

  async searchFlights(
    origin: string,
    destination: string,
    departureDate: Date,
    returnDate?: Date,
    passengers: number = 1
  ): Promise<any[]> {
    try {
      const response = await axios.get(`${this.emtConfig.baseUrl}/flights/search`, {
        headers: {
          'Authorization': `Bearer ${this.emtConfig.apiKey}`,
          'Partner-ID': this.emtConfig.partnerId
        },
        params: {
          origin,
          destination,
          departure_date: departureDate.toISOString().split('T')[0],
          return_date: returnDate?.toISOString().split('T')[0],
          passengers,
          class: 'economy'
        }
      });

      return response.data.flights.map((flight: any) => ({
        id: flight.id,
        type: 'flight',
        airline: flight.airline,
        flightNumber: flight.flight_number,
        from: {
          name: flight.origin.city,
          address: flight.origin.airport,
          coordinates: {
            latitude: flight.origin.latitude,
            longitude: flight.origin.longitude
          }
        },
        to: {
          name: flight.destination.city,
          address: flight.destination.airport,
          coordinates: {
            latitude: flight.destination.latitude,
            longitude: flight.destination.longitude
          }
        },
        departureTime: new Date(flight.departure_time),
        arrivalTime: new Date(flight.arrival_time),
        duration: flight.duration,
        cost: flight.price.amount,
        provider: flight.airline,
        bookingInfo: {
          provider: 'EMT',
          bookingUrl: flight.booking_url,
          paymentRequired: true,
          cancellationPolicy: flight.cancellation_policy
        }
      }));
    } catch (error) {
      console.error('Error searching flights:', error);
      return [];
    }
  }

  async searchTrains(
    origin: string,
    destination: string,
    date: Date,
    passengers: number = 1
  ): Promise<any[]> {
    try {
      const response = await axios.get(`${this.emtConfig.baseUrl}/trains/search`, {
        headers: {
          'Authorization': `Bearer ${this.emtConfig.apiKey}`,
          'Partner-ID': this.emtConfig.partnerId
        },
        params: {
          origin,
          destination,
          date: date.toISOString().split('T')[0],
          passengers
        }
      });

      return response.data.trains.map((train: any) => ({
        id: train.id,
        type: 'train',
        trainName: train.name,
        trainNumber: train.number,
        from: {
          name: train.origin.station,
          address: train.origin.address,
          coordinates: {
            latitude: train.origin.latitude,
            longitude: train.origin.longitude
          }
        },
        to: {
          name: train.destination.station,
          address: train.destination.address,
          coordinates: {
            latitude: train.destination.latitude,
            longitude: train.destination.longitude
          }
        },
        departureTime: new Date(train.departure_time),
        arrivalTime: new Date(train.arrival_time),
        duration: train.duration,
        cost: train.price.amount,
        class: train.class,
        provider: 'Indian Railways',
        bookingInfo: {
          provider: 'EMT',
          bookingUrl: train.booking_url,
          paymentRequired: true
        }
      }));
    } catch (error) {
      console.error('Error searching trains:', error);
      return [];
    }
  }

  async searchActivities(
    destination: string,
    category?: string,
    date?: Date
  ): Promise<any[]> {
    try {
      const response = await axios.get(`${this.emtConfig.baseUrl}/activities/search`, {
        headers: {
          'Authorization': `Bearer ${this.emtConfig.apiKey}`,
          'Partner-ID': this.emtConfig.partnerId
        },
        params: {
          destination,
          category,
          date: date?.toISOString().split('T')[0]
        }
      });

      return response.data.activities.map((activity: any) => ({
        id: activity.id,
        name: activity.title,
        description: activity.description,
        category: this.mapActivityCategory(activity.category),
        location: {
          name: activity.location.name,
          address: activity.location.address,
          coordinates: {
            latitude: activity.location.latitude,
            longitude: activity.location.longitude
          }
        },
        duration: activity.duration,
        cost: activity.price.amount,
        rating: activity.rating,
        photos: activity.images,
        availability: activity.slots,
        bookingInfo: {
          provider: 'EMT',
          bookingUrl: activity.booking_url,
          paymentRequired: true,
          cancellationPolicy: activity.cancellation_policy
        },
        openingHours: activity.opening_hours,
        bestTimeToVisit: activity.best_time
      }));
    } catch (error) {
      console.error('Error searching activities:', error);
      return [];
    }
  }

  // Booking methods
  async bookAccommodation(accommodationId: string, bookingDetails: any): Promise<BookingConfirmation> {
    try {
      const response = await axios.post(`${this.emtConfig.baseUrl}/accommodations/${accommodationId}/book`, {
        ...bookingDetails,
        partner_id: this.emtConfig.partnerId
      }, {
        headers: {
          'Authorization': `Bearer ${this.emtConfig.apiKey}`,
          'Partner-ID': this.emtConfig.partnerId
        }
      });

      return {
        itemId: accommodationId,
        confirmationNumber: response.data.confirmation_number,
        provider: 'EMT',
        status: response.data.status === 'confirmed' ? 'confirmed' : 'pending',
        details: response.data
      };
    } catch (error) {
      console.error('Error booking accommodation:', error);
      throw new Error('Accommodation booking failed');
    }
  }

  async bookFlight(flightId: string, bookingDetails: any): Promise<BookingConfirmation> {
    try {
      const response = await axios.post(`${this.emtConfig.baseUrl}/flights/${flightId}/book`, {
        ...bookingDetails,
        partner_id: this.emtConfig.partnerId
      }, {
        headers: {
          'Authorization': `Bearer ${this.emtConfig.apiKey}`,
          'Partner-ID': this.emtConfig.partnerId
        }
      });

      return {
        itemId: flightId,
        confirmationNumber: response.data.pnr,
        provider: 'EMT',
        status: response.data.status === 'confirmed' ? 'confirmed' : 'pending',
        details: response.data
      };
    } catch (error) {
      console.error('Error booking flight:', error);
      throw new Error('Flight booking failed');
    }
  }

  async bookTrain(trainId: string, bookingDetails: any): Promise<BookingConfirmation> {
    try {
      const response = await axios.post(`${this.emtConfig.baseUrl}/trains/${trainId}/book`, {
        ...bookingDetails,
        partner_id: this.emtConfig.partnerId
      }, {
        headers: {
          'Authorization': `Bearer ${this.emtConfig.apiKey}`,
          'Partner-ID': this.emtConfig.partnerId
        }
      });

      return {
        itemId: trainId,
        confirmationNumber: response.data.pnr,
        provider: 'EMT',
        status: response.data.status === 'confirmed' ? 'confirmed' : 'pending',
        details: response.data
      };
    } catch (error) {
      console.error('Error booking train:', error);
      throw new Error('Train booking failed');
    }
  }

  async bookActivity(activityId: string, bookingDetails: any): Promise<BookingConfirmation> {
    try {
      const response = await axios.post(`${this.emtConfig.baseUrl}/activities/${activityId}/book`, {
        ...bookingDetails,
        partner_id: this.emtConfig.partnerId
      }, {
        headers: {
          'Authorization': `Bearer ${this.emtConfig.apiKey}`,
          'Partner-ID': this.emtConfig.partnerId
        }
      });

      return {
        itemId: activityId,
        confirmationNumber: response.data.booking_reference,
        provider: 'EMT',
        status: response.data.status === 'confirmed' ? 'confirmed' : 'pending',
        details: response.data
      };
    } catch (error) {
      console.error('Error booking activity:', error);
      throw new Error('Activity booking failed');
    }
  }

  // Cancel booking
  async cancelBooking(type: string, confirmationNumber: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.emtConfig.baseUrl}/${type}/cancel`, {
        confirmation_number: confirmationNumber,
        partner_id: this.emtConfig.partnerId
      }, {
        headers: {
          'Authorization': `Bearer ${this.emtConfig.apiKey}`,
          'Partner-ID': this.emtConfig.partnerId
        }
      });

      return response.data.status === 'cancelled';
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return false;
    }
  }

  // Get booking status
  async getBookingStatus(type: string, confirmationNumber: string): Promise<any> {
    try {
      const response = await axios.get(`${this.emtConfig.baseUrl}/${type}/status`, {
        headers: {
          'Authorization': `Bearer ${this.emtConfig.apiKey}`,
          'Partner-ID': this.emtConfig.partnerId
        },
        params: {
          confirmation_number: confirmationNumber
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting booking status:', error);
      return null;
    }
  }

  // Helper methods
  private mapAccommodationType(emtType: string): 'hotel' | 'hostel' | 'resort' | 'homestay' {
    const mapping: { [key: string]: 'hotel' | 'hostel' | 'resort' | 'homestay' } = {
      'hotel': 'hotel',
      'hostel': 'hostel',
      'resort': 'resort',
      'guesthouse': 'homestay',
      'homestay': 'homestay',
      'apartment': 'hotel'
    };
    return mapping[emtType.toLowerCase()] || 'hotel';
  }

  private mapActivityCategory(emtCategory: string): string {
    const mapping: { [key: string]: string } = {
      'cultural': 'heritage',
      'historical': 'heritage',
      'adventure': 'adventure',
      'nature': 'nature',
      'food': 'culinary',
      'entertainment': 'nightlife',
      'religious': 'spiritual',
      'shopping': 'shopping',
      'wellness': 'wellness'
    };
    return mapping[emtCategory.toLowerCase()] || emtCategory.toLowerCase();
  }

  // Get availability for specific dates
  async checkAvailability(itemId: string, type: string, dates: Date[]): Promise<boolean> {
    try {
      const response = await axios.get(`${this.emtConfig.baseUrl}/${type}/${itemId}/availability`, {
        headers: {
          'Authorization': `Bearer ${this.emtConfig.apiKey}`,
          'Partner-ID': this.emtConfig.partnerId
        },
        params: {
          dates: dates.map(d => d.toISOString().split('T')[0]).join(',')
        }
      });

      return response.data.available;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }

  // Get real-time pricing
  async getRealTimePricing(itemId: string, type: string, date: Date): Promise<number | null> {
    try {
      const response = await axios.get(`${this.emtConfig.baseUrl}/${type}/${itemId}/pricing`, {
        headers: {
          'Authorization': `Bearer ${this.emtConfig.apiKey}`,
          'Partner-ID': this.emtConfig.partnerId
        },
        params: {
          date: date.toISOString().split('T')[0]
        }
      });

      return response.data.price.amount;
    } catch (error) {
      console.error('Error getting real-time pricing:', error);
      return null;
    }
  }
}