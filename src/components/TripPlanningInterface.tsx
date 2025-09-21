import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon,
  MapPin,
  Users,
  IndianRupee,
  Search,
  Filter,
  Heart,
  Mountain,
  Camera,
  Utensils,
  Car,
  Plane,
  Train,
  Bus,
  Hotel,
  Home,
  TreePine,
  Waves,
  Building2,
  Sparkles,
  Clock,
  Star,
  Loader2
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface TripPlanningInterfaceProps {
  onTripGenerated?: (tripData: any) => void;
  initialData?: any;
}

interface TripPreferences {
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  budget: number[];
  groupSize: number;
  interests: string[];
  travelStyle: string;
  accommodation: string[];
  transportation: string[];
  activities: string[];
  diningPreferences: string[];
  specialRequirements: string;
}

const TripPlanningInterface: React.FC<TripPlanningInterfaceProps> = ({
  onTripGenerated,
  initialData
}) => {
  const [activeTab, setActiveTab] = useState('destination');
  const [preferences, setPreferences] = useState<TripPreferences>({
    destination: '',
    startDate: null,
    endDate: null,
    budget: [25000, 100000], // Default budget range in INR
    groupSize: 2,
    interests: [],
    travelStyle: '',
    accommodation: [],
    transportation: [],
    activities: [],
    diningPreferences: [],
    specialRequirements: ''
  });

  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Popular destinations in India
  const popularDestinations = [
    'Goa', 'Kerala', 'Rajasthan', 'Himachal Pradesh', 'Uttarakhand',
    'Kashmir', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Gujarat',
    'West Bengal', 'Andaman & Nicobar', 'Ladakh', 'Meghalaya', 'Sikkim'
  ];

  // Interest categories
  const interests = [
    { id: 'culture', name: 'Culture & Heritage', icon: Building2, color: 'bg-orange-100 text-orange-600' },
    { id: 'adventure', name: 'Adventure Sports', icon: Mountain, color: 'bg-green-100 text-green-600' },
    { id: 'nature', name: 'Nature & Wildlife', icon: TreePine, color: 'bg-emerald-100 text-emerald-600' },
    { id: 'beaches', name: 'Beaches & Coast', icon: Waves, color: 'bg-blue-100 text-blue-600' },
    { id: 'food', name: 'Food & Cuisine', icon: Utensils, color: 'bg-red-100 text-red-600' },
    { id: 'photography', name: 'Photography', icon: Camera, color: 'bg-purple-100 text-purple-600' },
    { id: 'spiritual', name: 'Spiritual & Wellness', icon: Heart, color: 'bg-pink-100 text-pink-600' },
    { id: 'nightlife', name: 'Nightlife & Entertainment', icon: Sparkles, color: 'bg-yellow-100 text-yellow-600' }
  ];

  // Travel styles
  const travelStyles = [
    { id: 'budget', name: 'Budget Traveler', description: 'Cost-effective options, local transport, budget stays' },
    { id: 'comfort', name: 'Comfortable', description: 'Good balance of comfort and value, mid-range options' },
    { id: 'luxury', name: 'Luxury', description: 'Premium experiences, high-end accommodations, private transport' },
    { id: 'backpacker', name: 'Backpacker', description: 'Hostels, local experiences, off-the-beaten-path' },
    { id: 'family', name: 'Family Friendly', description: 'Kid-friendly activities, family accommodations, safe transport' },
    { id: 'romantic', name: 'Romantic', description: 'Couples experiences, romantic dining, intimate settings' }
  ];

  // Accommodation types
  const accommodationTypes = [
    { id: 'hotel', name: 'Hotels', icon: Hotel },
    { id: 'resort', name: 'Resorts', icon: Building2 },
    { id: 'homestay', name: 'Homestays', icon: Home },
    { id: 'hostel', name: 'Hostels', icon: Building2 },
    { id: 'villa', name: 'Villas', icon: Home },
    { id: 'camping', name: 'Camping', icon: TreePine }
  ];

  // Transportation options
  const transportationOptions = [
    { id: 'flight', name: 'Flights', icon: Plane },
    { id: 'train', name: 'Trains', icon: Train },
    { id: 'bus', name: 'Buses', icon: Bus },
    { id: 'car', name: 'Car Rental', icon: Car },
    { id: 'taxi', name: 'Taxi/Cab', icon: Car },
    { id: 'local', name: 'Local Transport', icon: Bus }
  ];

  useEffect(() => {
    if (initialData) {
      setPreferences(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleDestinationSearch = (query: string) => {
    setPreferences(prev => ({ ...prev, destination: query }));
    
    if (query.length > 0) {
      const filtered = popularDestinations.filter(dest => 
        dest.toLowerCase().includes(query.toLowerCase())
      );
      setDestinationSuggestions(filtered);
    } else {
      setDestinationSuggestions([]);
    }
  };

  const handleInterestToggle = (interestId: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const handleAccommodationToggle = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      accommodation: prev.accommodation.includes(type)
        ? prev.accommodation.filter(t => t !== type)
        : [...prev.accommodation, type]
    }));
  };

  const handleTransportationToggle = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      transportation: prev.transportation.includes(type)
        ? prev.transportation.filter(t => t !== type)
        : [...prev.transportation, type]
    }));
  };

  const formatBudget = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  const calculateDays = () => {
    if (preferences.startDate && preferences.endDate) {
      const diffTime = Math.abs(preferences.endDate.getTime() - preferences.startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const handleGenerateTrip = async () => {
    if (!preferences.destination || !preferences.startDate || !preferences.endDate) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // This would integrate with your backend service
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API call
      
      const tripData = {
        ...preferences,
        days: calculateDays(),
        budgetPerDay: preferences.budget[0] / calculateDays(),
        generatedAt: new Date().toISOString()
      };

      if (onTripGenerated) {
        onTripGenerated(tripData);
      }
    } catch (error) {
      console.error('Trip generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormComplete = () => {
    return (
      preferences.destination &&
      preferences.startDate &&
      preferences.endDate &&
      preferences.interests.length > 0 &&
      preferences.travelStyle
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <img 
            src="/Images/trek-logo.png" 
            alt="Trek Logo" 
            className="h-10 w-10 object-contain"
          />
          <h1 className="text-3xl font-bold tracking-wide">Plan Your Perfect Trip</h1>
        </div>
        <p className="text-gray-600 tracking-wide">Create a personalized itinerary tailored to your preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="destination" className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Destination</span>
          </TabsTrigger>
          <TabsTrigger value="dates" className="flex items-center space-x-1">
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Dates</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center space-x-1">
            <IndianRupee className="h-4 w-4" />
            <span className="hidden sm:inline">Budget</span>
          </TabsTrigger>
          <TabsTrigger value="interests" className="flex items-center space-x-1">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Interests</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="flex items-center space-x-1">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Style</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-1">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">More</span>
          </TabsTrigger>
        </TabsList>

        {/* Destination Tab */}
        <TabsContent value="destination">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Where do you want to go?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search destinations..."
                  value={preferences.destination}
                  onChange={(e) => handleDestinationSearch(e.target.value)}
                  className="pl-10"
                />
                
                {destinationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {destinationSuggestions.map((destination) => (
                      <div
                        key={destination}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setPreferences(prev => ({ ...prev, destination }));
                          setDestinationSuggestions([]);
                        }}
                      >
                        {destination}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Popular Destinations</Label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {popularDestinations.map((destination) => (
                    <Badge
                      key={destination}
                      variant={preferences.destination === destination ? "default" : "outline"}
                      className="cursor-pointer justify-center py-2 text-xs"
                      onClick={() => setPreferences(prev => ({ ...prev, destination }))}
                    >
                      {destination}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <Label>Group Size</Label>
                </div>
                <Select
                  value={preferences.groupSize.toString()}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, groupSize: parseInt(value) }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} {size === 1 ? 'person' : 'people'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dates Tab */}
        <TabsContent value="dates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>When are you traveling?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !preferences.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {preferences.startDate ? format(preferences.startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={preferences.startDate || undefined}
                        onSelect={(date) => setPreferences(prev => ({ ...prev, startDate: date || null }))}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !preferences.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {preferences.endDate ? format(preferences.endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={preferences.endDate || undefined}
                        onSelect={(date) => setPreferences(prev => ({ ...prev, endDate: date || null }))}
                        disabled={(date) => date < (preferences.startDate || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {preferences.startDate && preferences.endDate && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Trip Duration: {calculateDays()} days</span>
                  </div>
                </div>
              )}

              {/* Quick Date Presets */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Quick Options</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: 'This Weekend', days: 2 },
                    { label: '3 Days', days: 3 },
                    { label: '1 Week', days: 7 },
                    { label: '2 Weeks', days: 14 }
                  ].map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const start = new Date();
                        const end = addDays(start, preset.days);
                        setPreferences(prev => ({
                          ...prev,
                          startDate: start,
                          endDate: end
                        }));
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IndianRupee className="h-5 w-5" />
                <span>What's your budget?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>Budget Range (per person)</Label>
                  <div className="text-lg font-bold">
                    {formatBudget(preferences.budget[0])} - {formatBudget(preferences.budget[1])}
                  </div>
                </div>
                
                <Slider
                  value={preferences.budget}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, budget: value }))}
                  max={500000}
                  min={5000}
                  step={5000}
                  className="w-full"
                />
                
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>₹5K</span>
                  <span>₹5L</span>
                </div>
              </div>

              {calculateDays() > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-700">
                    <div className="font-medium">Budget Breakdown</div>
                    <div className="text-sm mt-1">
                      Per day: {formatBudget(preferences.budget[0] / calculateDays())} - {formatBudget(preferences.budget[1] / calculateDays())}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      For {preferences.groupSize} {preferences.groupSize === 1 ? 'person' : 'people'} × {calculateDays()} days
                    </div>
                  </div>
                </div>
              )}

              {/* Budget Categories */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Budget Categories</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4 text-center">
                      <div className="font-medium text-green-700">Budget</div>
                      <div className="text-sm text-green-600">₹5K - ₹25K</div>
                      <div className="text-xs mt-1">Local transport, hostels, street food</div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4 text-center">
                      <div className="font-medium text-blue-700">Mid-Range</div>
                      <div className="text-sm text-blue-600">₹25K - ₹75K</div>
                      <div className="text-xs mt-1">Hotels, restaurants, guided tours</div>
                    </CardContent>
                  </Card>
                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4 text-center">
                      <div className="font-medium text-purple-700">Luxury</div>
                      <div className="text-sm text-purple-600">₹75K+</div>
                      <div className="text-xs mt-1">Resorts, fine dining, private tours</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interests Tab */}
        <TabsContent value="interests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>What interests you?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interests.map((interest) => {
                  const IconComponent = interest.icon;
                  const isSelected = preferences.interests.includes(interest.id);
                  
                  return (
                    <Card
                      key={interest.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md",
                        isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                      )}
                      onClick={() => handleInterestToggle(interest.id)}
                    >
                      <CardContent className="flex items-center space-x-3 p-4">
                        <Checkbox checked={isSelected} />
                        <div className={cn("p-2 rounded-full", interest.color)}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{interest.name}</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>What's your travel style?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {travelStyles.map((style) => (
                  <Card
                    key={style.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      preferences.travelStyle === style.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                    )}
                    onClick={() => setPreferences(prev => ({ ...prev, travelStyle: style.id }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox checked={preferences.travelStyle === style.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="font-medium">{style.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{style.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <div className="space-y-6">
            {/* Accommodation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Hotel className="h-5 w-5" />
                  <span>Accommodation Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {accommodationTypes.map((type) => {
                    const IconComponent = type.icon;
                    const isSelected = preferences.accommodation.includes(type.id);
                    
                    return (
                      <Card
                        key={type.id}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-md",
                          isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                        )}
                        onClick={() => handleAccommodationToggle(type.id)}
                      >
                        <CardContent className="flex items-center space-x-2 p-3">
                          <Checkbox checked={isSelected} />
                          <IconComponent className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium">{type.name}</span>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Transportation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="h-5 w-5" />
                  <span>Transportation Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {transportationOptions.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = preferences.transportation.includes(option.id);
                    
                    return (
                      <Card
                        key={option.id}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-md",
                          isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                        )}
                        onClick={() => handleTransportationToggle(option.id)}
                      >
                        <CardContent className="flex items-center space-x-2 p-3">
                          <Checkbox checked={isSelected} />
                          <IconComponent className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium">{option.name}</span>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Special Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Special Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special requirements, dietary restrictions, accessibility needs, or other preferences..."
                  value={preferences.specialRequirements}
                  onChange={(e) => setPreferences(prev => ({ ...prev, specialRequirements: e.target.value }))}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Generate Trip Button */}
      <div className="sticky bottom-6 bg-white p-4 rounded-lg shadow-lg border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {isFormComplete() ? (
              <span className="text-green-600 font-medium">✓ Ready to generate your trip!</span>
            ) : (
              <span>Complete all required fields to generate your trip</span>
            )}
          </div>
          
          <Button
            onClick={handleGenerateTrip}
            disabled={!isFormComplete() || isGenerating}
            className="px-8 py-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate My Trip
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TripPlanningInterface;