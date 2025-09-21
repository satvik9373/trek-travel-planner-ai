import { useState } from 'react';
import { Plane, MapPin, Calendar, Users, Star, ArrowRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TripPreferencesForm from '@/components/TripPreferencesForm';
import ItineraryDashboard from '@/components/ItineraryDashboard';
import BookingPage from '@/components/BookingPage';
import SmartAdjustmentsPanel from '@/components/SmartAdjustmentsPanel';

const Index = () => {
  const [currentView, setCurrentView] = useState('hero'); // hero, preferences, itinerary, booking
  const [tripData, setTripData] = useState(null);
  const [showAdjustments, setShowAdjustments] = useState(false);

  const handleStartPlanning = () => {
    setCurrentView('preferences');
  };

  const handleGenerateItinerary = (formData: any) => {
    setTripData(formData);
    setCurrentView('itinerary');
  };

  const handleBooking = () => {
    setCurrentView('booking');
  };

  if (currentView === 'preferences') {
    return <TripPreferencesForm onSubmit={handleGenerateItinerary} onBack={() => setCurrentView('hero')} />;
  }

  if (currentView === 'itinerary') {
    return (
      <>
        <ItineraryDashboard 
          tripData={tripData} 
          onBack={() => setCurrentView('preferences')}
          onBooking={handleBooking}
          onAdjustments={() => setShowAdjustments(true)}
        />
        <SmartAdjustmentsPanel 
          isOpen={showAdjustments} 
          onClose={() => setShowAdjustments(false)} 
        />
      </>
    );
  }

  if (currentView === 'booking') {
    return <BookingPage onBack={() => setCurrentView('itinerary')} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Hero Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Your AI Travel Companion
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Personalized itineraries, real-time updates, one-click booking
              </p>
            </div>
            
            <Button 
              onClick={handleStartPlanning}
              className="travel-button-primary text-lg px-8 py-4 h-auto"
            >
              Plan My Trip
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="travel-card space-y-4 text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Smart Destinations</h3>
              <p className="text-muted-foreground">
                AI-powered recommendations based on your preferences and travel style
              </p>
            </div>

            <div className="travel-card space-y-4 text-center">
              <div className="w-16 h-16 bg-accent-terracotta rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Dynamic Planning</h3>
              <p className="text-muted-foreground">
                Real-time adjustments for weather, availability, and local events
              </p>
            </div>

            <div className="travel-card space-y-4 text-center">
              <div className="w-16 h-16 bg-accent-ocean rounded-2xl flex items-center justify-center mx-auto">
                <Plane className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Seamless Booking</h3>
              <p className="text-muted-foreground">
                Book everything in one place with our integrated travel partners
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-16 space-y-4">
            <div className="flex justify-center items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-accent-warm text-accent-warm" />
              ))}
            </div>
            <p className="text-muted-foreground">
              Trusted by <span className="font-semibold text-foreground">50,000+</span> travelers worldwide
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;