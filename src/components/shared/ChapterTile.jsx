import React from 'react';
import { Check } from 'lucide-react';

export default function ChapterTile({ chapter, isReadToday, isInCurrentCycle, cyclesRead, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
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
        <div className="absolute top-1 right-1 bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 rounded-full p-0.5">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}
      {cyclesRead > 0 && (
        <div className="absolute bottom-1 right-1 bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
          {cyclesRead}
        </div>
      )}
    </button>
  );
}