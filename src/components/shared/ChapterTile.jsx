import React from 'react';
import { Check } from 'lucide-react';

export default function ChapterTile({ chapter, isReadToday, isInCurrentCycle, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        aspect-square rounded-xl flex items-center justify-center font-medium text-sm
        transition-all relative
        ${isReadToday
          ? 'bg-accent text-accent-foreground'
          : isInCurrentCycle
          ? 'bg-accent/30 text-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
        }
      `}
    >
      {chapter}
      {isReadToday && (
        <div className="absolute top-1 right-1">
          <Check className="w-3 h-3" />
        </div>
      )}
    </button>
  );
}