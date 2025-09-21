import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Download,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  HardDrive,
  Cloud,
  CloudOff,
  Bell,
  BellOff,
  Settings,
  Zap,
  Check,
  X,
  AlertCircle,
  MapPin,
  Calendar,
  Camera,
  FileText,
  Users,
  Star,
  Shield,
  Battery,
  Signal,
  Home,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface OfflineData {
  trips: any[];
  itineraries: any[];
  bookings: any[];
  documents: any[];
  userProfile: any;
  preferences: any[];
  lastSync: string;
  totalSize: number;
}

interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: 'trip' | 'itinerary' | 'booking' | 'profile';
  data: any;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

interface CacheStatus {
  size: number;
  maxSize: number;
  usage: number;
  items: {
    type: string;
    count: number;
    size: number;
  }[];
}

const PWAFeatures: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<'installing' | 'installed' | 'updating' | 'error' | null>(null);
  const [backgroundSyncEnabled, setBackgroundSyncEnabled] = useState(true);
  const [offlineMapsEnabled, setOfflineMapsEnabled] = useState(false);

  useEffect(() => {
    initializePWA();
    checkInstallation();
    loadOfflineData();
    checkCacheStatus();
    
    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing your data...');
      syncOfflineData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.info('You\'re now offline. Your data will be saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializePWA = async () => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        setServiceWorkerStatus('installing');
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        registration.addEventListener('updatefound', () => {
          setServiceWorkerStatus('updating');
          const newWorker = registration.installing;
          
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              setServiceWorkerStatus('installed');
              toast.success('App updated! Refresh to use the latest version.');
            }
          });
        });

        setServiceWorkerStatus('installed');
      } catch (error) {
        setServiceWorkerStatus('error');
        console.error('Service Worker registration failed:', error);
      }
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e as PWAInstallPrompt);
    });

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Initialize background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      setBackgroundSyncEnabled(true);
    }
  };

  const checkInstallation = () => {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.matchMedia('(display-mode: fullscreen)').matches ||
        (window as any).navigator?.standalone === true) {
      setIsInstalled(true);
    }
  };

  const installPWA = async () => {
    if (!installPrompt) {
      toast.error('Installation not available. Try adding to home screen from browser menu.');
      return;
    }

    setIsInstalling(true);
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
        toast.success('App installed successfully!');
      } else {
        toast.info('Installation cancelled');
      }
    } catch (error) {
      toast.error('Installation failed');
    } finally {
      setIsInstalling(false);
    }
  };

  const loadOfflineData = async () => {
    try {
      // Simulate loading offline data from IndexedDB
      const mockData: OfflineData = {
        trips: JSON.parse(localStorage.getItem('offline_trips') || '[]'),
        itineraries: JSON.parse(localStorage.getItem('offline_itineraries') || '[]'),
        bookings: JSON.parse(localStorage.getItem('offline_bookings') || '[]'),
        documents: JSON.parse(localStorage.getItem('offline_documents') || '[]'),
        userProfile: JSON.parse(localStorage.getItem('offline_profile') || '{}'),
        preferences: JSON.parse(localStorage.getItem('offline_preferences') || '[]'),
        lastSync: localStorage.getItem('last_sync') || new Date().toISOString(),
        totalSize: 2.5 // MB
      };
      
      setOfflineData(mockData);

      // Load sync queue
      const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
      setSyncQueue(queue);
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const checkCacheStatus = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        
        const items = await Promise.all(
          cacheNames.map(async (name) => {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            const size = keys.length * 50; // Approximate size in KB
            totalSize += size;
            
            return {
              type: name,
              count: keys.length,
              size: size
            };
          })
        );

        setCacheStatus({
          size: totalSize,
          maxSize: 50000, // 50MB limit
          usage: (totalSize / 50000) * 100,
          items
        });
      }
    } catch (error) {
      console.error('Failed to check cache status:', error);
    }
  };

  const syncOfflineData = async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      // Process sync queue
      for (const item of syncQueue) {
        setSyncQueue(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'syncing' } : i
        ));

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setSyncQueue(prev => prev.map(i => 
            i.id === item.id ? { ...i, status: 'completed' } : i
          ));
        } catch (error) {
          setSyncQueue(prev => prev.map(i => 
            i.id === item.id ? { ...i, status: 'failed', retryCount: i.retryCount + 1 } : i
          ));
        }
      }

      // Update last sync time
      localStorage.setItem('last_sync', new Date().toISOString());
      toast.success('Data synchronized successfully!');
      loadOfflineData();
    } catch (error) {
      toast.error('Sync failed. Will retry automatically.');
    } finally {
      setIsSyncing(false);
    }
  };

  const clearOfflineData = async () => {
    try {
      localStorage.removeItem('offline_trips');
      localStorage.removeItem('offline_itineraries');
      localStorage.removeItem('offline_bookings');
      localStorage.removeItem('offline_documents');
      localStorage.removeItem('offline_profile');
      localStorage.removeItem('offline_preferences');
      localStorage.removeItem('sync_queue');
      
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      loadOfflineData();
      checkCacheStatus();
      toast.success('Offline data cleared successfully');
    } catch (error) {
      toast.error('Failed to clear offline data');
    }
  };

  const enableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled');
        // Subscribe to push notifications
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          // Subscribe to push service (implementation would go here)
        }
      } else {
        toast.error('Notifications denied');
      }
    }
  };

  const downloadOfflineMaps = async () => {
    setOfflineMapsEnabled(true);
    toast.info('Downloading offline maps...');
    
    // Simulate map download
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast.success('Offline maps downloaded');
  };

  const renderInstallation = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Install App</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isInstalled ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                App is installed and ready to use offline!
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="text-center py-6">
                <Smartphone className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold mb-2">Install Airborne Atlas</h3>
                <p className="text-gray-600 mb-4">
                  Install our app for the best experience with offline access, push notifications, and faster loading.
                </p>
                
                <div className="flex justify-center space-x-4 mb-4">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <WifiOff className="h-3 w-3" />
                    <span>Offline Access</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Bell className="h-3 w-3" />
                    <span>Push Notifications</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Zap className="h-3 w-3" />
                    <span>Fast Loading</span>
                  </Badge>
                </div>
              </div>

              <Button 
                onClick={installPWA} 
                disabled={!installPrompt || isInstalling}
                className="w-full"
                size="lg"
              >
                {isInstalling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Install App
                  </>
                )}
              </Button>

              {!installPrompt && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Installation not available. You can manually add this site to your home screen from your browser menu.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <Monitor className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <div className="text-sm font-medium">Desktop</div>
              <div className="text-xs text-gray-500">Full-featured experience</div>
            </div>
            <div className="text-center">
              <Tablet className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <div className="text-sm font-medium">Tablet</div>
              <div className="text-xs text-gray-500">Touch-optimized interface</div>
            </div>
            <div className="text-center">
              <Smartphone className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <div className="text-sm font-medium">Mobile</div>
              <div className="text-xs text-gray-500">Native app experience</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOfflineFeatures = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">Offline Features</h3>
          <Badge variant={isOnline ? "secondary" : "destructive"}>
            {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={syncOfflineData} disabled={!isOnline || isSyncing}>
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-1">Sync</span>
          </Button>
          <Button variant="outline" size="sm" onClick={clearOfflineData}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear Cache
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offline Data Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5" />
              <span>Offline Storage</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {offlineData && (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Trips</span>
                    <span>{offlineData.trips.length} items</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Itineraries</span>
                    <span>{offlineData.itineraries.length} items</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bookings</span>
                    <span>{offlineData.bookings.length} items</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Documents</span>
                    <span>{offlineData.documents.length} items</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total Size</span>
                    <span>{offlineData.totalSize.toFixed(1)} MB</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Last synced: {new Date(offlineData.lastSync).toLocaleDateString()}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sync Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="h-5 w-5" />
              <span>Sync Queue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {syncQueue.length > 0 ? (
              <div className="space-y-3">
                {syncQueue.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium capitalize">
                        {item.type} {item.resource}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <Badge 
                      variant={
                        item.status === 'completed' ? 'secondary' : 
                        item.status === 'failed' ? 'destructive' : 'outline'
                      }
                    >
                      {item.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {item.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                      {item.status === 'syncing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Check className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">All changes synced</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cache Status */}
      {cacheStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Cache Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Storage Usage</span>
                <span>{(cacheStatus.size / 1000).toFixed(1)}MB / {(cacheStatus.maxSize / 1000).toFixed(0)}MB</span>
              </div>
              <Progress value={cacheStatus.usage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cacheStatus.items.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-lg font-bold">{item.count}</div>
                  <div className="text-sm text-gray-600 capitalize">{item.type}</div>
                  <div className="text-xs text-gray-500">{(item.size / 1000).toFixed(1)}MB</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPushNotifications = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Push Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable Notifications</div>
              <div className="text-sm text-gray-600">Get updates even when the app is closed</div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={notificationPermission === 'granted' ? 'secondary' : 'outline'}>
                {notificationPermission === 'granted' ? 'Enabled' : 'Disabled'}
              </Badge>
              {notificationPermission !== 'granted' && (
                <Button size="sm" onClick={enableNotifications}>
                  Enable
                </Button>
              )}
            </div>
          </div>

          {notificationPermission === 'granted' && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Notification Types</h4>
              {[
                { key: 'trip_reminders', label: 'Trip Reminders', description: 'Upcoming trip notifications' },
                { key: 'booking_updates', label: 'Booking Updates', description: 'Changes to your bookings' },
                { key: 'weather_alerts', label: 'Weather Alerts', description: 'Weather changes affecting your trips' },
                { key: 'price_alerts', label: 'Price Alerts', description: 'Price drops for your watchlist' },
                { key: 'group_messages', label: 'Group Messages', description: 'Messages from trip members' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{setting.label}</div>
                    <div className="text-sm text-gray-600">{setting.description}</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAdvancedFeatures = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Advanced PWA Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Worker Status */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Service Worker</div>
              <div className="text-sm text-gray-600">Background processing and caching</div>
            </div>
            <Badge variant={serviceWorkerStatus === 'installed' ? 'secondary' : 'outline'}>
              {serviceWorkerStatus === 'installed' ? 'Active' : 'Installing'}
            </Badge>
          </div>

          {/* Background Sync */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Background Sync</div>
              <div className="text-sm text-gray-600">Sync data when connection is restored</div>
            </div>
            <Switch 
              checked={backgroundSyncEnabled}
              onCheckedChange={setBackgroundSyncEnabled}
            />
          </div>

          {/* Offline Maps */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Offline Maps</div>
              <div className="text-sm text-gray-600">Download maps for offline use</div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={offlineMapsEnabled}
                onCheckedChange={downloadOfflineMaps}
              />
              {!offlineMapsEnabled && (
                <Button size="sm" variant="outline" onClick={downloadOfflineMaps}>
                  Download
                </Button>
              )}
            </div>
          </div>

          {/* App Updates */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto Updates</div>
              <div className="text-sm text-gray-600">Automatically update the app in background</div>
            </div>
            <Switch defaultChecked />
          </div>

          {/* Data Usage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Data Usage Optimization</span>
              <Switch defaultChecked />
            </div>
            <div className="text-sm text-gray-600">
              Reduce data usage by compressing images and limiting background sync
            </div>
          </div>

          {/* Battery Optimization */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Battery Optimization</div>
              <div className="text-sm text-gray-600">Optimize for longer battery life</div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progressive Web App</h1>
          <p className="text-gray-600">Install and use Airborne Atlas offline with full functionality</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={isInstalled ? "secondary" : "outline"}>
            {isInstalled ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Installed
              </>
            ) : (
              <>
                <Download className="h-3 w-3 mr-1" />
                Not Installed
              </>
            )}
          </Badge>
          
          <Badge variant={isOnline ? "secondary" : "destructive"}>
            {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="install">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="install">Installation</TabsTrigger>
          <TabsTrigger value="offline">Offline Features</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="install">{renderInstallation()}</TabsContent>
        <TabsContent value="offline">{renderOfflineFeatures()}</TabsContent>
        <TabsContent value="notifications">{renderPushNotifications()}</TabsContent>
        <TabsContent value="advanced">{renderAdvancedFeatures()}</TabsContent>
      </Tabs>
    </div>
  );
};

export default PWAFeatures;