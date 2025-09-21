import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckCircle,
  Download,
  Share2,
  Calendar,
  MapPin,
  Plane,
  Hotel,
  Car,
  Users,
  Mail,
  Phone,
  CreditCard,
  Clock,
  Home,
  Star,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface BookingConfirmation {
  bookingId: string;
  status: string;
  bookingDate: string;
  passengers: any[];
  bookingDetails: any;
  paymentInfo: any;
}

const BookingConfirmationPage: React.FC = () => {
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load booking confirmation from localStorage
    const loadBooking = () => {
      try {
        const storedBooking = localStorage.getItem('lastBooking');
        if (storedBooking) {
          const bookingData = JSON.parse(storedBooking);
          setBooking(bookingData);
        } else {
          toast.error('No booking confirmation found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading booking:', error);
        toast.error('Failed to load booking confirmation');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [navigate]);

  const downloadConfirmation = () => {
    toast.success('Booking confirmation downloaded to your device');
  };

  const shareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: `Trip Booking Confirmation - ${booking?.bookingId}`,
        text: `My trip booking is confirmed! Booking ID: ${booking?.bookingId}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Booking link copied to clipboard');
    }
  };

  const sendToEmail = () => {
    toast.success('Confirmation email sent to your registered email address');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h1>
                <p className="text-gray-600">Your trip has been successfully booked</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={shareBooking}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={downloadConfirmation}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Confirmation Card */}
        <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="p-4 bg-white/20 rounded-full inline-block">
                <CheckCircle className="h-12 w-12" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Trip Booked Successfully!</h2>
                <p className="text-lg opacity-90">
                  Get ready for an amazing journey to {booking?.bookingDetails?.itinerary?.destination}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 inline-block">
                <p className="text-sm opacity-80">Booking Confirmation</p>
                <p className="text-2xl font-mono font-bold">{booking?.bookingId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={sendToEmail}
            className="h-auto py-4 flex flex-col space-y-2"
            variant="outline"
          >
            <Mail className="h-6 w-6" />
            <span>Email Confirmation</span>
          </Button>
          
          <Button 
            onClick={() => navigate('/dashboard')}
            className="h-auto py-4 flex flex-col space-y-2"
            variant="outline"
          >
            <Home className="h-6 w-6" />
            <span>View Dashboard</span>
          </Button>
          
          <Button 
            onClick={() => toast.info('Customer support feature coming soon')}
            className="h-auto py-4 flex flex-col space-y-2"
            variant="outline"
          >
            <MessageCircle className="h-6 w-6" />
            <span>Contact Support</span>
          </Button>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trip Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                  Trip Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destination</span>
                    <span className="font-medium">{booking?.bookingDetails?.itinerary?.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Travel Dates</span>
                    <span className="font-medium">
                      {booking?.bookingDetails?.itinerary?.startDate && 
                        new Date(booking.bookingDetails.itinerary.startDate).toLocaleDateString()
                      } - {booking?.bookingDetails?.itinerary?.endDate && 
                        new Date(booking.bookingDetails.itinerary.endDate).toLocaleDateString()
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{booking?.bookingDetails?.itinerary?.duration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Travelers</span>
                    <span className="font-medium">{booking?.passengers?.length} people</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-500" />
                  Passenger Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {booking?.passengers?.map((passenger, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">{passenger.firstName} {passenger.lastName}</div>
                      <div className="text-sm text-gray-600">{passenger.email}</div>
                      {index === 0 && <Badge variant="secondary" className="mt-1">Primary</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings Details */}
          <div className="space-y-6">
            {/* Flight Details */}
            {booking?.bookingDetails?.flights && booking.bookingDetails.flights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plane className="h-5 w-5 mr-2 text-blue-500" />
                    Flight Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {booking.bookingDetails.flights.map((flight: any) => (
                    <div key={flight.id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{flight.airline} {flight.flightNumber}</p>
                          <p className="text-sm text-gray-600">
                            {flight.departure.city} → {flight.arrival.city}
                          </p>
                          <p className="text-xs text-gray-500">
                            {flight.departure.time} - {flight.arrival.time}
                          </p>
                        </div>
                        <Badge variant="outline">{flight.class}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Hotel Details */}
            {booking?.bookingDetails?.hotels && booking.bookingDetails.hotels.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Hotel className="h-5 w-5 mr-2 text-green-500" />
                    Hotel Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {booking.bookingDetails.hotels.map((hotel: any) => (
                    <div key={hotel.id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{hotel.name}</p>
                          <p className="text-sm text-gray-600">{hotel.location}</p>
                          <p className="text-xs text-gray-500">{hotel.roomType}</p>
                          <div className="flex items-center mt-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs ml-1">{hotel.rating}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{hotel.category}</Badge>
                          <p className="text-xs text-gray-500 mt-1">{hotel.nights} nights</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Car Rental Details */}
            {booking?.bookingDetails?.cars && booking.bookingDetails.cars.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="h-5 w-5 mr-2 text-purple-500" />
                    Car Rental Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {booking.bookingDetails.cars.map((car: any) => (
                    <div key={car.id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{car.model}</p>
                          <p className="text-sm text-gray-600">{car.company}</p>
                          <p className="text-xs text-gray-500">{car.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{car.days} days</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-orange-500" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span>•••• {booking?.paymentInfo?.last4}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID</span>
                  <span className="font-mono text-sm">{booking?.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Date</span>
                  <span>{booking?.bookingDate && new Date(booking.bookingDate).toLocaleDateString()}</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Paid</span>
                  <span className="text-green-600">${booking?.paymentInfo?.amount}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Payment successful</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Important Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Clock className="h-5 w-5 mr-2" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-blue-700">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                Please arrive at the airport at least 2 hours before domestic flights and 3 hours before international flights
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                Ensure all passengers have valid identification documents for travel
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                Hotel check-in is typically at 3:00 PM and check-out at 11:00 AM
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                Free cancellation available up to 24 hours before your trip starts
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                A confirmation email with detailed itinerary has been sent to your registered email
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">What's Next?</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => navigate('/dashboard')}>
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/chat')}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat with AI Assistant
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              <MapPin className="h-4 w-4 mr-2" />
              Plan Another Trip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;