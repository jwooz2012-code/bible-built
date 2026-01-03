import React from 'react';
import { Check } from 'lucide-react';

export default function ChapterTile({ chapter, isReadToday, isInCurrentCycle, onClick, disabled }) {
  const handleClick = (e) => {
    console.log('[ChapterTile] Click event fired for chapter:', chapter);
    console.log('[ChapterTile] Disabled?', disabled);
    if (onClick) {
      onClick(e);
    } else {
      console.warn('[ChapterTile] No onClick handler provided');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        aspect-square rounded-xl flex items-center justify-center font-medium text-sm
        transition-all relative
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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
        <div className="absolute top-1 right-1 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full p-0.5">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}