import { useState } from 'react';
import { X, CloudRain, Clock, MapPin, Thermometer, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SmartAdjustmentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SmartAdjustmentsPanel = ({ isOpen, onClose }: SmartAdjustmentsPanelProps) => {
  const [selectedAdjustments, setSelectedAdjustments] = useState<string[]>([]);

  // Mock adjustment data
  const adjustments = [
    {
      id: 'weather-1',
      type: 'weather',
      priority: 'high',
      title: 'Rain Expected Tomorrow',
      description: 'Heavy rain forecasted for Day 2. We recommend indoor activities.',
      suggestions: [
        'Visit Louvre Museum instead of Tuileries Garden',
        'Add covered shopping at Galeries Lafayette',
        'Book Seine River cruise with covered deck'
      ],
      impact: 'Saves 2 hours, adds $15'
    },
    {
      id: 'delay-1',
      type: 'delay',
      priority: 'medium',
      title: 'Flight Delay Detected',
      description: 'Your arrival flight is delayed by 3 hours. Adjusting Day 1 schedule.',
      suggestions: [
        'Move Eiffel Tower visit to evening for sunset views',
        'Cancel lunch reservation, rebook for dinner',
        'Add late-night café experience'
      ],
      impact: 'No extra cost, better experience'
    },
    {
      id: 'recommendation-1',
      type: 'recommendation',
      priority: 'low',
      title: 'Local Event Opportunity',
      description: 'Jazz festival happening near your hotel on Day 3.',
      suggestions: [
        'Add jazz festival evening experience',
        'Book nearby restaurant for pre-show dinner',
        'Extend Day 3 activities by 2 hours'
      ],
      impact: 'Adds $45, unique local experience'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'weather': return CloudRain;
      case 'delay': return Clock;
      case 'recommendation': return MapPin;
      default: return AlertTriangle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const toggleAdjustment = (id: string) => {
    setSelectedAdjustments(prev => 
      prev.includes(id) 
        ? prev.filter(adjId => adjId !== id)
        : [...prev, id]
    );
  };

  const applyChanges = () => {
    // Handle applying selected adjustments
    console.log('Applying adjustments:', selectedAdjustments);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Smart Adjustments</h2>
              <p className="text-sm text-muted-foreground">AI-powered trip optimization</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {adjustments.map((adjustment) => {
              const Icon = getIcon(adjustment.type);
              const isSelected = selectedAdjustments.includes(adjustment.id);
              
              return (
                <div
                  key={adjustment.id}
                  className={`travel-card cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleAdjustment(adjustment.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getPriorityColor(adjustment.priority)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">{adjustment.title}</h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          {adjustment.priority} priority
                        </Badge>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {adjustment.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-card-foreground">Suggested Changes:</div>
                    <ul className="space-y-1">
                      {adjustment.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                          <span className="text-primary">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Impact: </span>
                      <span className="font-medium text-card-foreground">{adjustment.impact}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border space-y-3">
            <div className="text-sm text-muted-foreground">
              {selectedAdjustments.length} adjustments selected
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 travel-button-primary"
                onClick={applyChanges}
                disabled={selectedAdjustments.length === 0}
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAdjustmentsPanel;