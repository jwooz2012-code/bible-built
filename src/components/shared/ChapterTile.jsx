import React from 'react';
import { Check } from 'lucide-react';

export default function ChapterTile({ chapter, isRead, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        aspect-square rounded-xl flex items-center justify-center font-medium text-sm
        transition-all relative
        ${isRead
          ? 'bg-accent text-accent-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
        }
      `}
    >
      {chapter}
      {isRead && (
        <div className="absolute top-1 right-1">
          <Check className="w-3 h-3" />
        </div>
      )}
    </button>
  );
}