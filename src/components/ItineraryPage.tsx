import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ItineraryDashboard from './ItineraryDashboard';
import { toast } from 'sonner';

const ItineraryPage: React.FC = () => {
  const [tripData, setTripData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Try to get trip data from localStorage
    const storedItinerary = localStorage.getItem('currentItinerary');
    
    if (storedItinerary) {
      try {
        const parsedData = JSON.parse(storedItinerary);
        setTripData(parsedData);
      } catch (error) {
        console.error('Error parsing stored itinerary:', error);
        toast.error('Failed to load itinerary');
        navigate('/plan-trip');
      }
    } else {
      // No trip data found, redirect to planning
      toast.error('No itinerary found. Please plan a trip first.');
      navigate('/plan-trip');
    }
  }, [navigate]);

  const handleBack = () => {
    navigate('/plan-trip');
  };

  const handleBooking = () => {
    // Navigate to booking interface
    toast.success('Redirecting to booking...');
    // In a real app, this would navigate to a booking page
    navigate('/booking');
  };

  const handleAdjustments = () => {
    // Navigate back to trip planning with current data
    localStorage.setItem('tripPlanningData', JSON.stringify(tripData));
    navigate('/plan-trip');
    toast.info('You can now adjust your trip preferences');
  };

  if (!tripData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  return (
    <ItineraryDashboard 
      tripData={tripData}
      onBack={handleBack}
      onBooking={handleBooking}
      onAdjustments={handleAdjustments}
    />
  );
};

export default ItineraryPage;