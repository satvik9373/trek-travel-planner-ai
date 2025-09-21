import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  User,
  MapPin,
  Calendar,
  Star,
  Heart,
  Settings,
  Download,
  Share2,
  Edit,
  Trash2,
  Plus,
  Clock,
  IndianRupee,
  Users,
  Plane,
  Hotel,
  Camera,
  Award,
  Gift,
  Bell,
  CreditCard,
  FileText,
  Eye,
  EyeOff,
  Bookmark,
  TrendingUp,
  Globe,
  Phone,
  Mail,
  Shield,
  Crown,
  Zap,
  Target,
  Trophy,
  Wallet,
  Percent,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO, subDays, subMonths } from 'date-fns';

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  totalCost: number;
  travelers: number;
  imageUrl: string;
  activities: number;
  bookingsConfirmed: number;
  progress: number;
  rating?: number;
  review?: string;
}

interface LoyaltyProgram {
  level: 'Explorer' | 'Adventurer' | 'Wanderer' | 'Globetrotter';
  points: number;
  nextLevelPoints: number;
  benefits: string[];
  tier: number;
}

interface Preference {
  id: string;
  category: string;
  name: string;
  value: boolean;
  description: string;
}

interface Document {
  id: string;
  type: 'passport' | 'visa' | 'ticket' | 'voucher' | 'insurance';
  name: string;
  uploadDate: string;
  expiryDate?: string;
  fileUrl: string;
  tripId?: string;
}

interface UserDashboardProps {
  onNavigateToTrip?: (tripId: string) => void;
  onCreateNewTrip?: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  onNavigateToTrip,
  onCreateNewTrip
}) => {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, fetch from backend
      const mockTrips: Trip[] = [
        {
          id: 'trip-1',
          title: 'Golden Triangle Adventure',
          destination: 'Delhi → Agra → Jaipur',
          startDate: '2024-02-15',
          endDate: '2024-02-22',
          status: 'upcoming',
          totalCost: 45000,
          travelers: 2,
          imageUrl: '/trips/golden-triangle.jpg',
          activities: 12,
          bookingsConfirmed: 8,
          progress: 75
        },
        {
          id: 'trip-2',
          title: 'Kerala Backwaters',
          destination: 'Kochi → Alleppey → Munnar',
          startDate: '2024-01-10',
          endDate: '2024-01-17',
          status: 'completed',
          totalCost: 32000,
          travelers: 4,
          imageUrl: '/trips/kerala.jpg',
          activities: 8,
          bookingsConfirmed: 8,
          progress: 100,
          rating: 5,
          review: 'Amazing experience! The houseboat stay was unforgettable.'
        },
        {
          id: 'trip-3',
          title: 'Goa Beach Getaway',
          destination: 'North Goa → South Goa',
          startDate: '2023-12-20',
          endDate: '2023-12-27',
          status: 'completed',
          totalCost: 28000,
          travelers: 2,
          imageUrl: '/trips/goa.jpg',
          activities: 6,
          bookingsConfirmed: 6,
          progress: 100,
          rating: 4,
          review: 'Great beaches and food. Perfect for relaxation.'
        }
      ];

      const mockPreferences: Preference[] = [
        { id: '1', category: 'Notifications', name: 'Email Updates', value: true, description: 'Receive trip updates via email' },
        { id: '2', category: 'Notifications', name: 'SMS Alerts', value: false, description: 'Get SMS notifications for bookings' },
        { id: '3', category: 'Notifications', name: 'Push Notifications', value: true, description: 'Receive app notifications' },
        { id: '4', category: 'Privacy', name: 'Profile Visibility', value: false, description: 'Make your profile public' },
        { id: '5', category: 'Privacy', name: 'Trip Sharing', value: true, description: 'Allow others to see your trips' },
        { id: '6', category: 'Booking', name: 'Auto-confirm', value: false, description: 'Automatically confirm bookings when available' },
        { id: '7', category: 'Booking', name: 'Price Alerts', value: true, description: 'Get notified of price drops' }
      ];

      const mockDocuments: Document[] = [
        { id: '1', type: 'passport', name: 'Indian Passport', uploadDate: '2024-01-01', expiryDate: '2029-01-01', fileUrl: '/docs/passport.pdf' },
        { id: '2', type: 'ticket', name: 'Flight to Kerala', uploadDate: '2024-01-05', fileUrl: '/docs/flight-ticket.pdf', tripId: 'trip-2' },
        { id: '3', type: 'voucher', name: 'Hotel Booking Confirmation', uploadDate: '2024-01-08', fileUrl: '/docs/hotel-voucher.pdf', tripId: 'trip-2' }
      ];

      const mockLoyalty: LoyaltyProgram = {
        level: 'Adventurer',
        points: 2850,
        nextLevelPoints: 5000,
        tier: 2,
        benefits: [
          'Priority customer support',
          '10% discount on bookings',
          'Free trip planning consultation',
          'Early access to deals'
        ]
      };

      setTrips(mockTrips);
      setPreferences(mockPreferences);
      setDocuments(mockDocuments);
      setLoyaltyProgram(mockLoyalty);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (preferenceId: string, value: boolean) => {
    setPreferences(prev => prev.map(pref => 
      pref.id === preferenceId ? { ...pref, value } : pref
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'ongoing': return <Plane className="h-4 w-4 text-green-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'ongoing': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getLoyaltyIcon = (level: string) => {
    switch (level) {
      case 'Explorer': return <MapPin className="h-5 w-5 text-bronze-500" />;
      case 'Adventurer': return <Target className="h-5 w-5 text-silver-500" />;
      case 'Wanderer': return <Trophy className="h-5 w-5 text-gold-500" />;
      case 'Globetrotter': return <Crown className="h-5 w-5 text-purple-500" />;
      default: return <MapPin className="h-5 w-5" />;
    }
  };

  const calculateTotalSpent = () => {
    return trips.filter(trip => trip.status === 'completed').reduce((sum, trip) => sum + trip.totalCost, 0);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-4 border-white">
              <AvatarImage src={userProfile?.photoURL || ''} alt={userProfile?.displayName || ''} />
              <AvatarFallback className="bg-white text-blue-600 text-lg font-bold">
                {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {userProfile?.displayName || 'Traveler'}!</h1>
              <p className="text-blue-100">Ready for your next adventure?</p>
            </div>
          </div>
          <Button variant="secondary" onClick={onCreateNewTrip}>
            <Plus className="h-4 w-4 mr-2" />
            Plan New Trip
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{trips.length}</div>
              <div className="text-sm text-gray-600">Total Trips</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{trips.filter(t => t.status === 'completed').length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-3 bg-purple-100 rounded-full">
              <IndianRupee className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">₹{Math.round(calculateTotalSpent() / 1000)}K</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{loyaltyProgram?.points || 0}</div>
              <div className="text-sm text-gray-600">Loyalty Points</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Program */}
      {loyaltyProgram && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getLoyaltyIcon(loyaltyProgram.level)}
              <span>Loyalty Program - {loyaltyProgram.level}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Current Points: {loyaltyProgram.points}</span>
              <span>Next Level: {loyaltyProgram.nextLevelPoints - loyaltyProgram.points} points to go</span>
            </div>
            <Progress 
              value={(loyaltyProgram.points / loyaltyProgram.nextLevelPoints) * 100} 
              className="h-2"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {loyaltyProgram.benefits.map((benefit, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Trips */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Trips</CardTitle>
            <Button variant="ghost" onClick={() => setActiveTab('trips')}>
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trips.slice(0, 3).map((trip) => (
              <div key={trip.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                   onClick={() => onNavigateToTrip?.(trip.id)}>
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Camera className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{trip.title}</h3>
                  <p className="text-sm text-gray-600">{trip.destination}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span>{format(parseISO(trip.startDate), 'MMM dd, yyyy')}</span>
                    <span>₹{trip.totalCost.toLocaleString()}</span>
                    <span>{trip.travelers} travelers</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className={getStatusColor(trip.status)}>
                    {getStatusIcon(trip.status)}
                    <span className="ml-1 capitalize">{trip.status}</span>
                  </Badge>
                  {trip.rating && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      <span className="text-xs">{trip.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTrips = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Trips</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={onCreateNewTrip}>
            <Plus className="h-4 w-4 mr-1" />
            New Trip
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <Card key={trip.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onNavigateToTrip?.(trip.id)}>
            <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
              <Camera className="h-8 w-8 text-gray-400" />
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">{trip.title}</h3>
                  <p className="text-sm text-gray-600">{trip.destination}</p>
                </div>
                <Badge variant="secondary" className={getStatusColor(trip.status)}>
                  {getStatusIcon(trip.status)}
                  <span className="ml-1 capitalize">{trip.status}</span>
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Dates:</span>
                  <span>{format(parseISO(trip.startDate), 'MMM dd')} - {format(parseISO(trip.endDate), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cost:</span>
                  <span className="font-semibold">₹{trip.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Travelers:</span>
                  <span>{trip.travelers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Activities:</span>
                  <span>{trip.activities}</span>
                </div>
              </div>

              {trip.progress < 100 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Planning Progress</span>
                    <span>{trip.progress}%</span>
                  </div>
                  <Progress value={trip.progress} className="h-1" />
                </div>
              )}

              {trip.rating && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`h-4 w-4 ${star <= trip.rating! ? 'fill-current text-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{trip.rating}/5</span>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Booking Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trips.filter(trip => trip.bookingsConfirmed > 0).map((trip) => (
                <div key={trip.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{trip.title}</h4>
                    <Badge variant="secondary" className={getStatusColor(trip.status)}>
                      {trip.bookingsConfirmed}/{trip.activities} confirmed
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Destination: {trip.destination}</div>
                    <div>Travel Date: {format(parseISO(trip.startDate), 'MMM dd, yyyy')}</div>
                    <div>Total Cost: ₹{trip.totalCost.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Bookings:</span>
                <span className="font-semibold">
                  {trips.reduce((sum, trip) => sum + trip.bookingsConfirmed, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Confirmed:</span>
                <span className="font-semibold text-green-600">
                  {trips.reduce((sum, trip) => sum + trip.bookingsConfirmed, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-semibold text-yellow-600">0</span>
              </div>
              <div className="flex justify-between">
                <span>Cancelled:</span>
                <span className="font-semibold text-red-600">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Travel Documents</h2>
        <Button onClick={() => setShowDocumentDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => {
          const getDocumentIcon = (type: string) => {
            switch (type) {
              case 'passport': return <FileText className="h-6 w-6 text-blue-500" />;
              case 'visa': return <FileText className="h-6 w-6 text-green-500" />;
              case 'ticket': return <Plane className="h-6 w-6 text-purple-500" />;
              case 'voucher': return <Hotel className="h-6 w-6 text-orange-500" />;
              case 'insurance': return <Shield className="h-6 w-6 text-red-500" />;
              default: return <FileText className="h-6 w-6 text-gray-500" />;
            }
          };

          return (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getDocumentIcon(doc.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{doc.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{doc.type}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Uploaded: {format(parseISO(doc.uploadDate), 'MMM dd, yyyy')}
                    </div>
                    {doc.expiryDate && (
                      <div className="text-xs text-gray-500">
                        Expires: {format(parseISO(doc.expiryDate), 'MMM dd, yyyy')}
                      </div>
                    )}
                    {doc.tripId && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Trip Document
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Account Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userProfile?.photoURL || ''} />
                <AvatarFallback>{userProfile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm">Change Photo</Button>
                <Button variant="outline" size="sm">Remove Photo</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue={userProfile?.displayName || ''} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={user?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="City, Country" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(
                preferences.reduce((acc, pref) => {
                  if (!acc[pref.category]) acc[pref.category] = [];
                  acc[pref.category].push(pref);
                  return acc;
                }, {} as Record<string, Preference[]>)
              ).map(([category, prefs]) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
                    {category}
                  </h4>
                  {prefs.map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{pref.name}</div>
                        <div className="text-sm text-gray-600">{pref.description}</div>
                      </div>
                      <Switch
                        checked={pref.value}
                        onCheckedChange={(checked) => handlePreferenceChange(pref.id, checked)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="trips" className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Trips</span>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-1">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverview()}</TabsContent>
        <TabsContent value="trips">{renderTrips()}</TabsContent>
        <TabsContent value="bookings">{renderBookings()}</TabsContent>
        <TabsContent value="documents">{renderDocuments()}</TabsContent>
        <TabsContent value="settings">{renderSettings()}</TabsContent>
      </Tabs>

      {/* Document Upload Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Travel Document</DialogTitle>
            <DialogDescription>
              Upload your travel documents for easy access during your trips
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <select className="w-full border rounded-md p-2">
                <option value="passport">Passport</option>
                <option value="visa">Visa</option>
                <option value="ticket">Flight Ticket</option>
                <option value="voucher">Hotel Voucher</option>
                <option value="insurance">Travel Insurance</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Document Name</Label>
              <Input placeholder="Enter document name" />
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Drag and drop your file here, or click to browse</p>
              <p className="text-sm text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocumentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowDocumentDialog(false)}>
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;