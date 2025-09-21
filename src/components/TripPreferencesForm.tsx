import { useState } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Calendar, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface TripPreferencesFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
}

const TripPreferencesForm = ({ onSubmit, onBack }: TripPreferencesFormProps) => {
  const [formData, setFormData] = useState({
    destination: '',
    budget: [2000],
    startDate: '',
    endDate: '',
    duration: [7],
    theme: 'leisure'
  });

  const themes = [
    { id: 'heritage', label: 'Heritage', icon: '🏛️' },
    { id: 'nightlife', label: 'Nightlife', icon: '🌃' },
    { id: 'adventure', label: 'Adventure', icon: '🏔️' },
    { id: 'leisure', label: 'Leisure', icon: '🏖️' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <h1 className="text-2xl font-bold text-foreground">Plan Your Perfect Trip</h1>
          
          <div className="w-20" /> {/* Spacer */}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
          <div className="travel-card space-y-6">
            {/* Destination */}
            <div className="space-y-3">
              <Label htmlFor="destination" className="text-lg font-semibold flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Where would you like to go?</span>
              </Label>
              <Input
                id="destination"
                placeholder="e.g., Paris, Tokyo, New York..."
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="travel-input text-lg"
                required
              />
            </div>

            {/* Budget */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span>Budget Range</span>
              </Label>
              <div className="px-4">
                <Slider
                  value={formData.budget}
                  onValueChange={(value) => setFormData({ ...formData, budget: value })}
                  max={10000}
                  min={500}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>$500</span>
                  <span className="font-semibold text-foreground">${formData.budget[0]}</span>
                  <span>$10,000+</span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="start-date" className="text-lg font-semibold flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Start Date</span>
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="travel-input"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="end-date" className="text-lg font-semibold">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="travel-input"
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Trip Duration</span>
              </Label>
              <div className="px-4">
                <Slider
                  value={formData.duration}
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                  max={30}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>1 day</span>
                  <span className="font-semibold text-foreground">
                    {formData.duration[0]} {formData.duration[0] === 1 ? 'day' : 'days'}
                  </span>
                  <span>30+ days</span>
                </div>
              </div>
            </div>

            {/* Travel Theme */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">
                What's your travel style?
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: theme.id })}
                    className={`p-4 rounded-xl border-2 transition-colors text-center space-y-2 ${
                      formData.theme === theme.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="text-2xl">{theme.icon}</div>
                    <div className="font-medium">{theme.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              className="w-full travel-button-primary text-lg py-4 h-auto"
            >
              Generate My Itinerary
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripPreferencesForm;