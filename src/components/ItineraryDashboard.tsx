import { useState } from 'react';
import { ArrowLeft, MapPin, Clock, DollarSign, ExternalLink, RefreshCw, Heart, Share2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ItineraryDashboardProps {
  tripData: any;
  onBack: () => void;
  onBooking: () => void;
  onAdjustments: () => void;
}

const ItineraryDashboard = ({ tripData, onBack, onBooking, onAdjustments }: ItineraryDashboardProps) => {
  const [selectedDay, setSelectedDay] = useState(1);
  
  // Mock itinerary data
  const itinerary = {
    destination: tripData?.destination || 'Paris',
    totalDays: tripData?.duration?.[0] || 7,
    totalBudget: tripData?.budget?.[0] || 2000,
    theme: tripData?.theme || 'leisure',
    days: [
      {
        day: 1,
        title: 'Arrival & City Center',
        activities: [
          {
            id: 1,
            name: 'Eiffel Tower Visit',
            time: '10:00 AM',
            duration: '2 hours',
            cost: 25,
            type: 'attraction',
            description: 'Iconic tower with stunning city views'
          },
          {
            id: 2,
            name: 'Seine River Cruise',
            time: '2:00 PM',
            duration: '1.5 hours',
            cost: 35,
            type: 'activity',
            description: 'Relaxing cruise along the historic Seine'
          },
          {
            id: 3,
            name: 'Le Comptoir du Relais',
            time: '7:00 PM',
            duration: '2 hours',
            cost: 45,
            type: 'dining',
            description: 'Authentic French bistro experience'
          }
        ]
      },
      {
        day: 2,
        title: 'Art & Culture',
        activities: [
          {
            id: 4,
            name: 'Louvre Museum',
            time: '9:00 AM',
            duration: '3 hours',
            cost: 20,
            type: 'attraction',
            description: 'World-famous art museum'
          },
          {
            id: 5,
            name: 'Tuileries Garden',
            time: '1:00 PM',
            duration: '1 hour',
            cost: 0,
            type: 'activity',
            description: 'Beautiful historic gardens'
          }
        ]
      },
      // More days would be generated based on duration
    ]
  };

  const currentDay = itinerary.days.find(d => d.day === selectedDay) || itinerary.days[0];
  const dayTotalCost = currentDay.activities.reduce((sum, activity) => sum + activity.cost, 0);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'attraction': return '🏛️';
      case 'activity': return '🎯';
      case 'dining': return '🍽️';
      case 'transport': return '🚗';
      default: return '📍';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <img 
                src="/Images/trek-logo.png" 
                alt="Trek Logo" 
                className="h-8 w-8 object-contain"
              />
              <h1 className="text-2xl font-bold text-foreground tracking-wide">Your {itinerary.destination} Adventure</h1>
            </div>
            <p className="text-muted-foreground tracking-wide">{itinerary.totalDays} days • ${itinerary.totalBudget} budget</p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onAdjustments}>
              <Settings className="h-4 w-4 mr-2" />
              Adjustments
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Day Navigation Sidebar */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Itinerary</h3>
            <div className="space-y-2">
              {Array.from({ length: itinerary.totalDays }, (_, i) => i + 1).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    selectedDay === day
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="font-medium">Day {day}</div>
                  <div className="text-sm opacity-80">
                    {day === 1 ? 'Arrival' : day === itinerary.totalDays ? 'Departure' : 'Explore'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Day Header */}
            <div className="travel-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground">
                    Day {currentDay.day}: {currentDay.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {currentDay.activities.length} activities • ${dayTotalCost} estimated cost
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  ${dayTotalCost}
                </Badge>
              </div>
            </div>

            {/* Activities Timeline */}
            <div className="space-y-4">
              {currentDay.activities.map((activity, index) => (
                <div key={activity.id} className="travel-card">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="text-xl">{getActivityIcon(activity.type)}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-card-foreground">
                          {activity.name}
                        </h3>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {activity.cost === 0 ? 'Free' : `$${activity.cost}`}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{activity.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{activity.duration}</span>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground">
                        {activity.description}
                      </p>
                      
                      <div className="flex space-x-3 pt-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Replace
                        </Button>
                        <Button size="sm" className="travel-button-terracotta">
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {index < currentDay.activities.length - 1 && (
                    <div className="flex justify-center mt-4">
                      <div className="w-px h-8 bg-border"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="travel-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-card-foreground">Ready to book this day?</h3>
                  <p className="text-muted-foreground">Total cost: ${dayTotalCost}</p>
                </div>
                <Button className="travel-button-primary" onClick={onBooking}>
                  Book Day {currentDay.day}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDashboard;