import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, Bot, User, Globe, Volume2, VolumeX, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  language?: string;
  suggestions?: string[];
  tripData?: any;
}

interface AIChatInterfaceProps {
  onTripGenerated?: (tripData: any) => void;
  initialPrompt?: string;
}

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ 
  onTripGenerated, 
  initialPrompt 
}) => {
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' }
  ];

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'en' ? 'en-US' : selectedLanguage;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition failed. Please try again.');
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }

    // Add welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: getWelcomeMessage(),
        sender: 'ai',
        timestamp: new Date(),
        language: selectedLanguage,
        suggestions: [
          'Plan a 5-day trip to Goa',
          'Show me heritage destinations in India',
          'Adventure activities in Himachal Pradesh',
          'Budget travel options in Kerala'
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getWelcomeMessage = () => {
    const messages = {
      en: "Hello! I'm your AI travel assistant. I can help you plan amazing trips, find destinations, and create personalized itineraries. What kind of adventure are you looking for?",
      hi: "नमस्ते! मैं आपका AI यात्रा सहायक हूँ। मैं आपको शानदार यात्राओं की योजना बनाने, गंतव्यों को खोजने और व्यक्तिगत यात्रा कार्यक्रम बनाने में मदद कर सकता हूँ। आप किस प्रकार के साहसिक कार्य की तलाश में हैं?",
      es: "¡Hola! Soy tu asistente de viajes con IA. Puedo ayudarte a planificar viajes increíbles, encontrar destinos y crear itinerarios personalizados. ¿Qué tipo de aventura estás buscando?",
      fr: "Bonjour! Je suis votre assistant de voyage IA. Je peux vous aider à planifier des voyages incroyables, trouver des destinations et créer des itinéraires personnalisés. Quel type d'aventure recherchez-vous?",
      de: "Hallo! Ich bin Ihr KI-Reiseassistent. Ich kann Ihnen dabei helfen, erstaunliche Reisen zu planen, Reiseziele zu finden und personalisierte Reiserouten zu erstellen. Nach welcher Art von Abenteuer suchen Sie?",
      ja: "こんにちは！私はあなたのAI旅行アシスタントです。素晴らしい旅行の計画、目的地の発見、パーソナライズされた旅程の作成をお手伝いします。どのような冒険をお探しですか？",
      ko: "안녕하세요! 저는 당신의 AI 여행 도우미입니다. 멋진 여행 계획을 세우고, 목적지를 찾고, 개인화된 여행 일정을 만드는 데 도움을 드릴 수 있습니다. 어떤 종류의 모험을 찾고 계신가요?"
    };
    return messages[selectedLanguage as keyof typeof messages] || messages.en;
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || currentMessage.trim();
    if (!messageToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      sender: 'user',
      timestamp: new Date(),
      language: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      // Call AI service to get response
      const aiResponse = await getAIResponse(messageToSend, selectedLanguage);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        sender: 'ai',
        timestamp: new Date(),
        language: selectedLanguage,
        suggestions: aiResponse.suggestions,
        tripData: aiResponse.tripData
      };

      setMessages(prev => [...prev, aiMessage]);

      // Speak the response if voice is enabled
      if (voiceEnabled && aiResponse.content) {
        speakMessage(aiResponse.content);
      }

      // If trip data is generated, callback to parent
      if (aiResponse.tripData && onTripGenerated) {
        onTripGenerated(aiResponse.tripData);
      }

    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        language: selectedLanguage
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getAIResponse = async (message: string, language: string) => {
    // This would integrate with your backend AI service
    // For now, returning mock responses based on message content
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing

    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('plan') || lowerMessage.includes('trip') || lowerMessage.includes('travel')) {
      return {
        content: getLocalizedResponse('trip_planning', language),
        suggestions: [
          'Tell me your budget range',
          'How many days do you want to travel?',
          'What are your interests?',
          'Which destinations interest you?'
        ],
        tripData: null
      };
    }
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return {
        content: getLocalizedResponse('budget_planning', language),
        suggestions: [
          'Budget travel options',
          'Mid-range recommendations',
          'Luxury experiences',
          'Compare prices'
        ]
      };
    }
    
    if (lowerMessage.includes('destination') || lowerMessage.includes('place') || lowerMessage.includes('where')) {
      return {
        content: getLocalizedResponse('destination_suggestions', language),
        suggestions: [
          'Beach destinations',
          'Mountain retreats',
          'Cultural heritage sites',
          'Adventure locations'
        ]
      };
    }

    // Default response
    return {
      content: getLocalizedResponse('general_help', language),
      suggestions: [
        'Plan a new trip',
        'Find destinations',
        'Budget advice',
        'Travel tips'
      ]
    };
  };

  const getLocalizedResponse = (type: string, language: string) => {
    const responses = {
      trip_planning: {
        en: "I'd love to help you plan your trip! Let me gather some information. Where would you like to go, when are you planning to travel, and what's your approximate budget?",
        hi: "मैं आपकी यात्रा की योजना बनाने में मदद करना चाहूंगा! मुझे कुछ जानकारी चाहिए। आप कहाँ जाना चाहते हैं, कब यात्रा की योजना बना रहे हैं, और आपका अनुमानित बजट क्या है?",
        es: "¡Me encantaría ayudarte a planificar tu viaje! Necesito información. ¿A dónde te gustaría ir, cuándo planeas viajar y cuál es tu presupuesto aproximado?"
      },
      budget_planning: {
        en: "Let's work on your budget! India offers incredible experiences at every price point. What's your approximate budget per person, and are you looking for budget, mid-range, or luxury experiences?",
        hi: "आइए आपके बजट पर काम करते हैं! भारत हर मूल्य बिंदु पर अविश्वसनीय अनुभव प्रदान करता है। प्रति व्यक्ति आपका अनुमानित बजट क्या है?",
        es: "¡Trabajemos en tu presupuesto! India ofrece experiencias increíbles en todos los rangos de precios. ¿Cuál es tu presupuesto aproximado por persona?"
      },
      destination_suggestions: {
        en: "India has amazing destinations for every type of traveler! Are you interested in beaches, mountains, cultural heritage, wildlife, or spiritual experiences? I can suggest the perfect places based on your interests.",
        hi: "भारत में हर प्रकार के यात्री के लिए अद्भुत गंतव्य हैं! क्या आप समुद्र तटों, पहाड़ों, सांस्कृतिक विरासत, वन्यजीवन, या आध्यात्मिक अनुभवों में रुचि रखते हैं?",
        es: "¡India tiene destinos increíbles para todo tipo de viajero! ¿Te interesan las playas, montañas, patrimonio cultural, vida silvestre o experiencias espirituales?"
      },
      general_help: {
        en: "I'm here to help with all your travel needs! I can assist with trip planning, destination recommendations, budget advice, and creating detailed itineraries. What would you like to explore?",
        hi: "मैं आपकी सभी यात्रा आवश्यकताओं के लिए यहाँ हूँ! मैं यात्रा योजना, गंतव्य सुझाव, बजट सलाह और विस्तृत यात्रा कार्यक्रम बनाने में सहायता कर सकता हूँ।",
        es: "¡Estoy aquí para ayudar con todas tus necesidades de viaje! Puedo ayudarte con planificación de viajes, recomendaciones de destinos, consejos de presupuesto y creación de itinerarios detallados."
      }
    };

    return responses[type as keyof typeof responses]?.[language as keyof typeof responses[keyof typeof responses]] 
           || responses[type as keyof typeof responses]?.en 
           || "I'm here to help you plan amazing trips!";
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      toast.error('Voice recognition is not supported in your browser');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakMessage = (text: string) => {
    if (synthesisRef.current && voiceEnabled) {
      // Stop any current speech
      synthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'en' ? 'en-US' : selectedLanguage;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthesisRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6" />
          <h2 className="text-xl font-bold">AI Travel Assistant</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-white/20 text-white border border-white/30 rounded px-2 py-1 text-sm"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code} className="text-black">
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
          
          {/* Voice Controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="text-white hover:bg-white/20"
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          
          {isSpeaking && (
            <Button
              variant="ghost"
              size="sm"
              onClick={stopSpeaking}
              className="text-white hover:bg-white/20"
            >
              Stop
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-100 text-purple-600'
                }`}>
                  {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                
                <Card className={`${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <Card className="bg-gray-50">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {/* Suggestions */}
          {messages.length > 0 && messages[messages.length - 1]?.suggestions && !isTyping && (
            <div className="flex flex-wrap gap-2 mt-4">
              {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder={`Type your message in ${languages.find(l => l.code === selectedLanguage)?.name || 'English'}...`}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="pr-10"
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-pulse text-red-500">
                  <Mic className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
          
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={isListening ? stopListening : startListening}
            disabled={isTyping}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Button onClick={() => handleSendMessage()} disabled={!currentMessage.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 mt-2 text-center">
          {isListening ? 'Listening... Speak now!' : 'Click the mic to use voice input'}
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;