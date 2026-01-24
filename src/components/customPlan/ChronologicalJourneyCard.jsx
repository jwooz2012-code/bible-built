import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChronologicalJourneyCard({ 
  theme, 
  Icon, 
  colorClass, 
  isSelected, 
  onThemeClick 
}) {
  return (
    <button
      onClick={() => onThemeClick(theme.id)}
      className={cn(
        "text-left w-full rounded-xl border-2 transition-all relative",
        "py-5 px-5 flex items-start gap-4",
        isSelected 
          ? "border-primary bg-primary/5 shadow-md" 
          : "border-border bg-card/50 hover:bg-accent/30"
      )}
    >
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
        <Icon className="w-6 h-6" strokeWidth={2.5} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold text-foreground">{theme.name}</div>
        <div className="text-sm text-muted-foreground mt-1">{theme.description}</div>
      </div>
      
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}