import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Cloud,
  CloudRain,
  Sun,
  Thermometer,
  Wind,
  Droplets,
  Eye,
  TrendingDown,
  TrendingUp,
  Bell,
  BellOff,
  Users,
  MessageCircle,
  Share2,
  Edit,
  Send,
  MapPin,
  Calendar,
  IndianRupee,
  Plane,
  Hotel,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  Zap,
  Target,
  Globe,
  Smartphone,
  Settings,
  Volume2,
  VolumeX,
  RefreshCw,
  Plus,
  Minus,
  Star,
  Heart,
  Bookmark,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, addHours, subHours } from 'date-fns';

interface WeatherAlert {
  id: string;
  location: string;
  type: 'severe_weather' | 'temperature_change' | 'precipitation' | 'wind_advisory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  expiresAt: string;
  tripId?: string;
}

interface PriceAlert {
  id: string;
  type: 'flight' | 'hotel' | 'activity' | 'package';
  item: string;
  currentPrice: number;
  targetPrice: number;
  percentageChange: number;
  location: string;
  dates: string;
  timestamp: string;
  isActive: boolean;
  tripId?: string;
}

interface Notification {
  id: string;
  type: 'weather' | 'price' | 'itinerary' | 'group' | 'booking' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  data?: any;
}

interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'organizer' | 'member';
  status: 'online' | 'offline' | 'away';
  joinedAt: string;
}

interface GroupUpdate {
  id: string;
  memberId: string;
  type: 'itinerary_change' | 'booking_update' | 'comment' | 'join' | 'leave';
  content: string;
  timestamp: string;
  data?: any;
}

interface RealTimeFeaturesProps {
  tripId?: string;
  onNotificationClick?: (notification: Notification) => void;
}

const RealTimeFeatures: React.FC<RealTimeFeaturesProps> = ({
  tripId,
  onNotificationClick
}) => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState('weather');
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [groupUpdates, setGroupUpdates] = useState<GroupUpdate[]>([]);
  const [newComment, setNewComment] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    weather: true,
    priceAlerts: true,
    groupUpdates: true,
    bookingReminders: true,
    pushEnabled: true,
    soundEnabled: true
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Initialize real-time connection
    connectWebSocket();
    loadRealTimeData();
    
    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const connectWebSocket = () => {
    if (!isOnline) return;

    try {
      // In real implementation, use your WebSocket server URL
      wsRef.current = new WebSocket('wss://api.airborne-atlas.com/ws');
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        // Subscribe to relevant channels
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          channels: ['weather', 'prices', 'group_updates'],
          tripId,
          userId: user?.uid
        }));
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealtimeMessage(data);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isOnline) {
            connectWebSocket();
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const handleRealtimeMessage = (data: any) => {
    switch (data.type) {
      case 'weather_alert':
        setWeatherAlerts(prev => [data.payload, ...prev]);
        if (notificationSettings.weather) {
          showNotification('Weather Alert', data.payload.title, 'weather');
        }
        break;
      
      case 'price_alert':
        setPriceAlerts(prev => prev.map(alert => 
          alert.id === data.payload.id ? data.payload : alert
        ));
        if (notificationSettings.priceAlerts) {
          showNotification('Price Alert', `Price dropped for ${data.payload.item}`, 'price');
        }
        break;
      
      case 'group_update':
        setGroupUpdates(prev => [data.payload, ...prev]);
        if (notificationSettings.groupUpdates && data.payload.memberId !== user?.uid) {
          showNotification('Group Update', data.payload.content, 'group');
        }
        break;
      
      case 'itinerary_update':
        if (notificationSettings.groupUpdates) {
          showNotification('Itinerary Updated', data.payload.message, 'itinerary');
        }
        break;

      case 'member_status':
        setGroupMembers(prev => prev.map(member => 
          member.id === data.payload.memberId 
            ? { ...member, status: data.payload.status }
            : member
        ));
        break;
    }
  };

  const showNotification = (title: string, message: string, type: string) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type: type as any,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'medium'
    };
    
    setNotifications(prev => [notification, ...prev]);
    toast(title, { description: message });

    // Browser notification if enabled
    if (notificationSettings.pushEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico'
      });
    }

    // Sound notification
    if (notificationSettings.soundEnabled) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => {
        // Sound failed to play, ignore
      });
    }
  };

  const loadRealTimeData = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockWeatherAlerts: WeatherAlert[] = [
        {
          id: 'weather-1',
          location: 'Goa',
          type: 'precipitation',
          severity: 'medium',
          title: 'Heavy Rain Expected',
          description: 'Moderate to heavy rainfall expected in your destination area from 2 PM to 6 PM today.',
          timestamp: new Date().toISOString(),
          expiresAt: addHours(new Date(), 6).toISOString(),
          tripId
        },
        {
          id: 'weather-2',
          location: 'Manali',
          type: 'temperature_change',
          severity: 'low',
          title: 'Temperature Drop',
          description: 'Temperature expected to drop by 8°C overnight. Pack warm clothes.',
          timestamp: subHours(new Date(), 2).toISOString(),
          expiresAt: addHours(new Date(), 12).toISOString(),
          tripId
        }
      ];

      const mockPriceAlerts: PriceAlert[] = [
        {
          id: 'price-1',
          type: 'flight',
          item: 'Delhi to Goa Flight',
          currentPrice: 4500,
          targetPrice: 4000,
          percentageChange: -12,
          location: 'Goa',
          dates: '2024-03-15',
          timestamp: new Date().toISOString(),
          isActive: true,
          tripId
        },
        {
          id: 'price-2',
          type: 'hotel',
          item: 'Beach Resort Goa',
          currentPrice: 8500,
          targetPrice: 7000,
          percentageChange: 8,
          location: 'Goa',
          dates: '2024-03-15 to 2024-03-18',
          timestamp: subHours(new Date(), 1).toISOString(),
          isActive: true,
          tripId
        }
      ];

      const mockGroupMembers: GroupMember[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: '/avatars/john.jpg',
          role: 'organizer',
          status: 'online',
          joinedAt: '2024-01-15'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatar: '/avatars/jane.jpg',
          role: 'member',
          status: 'online',
          joinedAt: '2024-01-16'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          avatar: '/avatars/mike.jpg',
          role: 'member',
          status: 'away',
          joinedAt: '2024-01-16'
        }
      ];

      const mockGroupUpdates: GroupUpdate[] = [
        {
          id: '1',
          memberId: '2',
          type: 'itinerary_change',
          content: 'Jane added "Sunset Beach Walk" to Day 2',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          memberId: '1',
          type: 'booking_update',
          content: 'John confirmed hotel booking at Beach Resort',
          timestamp: subHours(new Date(), 1).toISOString()
        },
        {
          id: '3',
          memberId: '3',
          type: 'comment',
          content: 'Looking forward to this trip! Should we book the water sports package?',
          timestamp: subHours(new Date(), 2).toISOString()
        }
      ];

      setWeatherAlerts(mockWeatherAlerts);
      setPriceAlerts(mockPriceAlerts);
      setGroupMembers(mockGroupMembers);
      setGroupUpdates(mockGroupUpdates);

    } catch (error) {
      console.error('Failed to load real-time data:', error);
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const enablePushNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationSettings(prev => ({ ...prev, pushEnabled: true }));
        toast.success('Push notifications enabled');
      } else {
        toast.error('Push notifications denied');
      }
    }
  };

  const sendGroupMessage = () => {
    if (!newComment.trim()) return;

    const update: GroupUpdate = {
      id: Date.now().toString(),
      memberId: user?.uid || 'current-user',
      type: 'comment',
      content: newComment,
      timestamp: new Date().toISOString()
    };

    setGroupUpdates(prev => [update, ...prev]);
    setNewComment('');

    // Send via WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'group_message',
        payload: update
      }));
    }
  };

  const getWeatherIcon = (type: string) => {
    switch (type) {
      case 'severe_weather': return <CloudRain className="h-5 w-5 text-red-500" />;
      case 'temperature_change': return <Thermometer className="h-5 w-5 text-blue-500" />;
      case 'precipitation': return <Droplets className="h-5 w-5 text-blue-500" />;
      case 'wind_advisory': return <Wind className="h-5 w-5 text-gray-500" />;
      default: return <Cloud className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriceIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="h-4 w-4" />;
      case 'hotel': return <Hotel className="h-4 w-4" />;
      case 'activity': return <Activity className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const renderWeatherMonitoring = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Weather Monitoring</h3>
        <div className="flex items-center space-x-2">
          <Badge variant={isOnline ? "secondary" : "destructive"} className="text-xs">
            {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? 'Connected' : 'Offline'}
          </Badge>
          <Button variant="outline" size="sm" onClick={loadRealTimeData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {weatherAlerts.map((alert) => (
          <Card key={alert.id} className={`border ${getSeverityColor(alert.severity)}`}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white rounded-full">
                  {getWeatherIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{alert.title}</h4>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{alert.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{alert.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(alert.timestamp), 'MMM dd, HH:mm')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {weatherAlerts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Sun className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No weather alerts at this time</p>
          <p className="text-sm">We'll notify you of any weather changes affecting your trip</p>
        </div>
      )}
    </div>
  );

  const renderPriceAlerts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Price Monitoring</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Create Alert
        </Button>
      </div>

      <div className="space-y-4">
        {priceAlerts.map((alert) => (
          <Card key={alert.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {getPriceIcon(alert.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{alert.item}</h4>
                    <p className="text-sm text-gray-600">{alert.location} • {alert.dates}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <div className="text-lg font-bold">₹{alert.currentPrice.toLocaleString()}</div>
                    <Badge variant={alert.percentageChange < 0 ? "secondary" : "destructive"} className="text-xs">
                      {alert.percentageChange < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                      {Math.abs(alert.percentageChange)}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Target: ₹{alert.targetPrice.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Updated {format(new Date(alert.timestamp), 'MMM dd, HH:mm')}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={alert.isActive}
                    onCheckedChange={(checked) => {
                      setPriceAlerts(prev => prev.map(a => 
                        a.id === alert.id ? { ...a, isActive: checked } : a
                      ));
                    }}
                  />
                  <span className="text-xs">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderGroupCollaboration = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Group Collaboration</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Group Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trip Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {groupMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{member.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{member.role}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-3">
              {groupUpdates.map((update) => {
                const member = groupMembers.find(m => m.id === update.memberId);
                return (
                  <div key={update.id} className="flex items-start space-x-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member?.avatar} alt={member?.name} />
                      <AvatarFallback className="text-xs">{member?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">{update.content}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {format(new Date(update.timestamp), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator />
            
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add a comment or update..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendGroupMessage()}
                className="flex-1"
              />
              <Button size="sm" onClick={sendGroupMessage} disabled={!newComment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Notification Settings</h3>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Push Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!notificationSettings.pushEnabled && (
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertDescription>
                Enable push notifications to receive real-time updates even when the app is closed.
                <Button variant="link" className="p-0 ml-2 h-auto" onClick={enablePushNotifications}>
                  Enable Now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {[
              { key: 'weather', label: 'Weather Alerts', description: 'Get notified about weather changes affecting your trip' },
              { key: 'priceAlerts', label: 'Price Alerts', description: 'Receive notifications when prices drop' },
              { key: 'groupUpdates', label: 'Group Updates', description: 'Stay updated on group activities and changes' },
              { key: 'bookingReminders', label: 'Booking Reminders', description: 'Reminders for upcoming bookings and check-ins' },
              { key: 'soundEnabled', label: 'Sound Notifications', description: 'Play sound with notifications' }
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{setting.label}</div>
                  <div className="text-sm text-gray-600">{setting.description}</div>
                </div>
                <Switch
                  checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                  onCheckedChange={(checked) => {
                    setNotificationSettings(prev => ({
                      ...prev,
                      [setting.key]: checked
                    }));
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-time Updates</h1>
          <p className="text-gray-600">Stay informed with live weather, price alerts, and group collaboration</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={isOnline ? "secondary" : "destructive"}>
            {isOnline ? <Zap className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? 'Live Updates' : 'Offline Mode'}
          </Badge>
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="prices">Price Alerts</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="weather">{renderWeatherMonitoring()}</TabsContent>
        <TabsContent value="prices">{renderPriceAlerts()}</TabsContent>
        <TabsContent value="collaboration">{renderGroupCollaboration()}</TabsContent>
        <TabsContent value="notifications">{renderNotificationSettings()}</TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeFeatures;