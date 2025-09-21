import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Plane,
  Hotel,
  Car,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  CreditCard,
  Shield,
  Check,
  Clock,
  Star,
  Wifi,
  Coffee,
  Utensils,
  Waves,
  Mountain,
  AlertCircle,
  Loader2,
  Heart,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

interface BookingDetails {
  flights: any[];
  hotels: any[];
  cars: any[];
  totalCost: number;
  itinerary: any;
}

interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  passportNumber?: string;
  passportExpiry?: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const BookingInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState('review');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load booking details from localStorage or API
    const loadBookingDetails = async () => {
      try {
        const storedItinerary = localStorage.getItem('currentItinerary');
        if (storedItinerary) {
          const itinerary = JSON.parse(storedItinerary);
          
          // Simulate booking details generation
          setBookingDetails({
            flights: [
              {
                id: 'FL001',
                airline: 'Emirates',
                flightNumber: 'EK234',
                departure: { city: 'New York', airport: 'JFK', time: '14:30' },
                arrival: { city: itinerary.destination, airport: 'CDG', time: '08:15+1' },
                duration: '7h 45m',
                class: 'Economy',
                price: 850,
                amenities: ['WiFi', 'Entertainment', 'Meal']
              }
            ],
            hotels: [
              {
                id: 'HT001',
                name: 'Grand Hotel Plaza',
                category: '4-star',
                location: 'City Center',
                checkIn: itinerary.startDate,
                checkOut: itinerary.endDate,
                roomType: 'Deluxe Double Room',
                price: 120,
                nights: itinerary.duration || 7,
                amenities: ['WiFi', 'Breakfast', 'Pool', 'Gym'],
                rating: 4.5,
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop'
              }
            ],
            cars: [
              {
                id: 'CR001',
                type: 'Compact Car',
                model: 'Toyota Corolla',
                company: 'Hertz',
                pickupDate: itinerary.startDate,
                returnDate: itinerary.endDate,
                price: 35,
                days: itinerary.duration || 7,
                features: ['GPS', 'AC', 'Manual']
              }
            ],
            totalCost: (850 + (120 * 7) + (35 * 7)),
            itinerary
          });

          // Initialize passenger info with user data
          setPassengers([{
            firstName: user?.displayName?.split(' ')[0] || '',
            lastName: user?.displayName?.split(' ')[1] || '',
            email: user?.email || '',
            phone: '',
            dateOfBirth: '',
            passportNumber: '',
            passportExpiry: ''
          }]);
        } else {
          toast.error('No itinerary found. Please plan a trip first.');
          navigate('/plan-trip');
        }
      } catch (error) {
        console.error('Error loading booking details:', error);
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    loadBookingDetails();
  }, [user, navigate]);

  const addPassenger = () => {
    setPassengers([...passengers, {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      passportNumber: '',
      passportExpiry: ''
    }]);
  };

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    const updated = [...passengers];
    (updated[index] as any)[field] = value;
    setPassengers(updated);
  };

  const processBooking = async () => {
    if (!agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    if (passengers.some(p => !p.firstName || !p.lastName || !p.email)) {
      toast.error('Please fill in all passenger information');
      return;
    }

    if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv || !paymentInfo.nameOnCard) {
      toast.error('Please fill in all payment information');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create booking confirmation
      const bookingConfirmation = {
        bookingId: 'BK' + Date.now(),
        status: 'Confirmed',
        bookingDate: new Date().toISOString(),
        passengers,
        bookingDetails,
        paymentInfo: {
          last4: paymentInfo.cardNumber.slice(-4),
          amount: bookingDetails?.totalCost
        }
      };

      // Store booking confirmation
      localStorage.setItem('lastBooking', JSON.stringify(bookingConfirmation));
      
      toast.success('Booking confirmed successfully!');
      navigate('/booking-confirmation');
      
    } catch (error) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderReviewTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Review Your Booking</h2>
        <p className="text-gray-600">Please review your trip details before proceeding to payment.</p>
      </div>

      {/* Flight Details */}
      {bookingDetails?.flights && bookingDetails.flights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plane className="h-5 w-5 mr-2 text-blue-500" />
              Flight Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingDetails.flights.map((flight) => (
              <div key={flight.id} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-semibold">{flight.airline} {flight.flightNumber}</p>
                    <p className="text-sm text-gray-600">
                      {flight.departure.city} ({flight.departure.airport}) → {flight.arrival.city} ({flight.arrival.airport})
                    </p>
                    <p className="text-sm">{flight.departure.time} - {flight.arrival.time}</p>
                    <p className="text-xs text-gray-500">{flight.duration} • {flight.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${flight.price}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {flight.amenities.map((amenity: string) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">{amenity}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Hotel Details */}
      {bookingDetails?.hotels && bookingDetails.hotels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hotel className="h-5 w-5 mr-2 text-green-500" />
              Hotel Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingDetails.hotels.map((hotel) => (
              <div key={hotel.id} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold">{hotel.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{hotel.category}</Badge>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm ml-1">{hotel.rating}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {hotel.location}
                    </p>
                    <p className="text-sm">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {new Date(hotel.checkIn).toLocaleDateString()} - {new Date(hotel.checkOut).toLocaleDateString()}
                    </p>
                    <p className="text-sm">{hotel.roomType} • {hotel.nights} nights</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${hotel.price * hotel.nights}</p>
                    <p className="text-sm text-gray-600">${hotel.price}/night</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hotel.amenities.slice(0, 3).map((amenity: string) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">{amenity}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Car Rental Details */}
      {bookingDetails?.cars && bookingDetails.cars.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2 text-purple-500" />
              Car Rental Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingDetails.cars.map((car) => (
              <div key={car.id} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-semibold">{car.model}</p>
                    <p className="text-sm text-gray-600">{car.type} • {car.company}</p>
                    <p className="text-sm">
                      {new Date(car.pickupDate).toLocaleDateString()} - {new Date(car.returnDate).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {car.features.map((feature: string) => (
                        <Badge key={feature} variant="secondary" className="text-xs">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${car.price * car.days}</p>
                    <p className="text-sm text-gray-600">${car.price}/day • {car.days} days</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Cost Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-orange-500" />
            Cost Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bookingDetails?.flights.map((flight) => (
            <div key={flight.id} className="flex justify-between">
              <span>Flight ({flight.flightNumber})</span>
              <span>${flight.price}</span>
            </div>
          ))}
          {bookingDetails?.hotels.map((hotel) => (
            <div key={hotel.id} className="flex justify-between">
              <span>Hotel ({hotel.nights} nights)</span>
              <span>${hotel.price * hotel.nights}</span>
            </div>
          ))}
          {bookingDetails?.cars.map((car) => (
            <div key={car.id} className="flex justify-between">
              <span>Car Rental ({car.days} days)</span>
              <span>${car.price * car.days}</span>
            </div>
          ))}
          <hr className="my-2" />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${bookingDetails?.totalCost}</span>
          </div>
          <div className="text-sm text-gray-600">
            <p>• All taxes and fees included</p>
            <p>• Free cancellation up to 24 hours before travel</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPassengerTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Passenger Information</h2>
          <p className="text-gray-600">Enter details for all travelers</p>
        </div>
        <Button onClick={addPassenger} variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Add Passenger
        </Button>
      </div>

      {passengers.map((passenger, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg">Passenger {index + 1} {index === 0 && '(Primary)'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`firstName-${index}`}>First Name *</Label>
                <Input
                  id={`firstName-${index}`}
                  value={passenger.firstName}
                  onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor={`lastName-${index}`}>Last Name *</Label>
                <Input
                  id={`lastName-${index}`}
                  value={passenger.lastName}
                  onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`email-${index}`}>Email *</Label>
                <Input
                  id={`email-${index}`}
                  type="email"
                  value={passenger.email}
                  onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor={`phone-${index}`}>Phone Number</Label>
                <Input
                  id={`phone-${index}`}
                  value={passenger.phone}
                  onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`dob-${index}`}>Date of Birth</Label>
                <Input
                  id={`dob-${index}`}
                  type="date"
                  value={passenger.dateOfBirth}
                  onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`passport-${index}`}>Passport Number</Label>
                <Input
                  id={`passport-${index}`}
                  value={passenger.passportNumber || ''}
                  onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                  placeholder="Passport number"
                />
              </div>
              <div>
                <Label htmlFor={`passportExpiry-${index}`}>Passport Expiry</Label>
                <Input
                  id={`passportExpiry-${index}`}
                  type="date"
                  value={passenger.passportExpiry || ''}
                  onChange={(e) => updatePassenger(index, 'passportExpiry', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Special Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Any special requests or requirements (dietary needs, accessibility, etc.)"
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderPaymentTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payment Information</h2>
        <p className="text-gray-600">Secure payment powered by industry-leading encryption</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Card Number *</Label>
            <Input
              id="cardNumber"
              value={paymentInfo.cardNumber}
              onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input
                id="expiryDate"
                value={paymentInfo.expiryDate}
                onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryDate: e.target.value }))}
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                value={paymentInfo.cvv}
                onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="nameOnCard">Name on Card *</Label>
            <Input
              id="nameOnCard"
              value={paymentInfo.nameOnCard}
              onChange={(e) => setPaymentInfo(prev => ({ ...prev, nameOnCard: e.target.value }))}
              placeholder="Full name as on card"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={paymentInfo.billingAddress.street}
              onChange={(e) => setPaymentInfo(prev => ({ 
                ...prev, 
                billingAddress: { ...prev.billingAddress, street: e.target.value }
              }))}
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={paymentInfo.billingAddress.city}
                onChange={(e) => setPaymentInfo(prev => ({ 
                  ...prev, 
                  billingAddress: { ...prev.billingAddress, city: e.target.value }
                }))}
                placeholder="New York"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={paymentInfo.billingAddress.state}
                onChange={(e) => setPaymentInfo(prev => ({ 
                  ...prev, 
                  billingAddress: { ...prev.billingAddress, state: e.target.value }
                }))}
                placeholder="NY"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={paymentInfo.billingAddress.zipCode}
                onChange={(e) => setPaymentInfo(prev => ({ 
                  ...prev, 
                  billingAddress: { ...prev.billingAddress, zipCode: e.target.value }
                }))}
                placeholder="10001"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Select
                value={paymentInfo.billingAddress.country}
                onValueChange={(value) => setPaymentInfo(prev => ({ 
                  ...prev, 
                  billingAddress: { ...prev.billingAddress, country: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
        <Shield className="h-5 w-5 text-green-600 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-green-800">Secure Payment</p>
          <p className="text-xs text-green-700">
            Your payment information is encrypted and processed securely. We never store your card details.
          </p>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="terms"
          checked={agreeToTerms}
          onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
        />
        <div>
          <Label htmlFor="terms" className="text-sm">
            I agree to the{' '}
            <Button variant="link" className="p-0 h-auto text-blue-600">
              Terms and Conditions
            </Button>
            {' '}and{' '}
            <Button variant="link" className="p-0 h-auto text-blue-600">
              Privacy Policy
            </Button>
          </Label>
        </div>
      </div>

      {/* Final Cost */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-blue-600">${bookingDetails?.totalCost}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">All taxes and fees included</p>
        </CardContent>
      </Card>

      {/* Process Payment Button */}
      <Button 
        onClick={processBooking}
        disabled={isProcessing || !agreeToTerms}
        className="w-full py-3 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Complete Booking - ${bookingDetails?.totalCost}
          </>
        )}
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/itinerary')} className="font-medium tracking-wide">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Itinerary
            </Button>
            <div className="flex items-center space-x-3">
              <img 
                src="/Images/trek-logo.png" 
                alt="Trek Logo" 
                className="h-6 w-6 object-contain"
              />
              <CreditCard className="h-5 w-5 text-blue-500" />
              <h1 className="text-xl font-semibold text-gray-900 tracking-wide">Complete Booking</h1>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">${bookingDetails?.totalCost}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="review" className="flex items-center">
              <Check className="h-4 w-4 mr-2" />
              Review
            </TabsTrigger>
            <TabsTrigger value="passengers" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Passengers
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review">
            {renderReviewTab()}
          </TabsContent>

          <TabsContent value="passengers">
            {renderPassengerTab()}
          </TabsContent>

          <TabsContent value="payment">
            {renderPaymentTab()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BookingInterface;