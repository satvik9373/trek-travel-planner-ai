import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Star,
  Phone,
  Mail,
  Globe,
  Download,
  Share2,
  RefreshCw,
  ArrowRight,
  Loader2,
  Building2,
  Car,
  Plane,
  Train,
  Hotel,
  Activity,
  Utensils,
  ShoppingBag,
  Ticket,
  FileText,
  Bell,
  Lock,
  Eye,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Provider {
  id: string;
  name: string;
  logo: string;
  rating: number;
  totalBookings: number;
  responseTime: string;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  paymentMethods: string[];
  features: string[];
}

interface BookingOption {
  id: string;
  providerId: string;
  activityId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: 'INR';
  availability: number;
  duration: string;
  included: string[];
  excluded: string[];
  cancellationPolicy: string;
  instantConfirmation: boolean;
  meetingPoint: string;
  languages: string[];
  groupSize: { min: number; max: number };
  ageRestrictions?: { min?: number; max?: number };
  images: string[];
  highlights: string[];
}

interface Booking {
  id: string;
  bookingReference: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'refunded';
  option: BookingOption;
  provider: Provider;
  bookingDate: string;
  activityDate: string;
  travelers: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  confirmationDetails?: {
    confirmationNumber: string;
    voucher: string;
    meetingInstructions: string;
    contactInfo: { phone: string; email: string };
  };
}

interface BookingIntegrationProps {
  activityId: string;
  activityName: string;
  location: string;
  date: string;
  travelers: number;
  onBookingComplete?: (booking: Booking) => void;
  onClose?: () => void;
}

interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

const BookingIntegration: React.FC<BookingIntegrationProps> = ({
  activityId,
  activityName,
  location,
  date,
  travelers,
  onBookingComplete,
  onClose
}) => {
  const { user, userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<'options' | 'details' | 'payment' | 'confirmation'>('options');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<BookingOption | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: userProfile?.displayName || '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [finalBooking, setFinalBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadBookingOptions();
  }, [activityId]);

  const loadBookingOptions = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, this would fetch from multiple providers
      const mockProviders: Provider[] = [
        {
          id: 'emt-1',
          name: 'Experience My Travel',
          logo: '/providers/emt.png',
          rating: 4.8,
          totalBookings: 15420,
          responseTime: 'Instant',
          cancellationPolicy: 'flexible',
          paymentMethods: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking'],
          features: ['Instant Confirmation', '24/7 Support', 'Local Guides', 'Skip the Line']
        },
        {
          id: 'getyourguide',
          name: 'GetYourGuide',
          logo: '/providers/getyourguide.png',
          rating: 4.6,
          totalBookings: 8750,
          responseTime: '15 mins',
          cancellationPolicy: 'moderate',
          paymentMethods: ['Credit Card', 'PayPal', 'Google Pay'],
          features: ['Reserve Now, Pay Later', 'Mobile Tickets', 'Multilingual Support']
        },
        {
          id: 'viator',
          name: 'Viator',
          logo: '/providers/viator.png',
          rating: 4.5,
          totalBookings: 12300,
          responseTime: '30 mins',
          cancellationPolicy: 'moderate',
          paymentMethods: ['Credit Card', 'Debit Card', 'PayPal'],
          features: ['Lowest Price Guarantee', 'Free Cancellation', 'Expert Reviews']
        }
      ];

      const mockOptions: BookingOption[] = [
        {
          id: 'opt-1',
          providerId: 'emt-1',
          activityId,
          name: `${activityName} - Premium Experience`,
          description: 'Complete guided experience with skip-the-line access and local guide',
          price: 2500,
          originalPrice: 3000,
          currency: 'INR',
          availability: 20,
          duration: '4 hours',
          included: ['Professional guide', 'Skip-the-line tickets', 'Refreshments', 'Photo stops'],
          excluded: ['Meals', 'Personal expenses', 'Gratuities'],
          cancellationPolicy: 'Free cancellation up to 24 hours before',
          instantConfirmation: true,
          meetingPoint: 'Main entrance gate',
          languages: ['English', 'Hindi'],
          groupSize: { min: 1, max: 15 },
          images: ['/activities/premium-1.jpg', '/activities/premium-2.jpg'],
          highlights: ['UNESCO World Heritage Site', 'Local stories and legends', 'Perfect for photography']
        },
        {
          id: 'opt-2',
          providerId: 'getyourguide',
          activityId,
          name: `${activityName} - Standard Tour`,
          description: 'Essential experience with audio guide and entry tickets',
          price: 1800,
          currency: 'INR',
          availability: 35,
          duration: '3 hours',
          included: ['Audio guide', 'Entry tickets', 'Map'],
          excluded: ['Food and drinks', 'Personal guide', 'Transportation'],
          cancellationPolicy: 'Free cancellation up to 48 hours before',
          instantConfirmation: false,
          meetingPoint: 'Visitor center',
          languages: ['English', 'Hindi', 'French'],
          groupSize: { min: 1, max: 25 },
          images: ['/activities/standard-1.jpg'],
          highlights: ['Self-paced exploration', 'Multiple language options', 'Digital map included']
        },
        {
          id: 'opt-3',
          providerId: 'viator',
          activityId,
          name: `${activityName} - Budget Friendly`,
          description: 'Basic entry with self-guided exploration',
          price: 1200,
          currency: 'INR',
          availability: 50,
          duration: '2 hours',
          included: ['Entry ticket', 'Basic information brochure'],
          excluded: ['Guide', 'Audio guide', 'Refreshments'],
          cancellationPolicy: 'Free cancellation up to 72 hours before',
          instantConfirmation: true,
          meetingPoint: 'Ticket counter',
          languages: ['English'],
          groupSize: { min: 1, max: 50 },
          images: ['/activities/budget-1.jpg'],
          highlights: ['Most affordable option', 'Flexible timing', 'Great value for money']
        }
      ];

      setProviders(mockProviders);
      setBookingOptions(mockOptions);
    } catch (error) {
      toast.error('Failed to load booking options');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option: BookingOption) => {
    const provider = providers.find(p => p.id === option.providerId);
    setSelectedOption(option);
    setSelectedProvider(provider || null);
    setCurrentStep('details');
  };

  const handlePayment = async () => {
    if (!selectedOption || !selectedProvider) return;

    setLoading(true);
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const booking: Booking = {
        id: `booking-${Date.now()}`,
        bookingReference: `EMT${Date.now().toString().slice(-6)}`,
        status: 'confirmed',
        option: selectedOption,
        provider: selectedProvider,
        bookingDate: new Date().toISOString(),
        activityDate: date,
        travelers,
        totalAmount: selectedOption.price * travelers,
        paymentStatus: 'paid',
        confirmationDetails: {
          confirmationNumber: `CNF${Date.now().toString().slice(-8)}`,
          voucher: `voucher-${Date.now()}`,
          meetingInstructions: `Meet at ${selectedOption.meetingPoint} 15 minutes before the scheduled time`,
          contactInfo: { phone: '+91-9876543210', email: 'support@provider.com' }
        }
      };

      setFinalBooking(booking);
      setCurrentStep('confirmation');
      onBookingComplete?.(booking);
      toast.success('Booking confirmed successfully!');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCancellationIcon = (policy: string) => {
    switch (policy) {
      case 'flexible': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'moderate': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'strict': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('hotel') || lowerName.includes('stay')) return <Hotel className="h-5 w-5" />;
    if (lowerName.includes('transport') || lowerName.includes('taxi')) return <Car className="h-5 w-5" />;
    if (lowerName.includes('flight')) return <Plane className="h-5 w-5" />;
    if (lowerName.includes('train')) return <Train className="h-5 w-5" />;
    if (lowerName.includes('food') || lowerName.includes('restaurant')) return <Utensils className="h-5 w-5" />;
    if (lowerName.includes('shopping')) return <ShoppingBag className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  const renderBookingOptions = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Experience</h2>
        <p className="text-gray-600">{activityName} in {location}</p>
        <div className="flex items-center justify-center space-x-4 mt-3 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{travelers} travelers</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {bookingOptions.map((option) => {
            const provider = providers.find(p => p.id === option.providerId);
            return (
              <Card key={option.id} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleOptionSelect(option)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          {getActivityIcon(option.name)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{option.name}</h3>
                          <p className="text-gray-600">{option.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{option.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{option.groupSize.min}-{option.groupSize.max} people</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{option.meetingPoint}</span>
                        </div>
                      </div>

                      {provider && (
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{provider.name}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                              <span>{provider.rating}</span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {getCancellationIcon(provider.cancellationPolicy)}
                            <span className="ml-1 capitalize">{provider.cancellationPolicy}</span>
                          </Badge>
                          {option.instantConfirmation && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Instant
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        <strong>Included:</strong> {option.included.slice(0, 3).join(', ')}
                        {option.included.length > 3 && ` +${option.included.length - 3} more`}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="space-y-1">
                        {option.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            ₹{option.originalPrice.toLocaleString()}
                          </div>
                        )}
                        <div className="text-2xl font-bold">
                          ₹{option.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">per person</div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="text-sm text-green-600 font-medium">
                          {option.availability} slots available
                        </div>
                      </div>

                      <Button className="mt-4 w-full">
                        Select Option
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderBookingDetails = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setCurrentStep('options')}>
        ← Back to Options
      </Button>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Booking Details</h2>
        <p className="text-gray-600">Review your selection before payment</p>
      </div>

      {selectedOption && selectedProvider && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getActivityIcon(selectedOption.name)}
                <span>{selectedOption.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{selectedOption.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>Travelers:</span>
                  <span>{travelers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Meeting Point:</span>
                  <span>{selectedOption.meetingPoint}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">What's Included</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {selectedOption.included.map((item, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Not Included</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {selectedOption.excluded.map((item, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <XCircle className="h-3 w-3 text-red-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Price per person:</span>
                  <span>₹{selectedOption.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of travelers:</span>
                  <span>{travelers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{(selectedOption.price * travelers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Taxes & Fees:</span>
                  <span>₹{Math.round(selectedOption.price * travelers * 0.18).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>₹{Math.round(selectedOption.price * travelers * 1.18).toLocaleString()}</span>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Cancellation Policy:</strong> {selectedOption.cancellationPolicy}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a> and <a href="#" className="text-blue-600 hover:underline">Cancellation Policy</a>
                  </Label>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                disabled={!agreeToTerms}
                onClick={() => setCurrentStep('payment')}
              >
                Proceed to Payment
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setCurrentStep('details')}>
        ← Back to Details
      </Button>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Secure Payment</h2>
        <p className="text-gray-600">Your payment information is encrypted and secure</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentDetails.cardNumber}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentDetails.cvv}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, cvv: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameOnCard">Name on Card</Label>
              <Input
                id="nameOnCard"
                value={paymentDetails.nameOnCard}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, nameOnCard: e.target.value }))}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Billing Address</h4>
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={paymentDetails.billingAddress.street}
                  onChange={(e) => setPaymentDetails(prev => ({
                    ...prev,
                    billingAddress: { ...prev.billingAddress, street: e.target.value }
                  }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={paymentDetails.billingAddress.city}
                    onChange={(e) => setPaymentDetails(prev => ({
                      ...prev,
                      billingAddress: { ...prev.billingAddress, city: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={paymentDetails.billingAddress.state}
                    onChange={(e) => setPaymentDetails(prev => ({
                      ...prev,
                      billingAddress: { ...prev.billingAddress, state: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">PIN Code</Label>
                <Input
                  id="pincode"
                  value={paymentDetails.billingAddress.pincode}
                  onChange={(e) => setPaymentDetails(prev => ({
                    ...prev,
                    billingAddress: { ...prev.billingAddress, pincode: e.target.value }
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedOption && (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium">{selectedOption.name}</h4>
                  <p className="text-sm text-gray-600">{activityName} in {location}</p>
                  <div className="text-sm text-gray-600">
                    {new Date(date).toLocaleDateString()} • {travelers} travelers
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{(selectedOption.price * travelers).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Fees:</span>
                    <span>₹{Math.round(selectedOption.price * travelers * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base">
                    <span>Total:</span>
                    <span>₹{Math.round(selectedOption.price * travelers * 1.18).toLocaleString()}</span>
                  </div>
                </div>

                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    Your payment is protected by 256-bit SSL encryption
                  </AlertDescription>
                </Alert>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Complete Secure Payment
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600">Your booking has been successfully processed</p>
      </div>

      {finalBooking && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              <Ticket className="h-5 w-5" />
              <span>Booking Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold">{finalBooking.bookingReference}</div>
                <div className="text-sm text-gray-600">Booking Reference</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Activity:</span>
                  <span className="font-medium">{finalBooking.option.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(finalBooking.activityDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Travelers:</span>
                  <span>{finalBooking.travelers}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Paid:</span>
                  <span className="font-medium">₹{finalBooking.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {finalBooking.status.charAt(0).toUpperCase() + finalBooking.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Provider:</span>
                  <span>{finalBooking.provider.name}</span>
                </div>
              </div>
            </div>

            {finalBooking.confirmationDetails && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Important Information</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                      <span>{finalBooking.confirmationDetails.meetingInstructions}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Phone className="h-4 w-4 mt-0.5 text-gray-500" />
                      <span>{finalBooking.confirmationDetails.contactInfo.phone}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Mail className="h-4 w-4 mt-0.5 text-gray-500" />
                      <span>{finalBooking.confirmationDetails.contactInfo.email}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-center space-x-4 pt-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Download Voucher
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-1" />
                Share Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={onClose} className="mx-auto">
        Continue Planning
      </Button>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Booking Integration</DialogTitle>
          <DialogDescription>Book your travel experience</DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {['options', 'details', 'payment', 'confirmation'].map((step, index) => (
              <div key={step} className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step 
                    ? 'bg-blue-600 text-white' 
                    : index < ['options', 'details', 'payment', 'confirmation'].indexOf(currentStep)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm capitalize">{step}</span>
                {index < 3 && <ChevronRight className="h-4 w-4 text-gray-400" />}
              </div>
            ))}
          </div>
          <Progress 
            value={(['options', 'details', 'payment', 'confirmation'].indexOf(currentStep) + 1) * 25} 
            className="h-2" 
          />
        </div>

        {currentStep === 'options' && renderBookingOptions()}
        {currentStep === 'details' && renderBookingDetails()}
        {currentStep === 'payment' && renderPayment()}
        {currentStep === 'confirmation' && renderConfirmation()}
      </DialogContent>
    </Dialog>
  );
};

export default BookingIntegration;