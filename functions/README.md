# AI-Powered Personalized Trip Planner Backend

A comprehensive backend system for an AI-powered travel planner that generates personalized, end-to-end itineraries tailored to individual budgets, interests, and real-time conditions with seamless booking capabilities.

## 🚀 Features

### Core Capabilities
- **AI-Powered Itinerary Generation**: Uses Google Gemini AI to create personalized travel itineraries
- **Real-time Adaptations**: Monitors weather, events, and local conditions for smart adjustments
- **Seamless Booking**: Integrates with EMT inventory for one-click booking of accommodations, transport, and activities
- **Payment Processing**: Secure payment handling with Stripe integration
- **Multi-source Data Aggregation**: Combines Google Maps, weather APIs, and local event data
- **Interactive Travel Assistant**: Multilingual support with personalized recommendations

### Technical Stack
- **Firebase Cloud Functions**: Serverless backend architecture
- **Google AI (Gemini)**: Advanced language model for itinerary generation
- **Google Maps API**: Location services, places, and route optimization
- **Firestore**: NoSQL database for real-time data storage
- **Stripe**: Payment processing and transaction management
- **TypeScript**: Type-safe development

## 📁 Project Structure

```
functions/
├── src/
│   ├── index.ts                      # Main Cloud Functions entry point
│   ├── types.ts                      # TypeScript interfaces and types
│   ├── aiTripGeneratorService.ts     # AI-powered itinerary generation
│   ├── googleMapsService.ts          # Google Maps integration
│   ├── paymentService.ts             # Stripe payment processing
│   ├── realTimeAdjustmentService.ts  # Weather and event monitoring
│   └── bookingIntegrationService.ts  # EMT inventory integration
├── package.json                      # Dependencies and scripts
└── tsconfig.json                     # TypeScript configuration
```

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js 18+
- Firebase CLI
- Google Cloud Project with APIs enabled
- API keys for required services

### 2. Install Dependencies
```bash
cd functions
npm install
```

### 3. Configure Environment Variables
Set up the following environment variables in your Firebase project:

```bash
# Set Firebase environment variables
firebase functions:config:set gemini.api_key="your-gemini-api-key"
firebase functions:config:set google.maps_api_key="your-google-maps-api-key"
firebase functions:config:set stripe.secret_key="your-stripe-secret-key"
firebase functions:config:set weather.api_key="your-weather-api-key"
firebase functions:config:set emt.api_key="your-emt-api-key"
firebase functions:config:set emt.base_url="https://api.emt-inventory.com"
firebase functions:config:set emt.partner_id="your-partner-id"
```

### 4. Enable Required APIs
Enable these APIs in your Google Cloud Console:
- Google Maps JavaScript API
- Places API
- Directions API
- Geocoding API
- Distance Matrix API

### 5. Deploy Functions
```bash
# Build the TypeScript code
npm run build

# Deploy to Firebase
firebase deploy --only functions
```

## 🔗 API Endpoints

### Authentication
All endpoints (except health check) require Firebase Authentication token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### Core Endpoints

#### Generate Itinerary
```http
POST /generateItinerary
Content-Type: application/json

{
  "destination": "Goa, India",
  "startDate": "2024-12-20",
  "endDate": "2024-12-25",
  "budget": {
    "min": 30000,
    "max": 50000,
    "currency": "INR"
  },
  "groupSize": 2,
  "interests": ["heritage", "adventure", "culinary"],
  "travelStyle": "mid-range",
  "accommodationType": "hotel",
  "transportPreference": "flight",
  "specialRequirements": "Vegetarian meals"
}
```

#### Get User Itineraries
```http
GET /getUserItineraries
```

#### Get Specific Itinerary
```http
GET /getItinerary?id=<itinerary-id>
```

#### Update User Preferences
```http
PUT /updateUserPreferences
Content-Type: application/json

{
  "preferences": {
    "favoriteDestinations": ["Goa", "Kerala"],
    "travelStyle": "luxury",
    "interests": ["heritage", "wellness"],
    "dietaryRestrictions": ["vegetarian"],
    "language": "en"
  }
}
```

#### Health Check
```http
GET /healthCheck
```

## 📊 Database Schema

### Collections

#### `users`
- User profiles and preferences
- Authentication information
- Travel history

#### `tripRequests`
- Trip generation requests
- Status tracking
- Input parameters

#### `itineraries`
- Generated travel itineraries
- Day-by-day plans
- Cost breakdowns
- Recommendations

#### `bookings`
- Booking transactions
- Payment status
- Confirmation details

#### `realTimeUpdates`
- Weather alerts
- Event notifications
- Smart adjustment suggestions

## 🎯 Key Features Implementation

### AI Itinerary Generation
```typescript
const tripGenerator = new AITripGeneratorService(GEMINI_API_KEY, GOOGLE_MAPS_API_KEY);
const itinerary = await tripGenerator.generateItinerary(tripRequest);
```

### Real-time Adjustments
```typescript
const adjustmentService = new RealTimeAdjustmentService(WEATHER_API_KEY);
const weatherUpdates = await adjustmentService.checkWeatherUpdates(itinerary);
const eventUpdates = await adjustmentService.checkLocalEvents(itinerary);
```

### Seamless Booking
```typescript
const bookingService = new BookingIntegrationService(emtConfig);
const booking = await bookingService.createBookingFromItinerary(userId, itinerary);
const paymentIntent = await paymentService.createPaymentIntent(booking);
```

## 🔒 Security

- Firebase Authentication for user management
- CORS configuration for cross-origin requests
- API key validation for external services
- Secure payment processing with Stripe

## 📈 Scalability

- Serverless architecture with Firebase Cloud Functions
- Automatic scaling based on demand
- NoSQL database for flexible data models
- Microservices architecture for independent scaling

## 🌐 Integration Points

### External APIs
- **Google Gemini AI**: Itinerary generation
- **Google Maps**: Location and routing services
- **OpenWeather**: Weather monitoring
- **Stripe**: Payment processing
- **EMT Inventory**: Booking integration

### Frontend Integration
The backend provides RESTful APIs that can be consumed by:
- React/Next.js web applications
- Mobile applications
- Third-party travel platforms

## 🚦 Getting Started

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd functions
   npm install
   ```

2. **Configure APIs**
   - Get API keys from respective service providers
   - Set up Firebase project
   - Enable required Google Cloud APIs

3. **Deploy**
   ```bash
   npm run build
   firebase deploy --only functions
   ```

4. **Test**
   ```bash
   # Test health endpoint
   curl https://your-region-your-project.cloudfunctions.net/healthCheck
   ```

## 📞 Support

For questions and support:
- Check the documentation
- Review API endpoint specifications
- Test with provided examples
- Monitor Firebase Functions logs for debugging

## 🎉 Success Metrics

- **Personalization**: Tailored itineraries based on user preferences
- **Real-time Adaptability**: Dynamic adjustments for weather and events
- **Booking Efficiency**: One-click booking capabilities
- **User Experience**: Comprehensive travel planning solution
- **Scalability**: Handles multiple concurrent users

The backend is now ready to power your AI travel companion with intelligent itinerary generation, real-time adjustments, and seamless booking capabilities!