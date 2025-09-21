import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
// Import the working components
import AIChatInterface from "@/components/AIChatInterface";
import PWAFeatures from "@/components/PWAFeatures";
import RealTimeFeatures from "@/components/RealTimeFeatures";
import TripPlanningInterface from "@/components/TripPlanningInterface";
import ItineraryPage from "@/components/ItineraryPage";
import UserDashboard from "@/components/UserDashboard";
import BookingInterface from "@/components/BookingInterface";
import BookingConfirmationPage from "@/components/BookingConfirmationPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<AIChatInterface />} />
              <Route path="/plan-trip" element={<TripPlanningInterface />} />
              <Route path="/itinerary" element={<ItineraryPage />} />
              <Route path="/booking" element={<BookingInterface />} />
              <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/pwa" element={<PWAFeatures />} />
              <Route path="/real-time" element={<RealTimeFeatures />} />
              {/* TODO: Add more component routes when needed */}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
