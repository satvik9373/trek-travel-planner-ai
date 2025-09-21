import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  MapPin,
  Calendar,
  DollarSign,
  Plane,
  Hotel,
  Car,
  Camera,
  ArrowLeft,
  Sparkles,
  Globe,
  Clock,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
  tripData?: {
    destination?: string;
    budget?: string;
    duration?: string;
    interests?: string[];
  };
}

const AIChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: '1',
      text: `Hello${user ? ` ${user.email?.split('@')[0]}` : ''}! 👋 I'm your AI travel assistant. I can help you plan amazing trips, find the best destinations, suggest activities, and answer any travel questions you have. What would you like to explore today?`,
      isUser: false,
      timestamp: new Date(),
      suggestions: [
        '🏝️ Plan a tropical vacation',
        '🏔️ Find mountain adventures', 
        '🏛️ Explore historic cities',
        '🍕 Food and culture tours',
        '💰 Budget travel tips',
        '✈️ Flight deals and booking'
      ]
    };
    
    setMessages([welcomeMessage]);
    scrollToBottom();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = selectedLanguage === 'en' ? 'en-US' : selectedLanguage;

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed. Please try again.');
      };
    }
  }, [selectedLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Enhanced AI responses based on travel context
    const lowercaseMessage = userMessage.toLowerCase();
    
    let response = '';
    let suggestions: string[] = [];
    let tripData = {};

    if (lowercaseMessage.includes('plan') || lowercaseMessage.includes('trip') || lowercaseMessage.includes('vacation')) {
      response = `I'd love to help you plan an amazing trip! ✈️ To create the perfect itinerary for you, I'll need some details:

📍 **Where would you like to go?** (specific city/country or type of destination)
📅 **When are you traveling?** (dates or season)
💰 **What's your budget range?** (per person for the entire trip)
👥 **How many people?** (solo, couple, family, group)
🎯 **What interests you most?** (adventure, culture, relaxation, food, nightlife)

Based on your preferences, I'll suggest:
• Personalized day-by-day itineraries
• Best accommodations for your budget
• Local experiences and hidden gems  
• Transportation options
• Weather-based activity recommendations
• Cultural tips and language basics`;

      suggestions = [
        '🏖️ Beach destinations under $2000',
        '🏔️ Mountain adventures in Europe', 
        '🍜 Food tours in Asia',
        '🎨 Art and culture in Europe',
        '🌍 Solo travel safety tips',
        '💸 Budget-friendly destinations'
      ];
      
      tripData = { planningStage: 'initial' };
    }
    else if (lowercaseMessage.includes('budget') || lowercaseMessage.includes('cheap') || lowercaseMessage.includes('affordable')) {
      response = `Great question! I'm excellent at finding budget-friendly options 💰 Here are some money-saving strategies:

**🌟 Best Budget Destinations:**
• **Southeast Asia**: Thailand, Vietnam, Cambodia ($30-50/day)
• **Eastern Europe**: Poland, Hungary, Czech Republic ($40-70/day)  
• **Central America**: Guatemala, Nicaragua, Costa Rica ($35-60/day)
• **South America**: Peru, Bolivia, Ecuador ($25-45/day)

**💡 Money-Saving Tips:**
• Travel during shoulder seasons (30-50% savings)
• Use budget airlines and book flights 6-8 weeks ahead
• Stay in hostels or use Airbnb for longer stays
• Eat at local markets and street food
• Use public transport instead of taxis
• Look for free walking tours and activities

**🔥 Current Budget Deals I'm Tracking:**
• Flights to Thailand from $650 roundtrip
• 2-week Europe rail passes from $400
• Hostel beds in major cities from $15/night`;

      suggestions = [
        '✈️ Find cheap flights',
        '🏨 Budget accommodation tips',
        '🍕 Cheap eats around the world',
        '🚌 Transportation savings',
        '🎫 Free activities finder',
        '📱 Best travel apps for budgets'
      ];
    }
    else if (lowercaseMessage.includes('food') || lowercaseMessage.includes('eat') || lowercaseMessage.includes('restaurant')) {
      response = `Food is one of the best parts of travel! 🍽️ I can recommend incredible culinary experiences:

**🌟 Food Paradise Destinations:**
• **Japan**: Sushi, ramen, street food in Tokyo & Osaka
• **Italy**: Pasta, pizza, gelato tours through Rome & Tuscany  
• **Thailand**: Pad thai, green curry, mango sticky rice
• **France**: Croissants, wine, cheese in Paris & Lyon
• **Mexico**: Tacos, mole, mezcal in Mexico City & Oaxaca
• **India**: Curry, street snacks, chai in Delhi & Mumbai

**🍜 Food Experience Types:**
• Cooking classes with local families
• Street food tours with expert guides  
• Wine and cheese tastings
• Market visits and ingredient shopping
• Fine dining with Michelin-starred chefs
• Food festivals and local celebrations

Want me to create a food-focused itinerary for a specific destination?`;

      suggestions = [
        '🍣 Japanese food tour',
        '🍝 Italian cooking class',
        '🌮 Mexican street food',
        '🍷 Wine tasting tours',
        '🥘 Cooking classes abroad',
        '📍 Local food markets'
      ];
    }
    else if (lowercaseMessage.includes('flight') || lowercaseMessage.includes('booking') || lowercaseMessage.includes('hotel')) {
      response = `I can help you find the best deals and make smart bookings! ✈️🏨

**✈️ Flight Booking Strategies:**
• **Best Time to Book**: 6-8 weeks ahead for domestic, 2-3 months for international
• **Cheapest Days**: Tuesday/Wednesday departures, avoid Fridays/Sundays
• **Flexible Dates**: Use date range search (+/- 3 days) for savings
• **Incognito Mode**: Clear cookies to avoid price increases
• **Error Fares**: I track mistake fares that can save 50-90%

**🏨 Accommodation Tips:**
• **Hotels**: Book direct after comparing prices for loyalty points
• **Airbnb**: Better for 4+ nights, look for Superhosts
• **Hostels**: Perfect for solo travelers and meeting people
• **Unique Stays**: Treehouses, boats, castles for memorable experiences

**🔥 Current Deals I'm Monitoring:**
• 40% off hotels in major European cities
• $200 off roundtrip flights to Asia
• Last-minute cruise deals from $89/night

Want me to search for specific routes or destinations?`;

      suggestions = [
        '✈️ Search flights',
        '🏨 Compare hotels',
        '🛏️ Unique accommodations',
        '📱 Best booking apps',
        '💳 Travel credit cards',
        '🎯 Price alerts setup'
      ];
    }
    else if (lowercaseMessage.includes('weather') || lowercaseMessage.includes('climate') || lowercaseMessage.includes('season')) {
      response = `Weather timing can make or break your trip! 🌤️ Let me help you choose the perfect season:

**🌍 Best Times by Region:**
• **Europe**: May-Sep (warm), Dec-Mar (Christmas markets, skiing)
• **Southeast Asia**: Nov-Mar (dry season), avoid Apr-Oct (monsoons)
• **Japan**: Mar-May (cherry blossoms), Sep-Nov (fall colors)
• **Australia**: Sep-Feb (spring/summer), Mar-Aug (winter up north)
• **Caribbean**: Dec-Apr (dry), May-Nov (hurricane season)
• **India**: Oct-Mar (cool & dry), avoid Apr-Jun (extreme heat)

**🌡️ Weather Considerations:**
• **Temperature**: Pack layers for varying conditions
• **Rainfall**: Monsoons can flood attractions but bring fewer crowds
• **Humidity**: Tropical destinations are always humid
• **Natural Events**: Aurora season, whale migrations, festivals

**📱 Weather Tools I Recommend:**
• 14-day forecasts before departure
• Local weather apps for real-time updates
• Climate data for historical patterns

What destination are you considering? I'll give you specific weather insights!`;

      suggestions = [
        '🌸 Cherry blossom season',
        '🏖️ Best beach weather',
        '🎿 Ski season planning',
        '🌧️ Monsoon travel tips',
        '🌡️ Climate comparisons',
        '📅 Seasonal events calendar'
      ];
    }
    else if (lowercaseMessage.includes('culture') || lowercaseMessage.includes('history') || lowercaseMessage.includes('art')) {
      response = `Cultural immersion makes travel truly meaningful! 🏛️ Here's how to dive deep:

**🎨 Top Cultural Destinations:**
• **Italy**: Renaissance art in Florence, ancient Rome, Venetian architecture
• **Egypt**: Pyramids, temples, hieroglyphics along the Nile
• **Japan**: Temples, tea ceremony, traditional crafts in Kyoto
• **Peru**: Inca ruins, indigenous markets, colonial architecture
• **Greece**: Ancient philosophy sites, island traditions, mythology
• **India**: Spiritual sites, diverse languages, colorful festivals

**🏛️ Cultural Experiences:**
• Museum tours with expert guides
• Traditional craft workshops
• Local family homestays
• Religious ceremony participation (respectfully)
• Language exchange meetups
• Historical walking tours

**📚 Cultural Preparation Tips:**
• Learn basic phrases in local language
• Research customs and etiquette
• Understand tipping and bargaining norms
• Know religious and cultural sensitivities
• Read about historical context

Which culture fascinates you most? I'll create a deep-dive cultural itinerary!`;

      suggestions = [
        '🏛️ Ancient civilizations',
        '🎭 Traditional performances',
        '🖼️ Art museum tours',
        '🏮 Festival calendars',
        '🗣️ Language learning tips',
        '🤝 Cultural etiquette guides'
      ];
    }
    else {
      // General helpful response
      response = `I'm here to help with all your travel needs! ✈️ As your AI travel assistant, I can:

🗺️ **Plan Complete Itineraries**: Day-by-day plans with activities, restaurants, and logistics
💰 **Find Best Deals**: Flights, hotels, tours, and experiences at great prices  
🌍 **Destination Expertise**: Insider tips for 200+ countries and thousands of cities
📅 **Perfect Timing**: Best seasons, weather, and events for any destination
🍽️ **Food & Culture**: Local cuisines, cooking classes, cultural experiences
🏨 **Accommodations**: Hotels, Airbnb, hostels, and unique stays
🚗 **Transportation**: Flights, trains, buses, car rentals, and local transport
📋 **Travel Logistics**: Visas, vaccines, insurance, packing lists
⚡ **Real-time Help**: Weather updates, flight changes, local recommendations

What aspect of travel planning can I help you with today?`;

      suggestions = [
        '🗺️ Plan a complete trip',
        '💡 Travel inspiration',
        '📋 Travel checklist',
        '🎯 Destination finder',
        '💬 Ask me anything',
        '⭐ Popular destinations'
      ];
    }

    return {
      id: Date.now().toString(),
      text: response,
      isUser: false,
      timestamp: new Date(),
      suggestions,
      tripData
    };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputText);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion.replace(/[🔥💡🌟✨🎯📍🏖️🏔️🍜🎨🌍💸✈️🏨🛏️📱💳🌸🏖️🎿🌧️🌡️📅🏛️🎭🖼️🏮🗣️🤝🗺️💰🌍📅🍽️🏨🚗📋⚡]/g, '').trim());
  };

  const startListening = () => {
    if (recognition.current) {
      setIsListening(true);
      recognition.current.start();
    } else {
      toast.error('Speech recognition not supported in this browser.');
    }
  };

  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="font-medium tracking-wide">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center space-x-3">
              <img 
                src="/Images/trek-logo.png" 
                alt="Trek Logo" 
                className="h-8 w-8 object-contain"
              />
              <Sparkles className="h-5 w-5 text-blue-500" />
              <h1 className="text-xl font-semibold text-gray-900 tracking-wide">AI Travel Assistant</h1>
            </div>
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center space-x-3">
            <Globe className="h-4 w-4 text-gray-500" />
            <select 
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-sm border rounded px-3 py-2 bg-white font-medium tracking-wide"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[80%] space-x-3 ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="h-8 w-8">
                      {message.isUser ? (
                        <AvatarFallback className="bg-blue-500 text-white">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      ) : (
                        <AvatarImage src="/api/placeholder/32/32" alt="AI Assistant" />
                      )}
                    </Avatar>
                    
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.isUser 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white border shadow-sm'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                      
                      {!message.isUser && (
                        <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => speakText(message.text)}
                            disabled={isSpeaking}
                            className="h-6 px-2 text-xs"
                          >
                            {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                          </Button>
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Suggestions */}
              {messages.length > 0 && messages[messages.length - 1]?.suggestions && (
                <div className="flex flex-wrap gap-2 ml-11">
                  {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs h-7 px-3 hover:bg-blue-50 hover:border-blue-200"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex space-x-3 max-w-[80%]">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/api/placeholder/32/32" alt="AI Assistant" />
                    </Avatar>
                    <div className="bg-white border shadow-sm rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me about destinations, planning, bookings, or anything travel-related..."
                  className="pr-12"
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                >
                  {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputText.trim() || isLoading}
                className="px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="h-16 flex-col space-y-1"
            onClick={() => setInputText('Plan a 7-day trip to Japan')}
          >
            <Plane className="h-5 w-5" />
            <span className="text-xs">Plan Trip</span>
          </Button>
          <Button
            variant="outline" 
            className="h-16 flex-col space-y-1"
            onClick={() => setInputText('Find budget destinations under $1000')}
          >
            <DollarSign className="h-5 w-5" />
            <span className="text-xs">Budget Tips</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex-col space-y-1" 
            onClick={() => setInputText('Best food destinations for culinary tours')}
          >
            <Camera className="h-5 w-5" />
            <span className="text-xs">Food Tours</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex-col space-y-1"
            onClick={() => setInputText('When is the best time to visit Europe?')}
          >
            <Clock className="h-5 w-5" />
            <span className="text-xs">Best Times</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;