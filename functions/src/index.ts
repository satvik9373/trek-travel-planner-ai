import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { AITripGeneratorService } from './aiTripGeneratorService';
import { TripRequest, GeneratedItinerary, User, UserPreferences } from './types';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Initialize services (API keys will be set as environment variables)
const GEMINI_API_KEY = functions.config().gemini?.api_key || process.env.GEMINI_API_KEY;
const GOOGLE_MAPS_API_KEY = functions.config().google?.maps_api_key || process.env.GOOGLE_MAPS_API_KEY;

let tripGenerator: AITripGeneratorService;
if (GEMINI_API_KEY && GOOGLE_MAPS_API_KEY) {
  tripGenerator = new AITripGeneratorService(GEMINI_API_KEY, GOOGLE_MAPS_API_KEY);
}

// CORS configuration
const corsHandler = (req: any, res: any, next: any) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  next();
};

// Authentication middleware
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Create a new trip request and generate itinerary
export const generateItinerary = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Verify authentication
      await requireAuth(req, res, async () => {
        if (!tripGenerator) {
          return res.status(500).json({ error: 'Trip generator not initialized. Please configure API keys.' });
        }

        const {
          destination,
          startDate,
          endDate,
          budget,
          groupSize,
          interests,
          travelStyle,
          accommodationType,
          transportPreference,
          specialRequirements
        } = req.body;

        // Validate required fields
        if (!destination || !startDate || !endDate || !budget) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create trip request
        const tripRequest: TripRequest = {
          id: uuidv4(),
          userId: req.user.uid,
          destination,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          budget: {
            min: budget.min,
            max: budget.max,
            currency: budget.currency || 'INR'
          },
          groupSize: groupSize || 1,
          interests: interests || [],
          travelStyle: travelStyle || 'mid-range',
          accommodationType: accommodationType || 'any',
          transportPreference: transportPreference || 'any',
          specialRequirements,
          createdAt: new Date(),
          status: 'generating'
        };

        // Save trip request to Firestore
        await db.collection('tripRequests').doc(tripRequest.id).set(tripRequest);

        // Generate itinerary using AI
        const itinerary = await tripGenerator.generateItinerary(tripRequest);

        // Save generated itinerary to Firestore
        await db.collection('itineraries').doc(itinerary.id).set({
          ...itinerary,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update trip request status
        await db.collection('tripRequests').doc(tripRequest.id).update({
          status: 'completed'
        });

        res.status(200).json({
          success: true,
          tripRequestId: tripRequest.id,
          itinerary: itinerary
        });
      });
    } catch (error) {
      console.error('Error generating itinerary:', error);
      
      // Update trip request status to failed if it exists
      if (req.body.tripRequestId) {
        await db.collection('tripRequests').doc(req.body.tripRequestId).update({
          status: 'failed'
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to generate itinerary',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Get user's itineraries
export const getUserItineraries = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    await requireAuth(req, res, async () => {
      try {
        const userId = req.user.uid;
        const itinerariesRef = db.collection('itineraries').where('userId', '==', userId);
        const snapshot = await itinerariesRef.get();

        const itineraries: any[] = [];
        snapshot.forEach(doc => {
          itineraries.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json({ itineraries });
      } catch (error) {
        console.error('Error getting itineraries:', error);
        res.status(500).json({ error: 'Failed to get itineraries' });
      }
    });
  });
});

// Get specific itinerary
export const getItinerary = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    await requireAuth(req, res, async () => {
      try {
        const itineraryId = req.query.id as string;
        if (!itineraryId) {
          return res.status(400).json({ error: 'Itinerary ID is required' });
        }

        const doc = await db.collection('itineraries').doc(itineraryId).get();
        if (!doc.exists) {
          return res.status(404).json({ error: 'Itinerary not found' });
        }

        const itinerary = { id: doc.id, ...doc.data() };
        
        // Verify user owns this itinerary
        if (itinerary.userId !== req.user.uid) {
          return res.status(403).json({ error: 'Access denied' });
        }

        res.status(200).json({ itinerary });
      } catch (error) {
        console.error('Error getting itinerary:', error);
        res.status(500).json({ error: 'Failed to get itinerary' });
      }
    });
  });
});

// Update user preferences
export const updateUserPreferences = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'PUT') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    await requireAuth(req, res, async () => {
      try {
        const userId = req.user.uid;
        const preferences: UserPreferences = req.body.preferences;

        await db.collection('users').doc(userId).set({
          uid: userId,
          email: req.user.email,
          displayName: req.user.name,
          preferences,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
      }
    });
  });
});

// Get user preferences
export const getUserPreferences = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    await requireAuth(req, res, async () => {
      try {
        const userId = req.user.uid;
        const doc = await db.collection('users').doc(userId).get();

        if (!doc.exists) {
          return res.status(200).json({ preferences: null });
        }

        const userData = doc.data() as User;
        res.status(200).json({ preferences: userData.preferences || null });
      } catch (error) {
        console.error('Error getting preferences:', error);
        res.status(500).json({ error: 'Failed to get preferences' });
      }
    });
  });
});

// Delete itinerary
export const deleteItinerary = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'DELETE') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    await requireAuth(req, res, async () => {
      try {
        const itineraryId = req.query.id as string;
        if (!itineraryId) {
          return res.status(400).json({ error: 'Itinerary ID is required' });
        }

        const doc = await db.collection('itineraries').doc(itineraryId).get();
        if (!doc.exists) {
          return res.status(404).json({ error: 'Itinerary not found' });
        }

        const itinerary = doc.data();
        
        // Verify user owns this itinerary
        if (itinerary?.userId !== req.user.uid) {
          return res.status(403).json({ error: 'Access denied' });
        }

        await db.collection('itineraries').doc(itineraryId).delete();
        res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error deleting itinerary:', error);
        res.status(500).json({ error: 'Failed to delete itinerary' });
      }
    });
  });
});

// Health check endpoint
export const healthCheck = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      services: {
        geminiAI: !!GEMINI_API_KEY,
        googleMaps: !!GOOGLE_MAPS_API_KEY
      }
    });
  });
});