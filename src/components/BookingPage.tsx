import { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Wallet, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface BookingPageProps {
  onBack: () => void;
}

const BookingPage = ({ onBack }: BookingPageProps) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // Mock booking data
  const bookingData = {
    destination: 'Paris',
    dates: 'Mar 15 - 22, 2024',
    travelers: 2,
    breakdown: {
      flights: 850,
      accommodation: 420,
      activities: 380,
      transport: 150
    }
  };

  const total = Object.values(bookingData.breakdown).reduce((sum, cost) => sum + cost, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <h1 className="text-2xl font-bold text-foreground">Complete Your Booking</h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Booking Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="travel-card">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Trip Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <div>
                    <div className="font-medium text-card-foreground">✈️ Flights</div>
                    <div className="text-sm text-muted-foreground">Round trip for {bookingData.travelers} travelers</div>
                  </div>
                  <div className="font-semibold">${bookingData.breakdown.flights}</div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <div>
                    <div className="font-medium text-card-foreground">🏨 Accommodation</div>
                    <div className="text-sm text-muted-foreground">7 nights, 2 guests</div>
                  </div>
                  <div className="font-semibold">${bookingData.breakdown.accommodation}</div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <div>
                    <div className="font-medium text-card-foreground">🎯 Activities</div>
                    <div className="text-sm text-muted-foreground">Tours and experiences</div>
                  </div>
                  <div className="font-semibold">${bookingData.breakdown.activities}</div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <div>
                    <div className="font-medium text-card-foreground">🚗 Local Transport</div>
                    <div className="text-sm text-muted-foreground">Metro passes and transfers</div>
                  </div>
                  <div className="font-semibold">${bookingData.breakdown.transport}</div>
                </div>
                
                <div className="flex justify-between items-center pt-4 text-lg font-bold">
                  <span className="text-card-foreground">Total</span>
                  <span className="text-primary">${total}</span>
                </div>
              </div>
            </div>

            {/* Protection */}
            <div className="travel-card">
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="h-5 w-5 text-success" />
                <h3 className="font-semibold text-card-foreground">Protected Booking</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-success" />
                  <span>Free cancellation up to 24 hours</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-success" />
                  <span>Price match guarantee</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-success" />
                  <span>24/7 travel support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-3">
            <div className="travel-card space-y-6">
              <h2 className="text-xl font-semibold text-card-foreground">Payment Details</h2>
              
              {/* Payment Method Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:bg-muted/50">
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="h-5 w-5 text-primary" />
                    <Label htmlFor="card" className="font-medium cursor-pointer flex-1">Credit/Debit Card</Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:bg-muted/50">
                    <RadioGroupItem value="upi" id="upi" />
                    <Smartphone className="h-5 w-5 text-primary" />
                    <Label htmlFor="upi" className="font-medium cursor-pointer flex-1">UPI</Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:bg-muted/50">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Wallet className="h-5 w-5 text-primary" />
                    <Label htmlFor="wallet" className="font-medium cursor-pointer flex-1">Digital Wallet</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Card Details (shown when card is selected) */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      className="travel-input"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        className="travel-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        className="travel-input"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardholder">Cardholder Name</Label>
                    <Input
                      id="cardholder"
                      placeholder="John Doe"
                      className="travel-input"
                    />
                  </div>
                </div>
              )}

              {/* Billing Address */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Billing Address</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      placeholder="John"
                      className="travel-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Doe"
                      className="travel-input"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    className="travel-input"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      className="travel-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      placeholder="10001"
                      className="travel-input"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <Button className="w-full travel-button-primary text-lg py-4 h-auto">
                Book Everything Now - ${total}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;