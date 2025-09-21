// Simple test version of Index without auth dependency
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const SimpleIndex = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleStartPlanning = () => {
    alert('Planning started!');
  };

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleSignup = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="px-6 py-4 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            Airborne Atlas
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button className="text-gray-700 hover:text-gray-900 transition-colors">AI Chat</button>
            <button className="text-gray-700 hover:text-gray-900 transition-colors">Plan Trip</button>
            <button className="text-gray-700 hover:text-gray-900 transition-colors">Dashboard</button>
            <button className="text-gray-700 hover:text-gray-900 transition-colors">Real-time</button>
            <button className="text-gray-700 hover:text-gray-900 transition-colors">PWA</button>
          </div>
          
          <div className="flex items-center space-x-4">
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
          <div className="space-y-6 mb-12">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              AI-Powered{' '}
              <span className="text-blue-500 italic">Travel Planning</span>
              <br />
              Made Simple
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Experience personalized itineraries, real-time updates, seamless bookings, 
              and AI assistance—all in one comprehensive travel companion.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mb-12 space-y-4">
            <div>
              <Button 
                onClick={handleStartPlanning}
                className="bg-black text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors h-auto mr-4"
              >
                Start Planning My Trip
              </Button>
              <Button 
                variant="outline"
                className="px-8 py-4 rounded-lg text-lg font-medium h-auto"
              >
                Try AI Chat
              </Button>
            </div>
            
            {/* Feature Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button variant="outline" className="h-auto py-2 px-4">
                📊 Dashboard
              </Button>
              <Button variant="outline" className="h-auto py-2 px-4">
                🤖 AI Chat
              </Button>
              <Button variant="outline" className="h-auto py-2 px-4">
                ⚡ Real-time Features
              </Button>
              <Button variant="outline" className="h-auto py-2 px-4">
                📱 Install App
              </Button>
            </div>
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

      {/* Modal placeholder */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Authentication</h2>
            <p className="mb-4">Login/Signup modal would appear here</p>
            <Button onClick={() => setShowAuthModal(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleIndex;