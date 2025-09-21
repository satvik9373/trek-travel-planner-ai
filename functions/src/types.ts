// Database schema definitions for the AI Trip Planner

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  favoriteDestinations: string[];
  travelStyle: 'budget' | 'mid-range' | 'luxury';
  interests: TravelInterest[];
  dietaryRestrictions: string[];
  accessibility: string[];
  language: string;
}

export type TravelInterest = 
  | 'heritage' 
  | 'nightlife' 
  | 'adventure' 
  | 'culinary' 
  | 'nature' 
  | 'shopping' 
  | 'wellness' 
  | 'photography'
  | 'cultural'
  | 'spiritual';

export interface TripRequest {
  id: string;
  userId: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  groupSize: number;
  interests: TravelInterest[];
  travelStyle: 'budget' | 'mid-range' | 'luxury';
  accommodationType: 'hotel' | 'hostel' | 'resort' | 'homestay' | 'any';
  transportPreference: 'flight' | 'train' | 'bus' | 'car' | 'any';
  specialRequirements?: string;
  createdAt: Date;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

export interface GeneratedItinerary {
  id: string;
  tripRequestId: string;
  userId: string;
  destination: string;
  duration: number; // days
  totalBudget: number;
  currency: string;
  days: DayPlan[];
  accommodations: Accommodation[];
  transport: Transportation[];
  costBreakdown: CostBreakdown;
  recommendations: Recommendation[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface DayPlan {
  day: number;
  date: Date;
  theme: string;
  activities: Activity[];
  meals: Meal[];
  accommodation: string; // accommodation ID
  estimatedBudget: number;
  notes?: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: TravelInterest;
  location: Location;
  duration: number; // hours
  cost: number;
  rating: number;
  bookingInfo?: BookingInfo;
  openingHours?: string;
  bestTimeToVisit?: string;
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  restaurant: string;
  cuisine: string;
  location: Location;
  estimatedCost: number;
  rating?: number;
  specialties: string[];
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'hotel' | 'hostel' | 'resort' | 'homestay';
  location: Location;
  rating: number;
  pricePerNight: number;
  amenities: string[];
  bookingInfo?: BookingInfo;
  checkIn: Date;
  checkOut: Date;
}

export interface Transportation {
  id: string;
  type: 'flight' | 'train' | 'bus' | 'taxi' | 'rental-car';
  from: Location;
  to: Location;
  departureTime: Date;
  arrivalTime: Date;
  cost: number;
  provider: string;
  bookingInfo?: BookingInfo;
}

export interface Location {
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  placeId?: string; // Google Places ID
}

export interface BookingInfo {
  provider: string;
  bookingUrl?: string;
  contactInfo?: string;
  cancellationPolicy?: string;
  paymentRequired: boolean;
}

export interface CostBreakdown {
  accommodation: number;
  transport: number;
  activities: number;
  meals: number;
  miscellaneous: number;
  total: number;
  currency: string;
}

export interface Recommendation {
  type: 'activity' | 'restaurant' | 'accommodation' | 'transport';
  title: string;
  description: string;
  location: Location;
  estimatedCost: number;
  rating: number;
  reasons: string[];
}

export interface Booking {
  id: string;
  userId: string;
  itineraryId: string;
  items: BookingItem[];
  totalAmount: number;
  currency: string;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  stripePaymentIntentId?: string;
  bookingConfirmations: BookingConfirmation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingItem {
  type: 'accommodation' | 'transport' | 'activity';
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  bookingReference?: string;
}

export interface BookingConfirmation {
  itemId: string;
  confirmationNumber: string;
  provider: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  details: any;
}

export interface RealTimeUpdate {
  id: string;
  itineraryId: string;
  type: 'weather' | 'event' | 'closure' | 'delay' | 'recommendation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  suggestedActions: string[];
  affectedItems: string[];
  createdAt: Date;
  acknowledged: boolean;
}

export interface Weather {
  location: string;
  date: Date;
  condition: string;
  temperature: {
    min: number;
    max: number;
    unit: string;
  };
  precipitation: number;
  humidity: number;
  windSpeed: number;
  recommendations: string[];
}