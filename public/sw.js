const CACHE_NAME = 'airborne-atlas-v1';
const STATIC_CACHE_NAME = 'airborne-atlas-static-v1';
const DYNAMIC_CACHE_NAME = 'airborne-atlas-dynamic-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/App.css',
  '/src/index.css',
  '/public/favicon.ico',
  '/public/placeholder.svg',
  // Add more static assets as needed
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.openweathermap\.org/,
  /^https:\/\/maps\.googleapis\.com/,
  /^https:\/\/firestore\.googleapis\.com/,
];

// Background sync tags
const SYNC_TAGS = {
  TRIP_SYNC: 'trip-sync',
  BOOKING_SYNC: 'booking-sync',
  PROFILE_SYNC: 'profile-sync'
};

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Install event');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME)
        .then(cache => {
          console.log('Service Worker: Caching static assets');
          return cache.addAll(STATIC_ASSETS);
        }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activate event');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(request)) {
    // Cache first for static assets
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
  } else if (isAPIRequest(request)) {
    // Network first for API requests with fallback
    event.respondWith(networkFirstWithFallback(request, DYNAMIC_CACHE_NAME));
  } else if (isImageRequest(request)) {
    // Cache first for images with network fallback
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE_NAME));
  } else {
    // Network first for everything else
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
  }
});

// Background sync event
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync event', event.tag);
  
  switch (event.tag) {
    case SYNC_TAGS.TRIP_SYNC:
      event.waitUntil(syncTrips());
      break;
    case SYNC_TAGS.BOOKING_SYNC:
      event.waitUntil(syncBookings());
      break;
    case SYNC_TAGS.PROFILE_SYNC:
      event.waitUntil(syncProfile());
      break;
    default:
      console.log('Unknown sync tag:', event.tag);
  }
});

// Push notification event
self.addEventListener('push', event => {
  console.log('Service Worker: Push event');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Airborne Atlas', body: event.data.text() };
    }
  }
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/public/favicon.ico',
    badge: '/public/favicon.ico',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [
      {
        action: 'view',
        title: 'View',
        icon: '/public/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Airborne Atlas', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification click event');
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'dismiss') {
    return;
  }
  
  // Handle notification click
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // If there's already a window open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise, open a new window
        if (clients.openWindow) {
          const url = data.url || '/';
          return clients.openWindow(url);
        }
      })
  );
});

// Message event - handle messages from main thread
self.addEventListener('message', event => {
  console.log('Service Worker: Message event', event.data);
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
      });
      break;
    
    case 'CLEAR_CACHE':
      clearCache(payload.cacheName).then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
    
    case 'SYNC_DATA':
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        self.registration.sync.register(payload.tag);
      }
      break;
  }
});

// Caching strategies
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    
    // Return offline fallback if available
    const cache = await caches.open(STATIC_CACHE_NAME);
    const fallback = await cache.match('/offline.html');
    return fallback || new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network first fallback to cache:', request.url);
    
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline indicator for failed requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This request failed because you are offline.' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function networkFirstWithFallback(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return mock data for API requests when offline
    if (isAPIRequest(request)) {
      return createMockResponse(request);
    }
    
    throw error;
  }
}

// Background sync functions
async function syncTrips() {
  try {
    const trips = await getStoredData('sync_queue_trips');
    
    for (const trip of trips) {
      try {
        const response = await fetch('/api/trips', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trip)
        });
        
        if (response.ok) {
          await removeFromSyncQueue('trips', trip.id);
        }
      } catch (error) {
        console.error('Failed to sync trip:', trip.id, error);
      }
    }
    
    console.log('Trip sync completed');
  } catch (error) {
    console.error('Trip sync failed:', error);
  }
}

async function syncBookings() {
  try {
    const bookings = await getStoredData('sync_queue_bookings');
    
    for (const booking of bookings) {
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(booking)
        });
        
        if (response.ok) {
          await removeFromSyncQueue('bookings', booking.id);
        }
      } catch (error) {
        console.error('Failed to sync booking:', booking.id, error);
      }
    }
    
    console.log('Booking sync completed');
  } catch (error) {
    console.error('Booking sync failed:', error);
  }
}

async function syncProfile() {
  try {
    const profile = await getStoredData('sync_queue_profile');
    
    if (profile) {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile)
      });
      
      if (response.ok) {
        await removeFromSyncQueue('profile', profile.id);
      }
    }
    
    console.log('Profile sync completed');
  } catch (error) {
    console.error('Profile sync failed:', error);
  }
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return STATIC_ASSETS.includes(url.pathname) ||
         url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return API_CACHE_PATTERNS.some(pattern => pattern.test(request.url)) ||
         url.pathname.startsWith('/api/');
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/);
}

function createMockResponse(request) {
  const url = new URL(request.url);
  
  // Return appropriate mock data based on the endpoint
  let mockData = { error: 'Offline', offline: true };
  
  if (url.pathname.includes('/trips')) {
    mockData = { trips: [], offline: true };
  } else if (url.pathname.includes('/bookings')) {
    mockData = { bookings: [], offline: true };
  } else if (url.pathname.includes('/weather')) {
    mockData = { 
      weather: 'Unknown', 
      temperature: 20, 
      offline: true,
      message: 'Weather data unavailable offline'
    };
  }
  
  return new Response(JSON.stringify(mockData), {
    status: 200,
    statusText: 'OK (Offline)',
    headers: { 
      'Content-Type': 'application/json',
      'X-Offline': 'true'
    }
  });
}

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

async function clearCache(cacheName) {
  if (cacheName) {
    return caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    return Promise.all(cacheNames.map(name => caches.delete(name)));
  }
}

async function getStoredData(key) {
  // This would typically use IndexedDB in a real implementation
  // For now, we'll use a simple approach
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get stored data:', error);
    return [];
  }
}

async function removeFromSyncQueue(type, id) {
  try {
    const key = `sync_queue_${type}`;
    const data = await getStoredData(key);
    const filtered = data.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove from sync queue:', error);
  }
}

// Periodic cleanup
setInterval(async () => {
  try {
    const size = await getCacheSize();
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (size > maxSize) {
      console.log('Cache size exceeded, cleaning up...');
      // Implement LRU cache cleanup logic here
      await cleanupOldCache();
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}, 60 * 60 * 1000); // Check every hour

async function cleanupOldCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    
    // Remove oldest 20% of cached items
    const toRemove = requests.slice(0, Math.floor(requests.length * 0.2));
    
    await Promise.all(
      toRemove.map(request => cache.delete(request))
    );
    
    console.log(`Cleaned up ${toRemove.length} cached items`);
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}