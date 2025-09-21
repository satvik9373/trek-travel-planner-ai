import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Clock,
  MapPin,
  IndianRupee,
  Users,
  Cloud,
  Sun,
  CloudRain,
  Thermometer,
  Calendar,
  Timer,
  Star,
  Camera,
  Utensils,
  Car,
  Plane,
  Hotel,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Share2,
  Download,
  Eye,
  GripVertical,
  Navigation,
  Phone,
  Globe
} from 'lucide-react';
import { format, parseISO, addHours } from 'date-fns';

interface Activity {
  id: string;
  name: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  category: 'sightseeing' | 'food' | 'transport' | 'accommodation' | 'activity' | 'shopping';
  cost: number;
  bookingStatus: 'confirmed' | 'pending' | 'cancelled' | 'available';
  rating?: number;
  images: string[];
  coordinates?: { lat: number; lng: number };
  contactInfo?: { phone?: string; website?: string };
  notes?: string;
}

interface DayItinerary {
  id: string;
  date: string;
  location: string;
  activities: Activity[];
  totalCost: number;
  weather?: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    temperature: { min: number; max: number };
    description: string;
  };
}

interface ItineraryData {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalCost: number;
  groupSize: number;
  status: 'draft' | 'confirmed' | 'completed';
  days: DayItinerary[];
}

interface ItineraryManagementSystemProps {
  itineraryData: ItineraryData;
  onItineraryUpdate?: (updatedItinerary: ItineraryData) => void;
  onBookingRequest?: (activity: Activity) => void;
  isEditable?: boolean;
}

// Sortable Activity Item Component
const SortableActivityItem: React.FC<{
  activity: Activity;
  isEditable: boolean;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
  onBook: (activity: Activity) => void;
}> = ({ activity, isEditable, onEdit, onDelete, onBook }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sightseeing': return <Camera className="h-4 w-4" />;
      case 'food': return <Utensils className="h-4 w-4" />;
      case 'transport': return <Car className="h-4 w-4" />;
      case 'accommodation': return <Hotel className="h-4 w-4" />;
      case 'activity': return <Activity className="h-4 w-4" />;
      case 'shopping': return <Star className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sightseeing': return 'bg-blue-100 text-blue-700';
      case 'food': return 'bg-orange-100 text-orange-700';
      case 'transport': return 'bg-gray-100 text-gray-700';
      case 'accommodation': return 'bg-purple-100 text-purple-700';
      case 'activity': return 'bg-green-100 text-green-700';
      case 'shopping': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`mb-3 hover:shadow-md transition-shadow duration-200 ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {isEditable && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing mt-1 text-gray-400 hover:text-gray-600"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-lg">{activity.name}</h4>
                  <Badge variant="secondary" className={getCategoryColor(activity.category)}>
                    {getCategoryIcon(activity.category)}
                    <span className="ml-1 capitalize">{activity.category}</span>
                  </Badge>
                  {getStatusIcon(activity.bookingStatus)}
                </div>
                
                {activity.description && (
                  <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                )}
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg">₹{activity.cost.toLocaleString()}</div>
                {activity.rating && (
                  <div className="flex items-center space-x-1 text-sm text-yellow-600">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{activity.rating}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{activity.startTime} - {activity.endTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{activity.location}</span>
              </div>
            </div>

            {activity.contactInfo && (
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {activity.contactInfo.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>{activity.contactInfo.phone}</span>
                  </div>
                )}
                {activity.contactInfo.website && (
                  <div className="flex items-center space-x-1">
                    <Globe className="h-3 w-3" />
                    <a href={activity.contactInfo.website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
              </div>
            )}

            {activity.notes && (
              <div className="bg-yellow-50 p-2 rounded text-sm text-yellow-800">
                <strong>Note:</strong> {activity.notes}
              </div>
            )}

            {isEditable && (
              <div className="flex items-center space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(activity)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(activity.id)}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
                {activity.bookingStatus === 'available' && (
                  <Button variant="default" size="sm" onClick={() => onBook(activity)}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Book Now
                  </Button>
                )}
                {activity.coordinates && (
                  <Button variant="outline" size="sm">
                    <Navigation className="h-3 w-3 mr-1" />
                    Directions
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ItineraryManagementSystem: React.FC<ItineraryManagementSystemProps> = ({
  itineraryData,
  onItineraryUpdate,
  onBookingRequest,
  isEditable = true
}) => {
  const [itinerary, setItinerary] = useState<ItineraryData>(itineraryData);
  const [activeView, setActiveView] = useState<'timeline' | 'breakdown' | 'map'>('timeline');
  const [selectedDay, setSelectedDay] = useState<string>(itineraryData.days[0]?.id || '');
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setItinerary(itineraryData);
  }, [itineraryData]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const dayIndex = itinerary.days.findIndex(day => day.id === selectedDay);
      if (dayIndex === -1) return;

      const day = itinerary.days[dayIndex];
      const oldIndex = day.activities.findIndex(activity => activity.id === active.id);
      const newIndex = day.activities.findIndex(activity => activity.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const updatedActivities = arrayMove(day.activities, oldIndex, newIndex);
        
        const updatedItinerary = {
          ...itinerary,
          days: itinerary.days.map((d, index) => 
            index === dayIndex ? { ...d, activities: updatedActivities } : d
          )
        };

        setItinerary(updatedItinerary);
        onItineraryUpdate?.(updatedItinerary);
      }
    }
  };

  const handleActivityEdit = (activity: Activity) => {
    // This would open an edit modal
    console.log('Edit activity:', activity);
  };

  const handleActivityDelete = (activityId: string) => {
    const dayIndex = itinerary.days.findIndex(day => day.id === selectedDay);
    if (dayIndex === -1) return;

    const updatedItinerary = {
      ...itinerary,
      days: itinerary.days.map((day, index) => 
        index === dayIndex 
          ? { 
              ...day, 
              activities: day.activities.filter(a => a.id !== activityId),
              totalCost: day.activities.filter(a => a.id !== activityId).reduce((sum, a) => sum + a.cost, 0)
            }
          : day
      )
    };

    // Recalculate total cost
    updatedItinerary.totalCost = updatedItinerary.days.reduce((sum, day) => sum + day.totalCost, 0);

    setItinerary(updatedItinerary);
    onItineraryUpdate?.(updatedItinerary);
  };

  const handleActivityBook = (activity: Activity) => {
    onBookingRequest?.(activity);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-4 w-4 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-4 w-4 text-blue-500" />;
      default: return <Sun className="h-4 w-4 text-yellow-500" />;
    }
  };

  const selectedDayData = itinerary.days.find(day => day.id === selectedDay);
  
  const costBreakdown = React.useMemo(() => {
    const categories = ['sightseeing', 'food', 'transport', 'accommodation', 'activity', 'shopping'];
    return categories.map(category => {
      const categoryTotal = itinerary.days.reduce((daySum, day) => 
        daySum + day.activities
          .filter(activity => activity.category === category)
          .reduce((actSum, activity) => actSum + activity.cost, 0)
      , 0);
      
      return {
        category,
        total: categoryTotal,
        percentage: (categoryTotal / itinerary.totalCost) * 100
      };
    }).filter(item => item.total > 0);
  }, [itinerary]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{itinerary.title}</h1>
            <p className="text-blue-100 mb-4">{itinerary.destination}</p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{format(parseISO(itinerary.startDate), 'MMM dd')} - {format(parseISO(itinerary.endDate), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4" />
                <span>{itinerary.totalDays} days</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{itinerary.groupSize} travelers</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold mb-1">₹{itinerary.totalCost.toLocaleString()}</div>
            <div className="text-blue-100 text-sm">Total Cost</div>
            <div className="text-blue-200 text-xs mt-1">
              ₹{Math.round(itinerary.totalCost / itinerary.groupSize).toLocaleString()} per person
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <Badge variant="secondary" className="bg-white/20 text-white">
            Status: {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
          </Badge>
          
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Day Selector */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Days</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {itinerary.days.map((day, index) => (
                    <div
                      key={day.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${
                        selectedDay === day.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-transparent'
                      }`}
                      onClick={() => setSelectedDay(day.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Day {index + 1}</div>
                          <div className="text-sm text-gray-600">
                            {format(parseISO(day.date), 'MMM dd')}
                          </div>
                          <div className="text-sm text-gray-600">{day.location}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{day.totalCost.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{day.activities.length} activities</div>
                        </div>
                      </div>
                      
                      {day.weather && (
                        <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                          {getWeatherIcon(day.weather.condition)}
                          <span>{day.weather.temperature.min}°-{day.weather.temperature.max}°C</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activities List */}
            <div className="lg:col-span-3">
              {selectedDayData && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <span>Day {itinerary.days.findIndex(d => d.id === selectedDay) + 1} - {selectedDayData.location}</span>
                        {selectedDayData.weather && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            {getWeatherIcon(selectedDayData.weather.condition)}
                            <span>{selectedDayData.weather.description}</span>
                          </div>
                        )}
                      </CardTitle>
                      
                      {isEditable && (
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Activity
                        </Button>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {format(parseISO(selectedDayData.date), 'EEEE, MMMM dd, yyyy')} • 
                      Total: ₹{selectedDayData.totalCost.toLocaleString()}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {selectedDayData.activities.length > 0 ? (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={selectedDayData.activities.map(a => a.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {selectedDayData.activities.map((activity) => (
                            <SortableActivityItem
                              key={activity.id}
                              activity={activity}
                              isEditable={isEditable}
                              onEdit={handleActivityEdit}
                              onDelete={handleActivityDelete}
                              onBook={handleActivityBook}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No activities planned for this day</p>
                        {isEditable && (
                          <Button className="mt-3" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add First Activity
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Cost Breakdown */}
        <TabsContent value="breakdown">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {costBreakdown.map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="capitalize font-medium">{item.category}</span>
                      <div className="text-right">
                        <div className="font-bold">₹{item.total.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{item.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {itinerary.days.map((day, index) => (
                  <div key={day.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">Day {index + 1}</div>
                      <div className="text-sm text-gray-600">{day.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{day.totalCost.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        {((day.totalCost / itinerary.totalCost) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Map View */}
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-3" />
                  <p>Map integration would be implemented here</p>
                  <p className="text-sm">Google Maps API with route planning</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ItineraryManagementSystem;