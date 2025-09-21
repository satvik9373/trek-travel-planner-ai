import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthModal from '@/components/auth/AuthModal';
import TripPreferencesForm from '@/components/TripPreferencesForm';
import ItineraryDashboard from '@/components/ItineraryDashboard';
import BookingPage from '@/components/BookingPage';
import SmartAdjustmentsPanel from '@/components/SmartAdjustmentsPanel';

const Index = () => {
  const [currentView, setCurrentView] = useState('hero'); // hero, preferences, itinerary, booking
  const [tripData, setTripData] = useState(null);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleStartPlanning = () => {
    if (user) {
      navigate('/plan-trip');
    } else {
      setAuthMode('signup');
      setShowAuthModal(true);
    }
  };

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignup = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleGenerateItinerary = (formData: any) => {
    setTripData(formData);
    setCurrentView('itinerary');
  };

  const handleBooking = () => {
    setCurrentView('booking');
  };

  // Navigation functions for the new components
  const navigateToChat = () => navigate('/chat');
  const navigateToPlanTrip = () => navigate('/plan-trip');
  const navigateToDashboard = () => navigate('/dashboard');
  const navigateToRealTime = () => navigate('/real-time');
  const navigateToPWA = () => navigate('/pwa');

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="px-6 py-5 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/Images/trek-logo.png" 
              alt="Trek Logo" 
              className="h-12 w-12 object-contain"
            />
         
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={navigateToChat} className="text-gray-700 hover:text-gray-900 transition-colors font-medium tracking-wide px-2 py-1">AI Chat</button>
            <button onClick={navigateToPlanTrip} className="text-gray-700 hover:text-gray-900 transition-colors font-medium tracking-wide px-2 py-1">Plan Trip</button>
            <button onClick={navigateToDashboard} className="text-gray-700 hover:text-gray-900 transition-colors font-medium tracking-wide px-2 py-1">Dashboard</button>
            <button onClick={navigateToRealTime} className="text-gray-700 hover:text-gray-900 transition-colors font-medium tracking-wide px-2 py-1">Real-time</button>
            <button onClick={navigateToPWA} className="text-gray-700 hover:text-gray-900 transition-colors font-medium tracking-wide px-2 py-1">PWA</button>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">Welcome, {user.email}</span>
                <button 
                  onClick={logout}
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleLogin}
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Log in
                </button>
                <button 
                  onClick={handleSignup}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-6 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Travel Images */}
          <div className="flex justify-center items-center space-x-4 mb-12">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&crop=center" 
                alt="Mountain landscape" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=200&h=200&fit=crop&crop=center" 
                alt="City at night" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop&crop=center" 
                alt="Beach scene" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-8 mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-wide">
              AI-Powered{' '}
              <span className="text-blue-500 italic">Travel Planning</span>
              <br />
              Made Simple
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed tracking-wide font-light">
              Experience personalized itineraries, real-time updates, seamless bookings, 
              and AI assistance—all in one comprehensive travel companion.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mb-16 space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={handleStartPlanning}
                className="bg-black text-white px-10 py-5 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors h-auto tracking-wide"
              >
                {user ? 'Continue Planning' : 'Start Planning My Trip'}
              </Button>
              {!user && (
                <Button 
                  onClick={navigateToChat}
                  variant="outline"
                  className="px-10 py-5 rounded-lg text-lg font-medium h-auto tracking-wide"
                >
                  Try AI Chat
                </Button>
              )}
            </div>
            
            {/* Feature Navigation */}
            {user && (
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <Button onClick={navigateToDashboard} variant="outline" className="h-auto py-3 px-6 text-base font-medium tracking-wide">
                  📊 Dashboard
                </Button>
                <Button onClick={navigateToChat} variant="outline" className="h-auto py-3 px-6 text-base font-medium tracking-wide">
                  🤖 AI Chat
                </Button>
                <Button onClick={navigateToRealTime} variant="outline" className="h-auto py-3 px-6 text-base font-medium tracking-wide">
                  ⚡ Real-time Features
                </Button>
                <Button onClick={navigateToPWA} variant="outline" className="h-auto py-2 px-4">
                  📱 Install App
                </Button>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="space-y-6">
            <p className="text-gray-500 text-sm">Comprehensive Travel Features</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-80">
              <div className="text-center">
                <div className="text-2xl mb-2">🧠</div>
                <div className="text-gray-600 font-medium text-sm">AI Planning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">💬</div>
                <div className="text-gray-600 font-medium text-sm">Smart Chat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📱</div>
                <div className="text-gray-600 font-medium text-sm">PWA Ready</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔄</div>
                <div className="text-gray-600 font-medium text-sm">Real-time</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authMode}
      />
    </div>
  );
};

export default Index;