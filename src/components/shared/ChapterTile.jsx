import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { triggerHaptic } from '@/components/utils/haptics';

export default function ChapterTile({ chapter, timesRead, onClick, disabled }) {
  const handleClick = () => {
    if (!disabled) {
      triggerHaptic();
      onClick();
    }
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.15 }}
      onClick={handleClick}
      disabled={disabled}
      className={`relative aspect-square rounded-xl flex items-center justify-center transition-all border shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={timesRead > 0 ? {
        background: 'hsl(var(--accent))',
        borderColor: 'hsl(var(--accent))',
        borderWidth: '1.5px'
      } : {
        background: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))'
      }}
    >
      {timesRead >= 1 && (
        <CheckCircle className="absolute top-1 right-1 w-3 h-3 text-accent-foreground/50" />
      )}
      
      <div className="flex flex-col items-center justify-center gap-0.5">
        <span className={`text-[15px] font-semibold leading-none ${timesRead > 0 ? 'text-accent-foreground' : 'text-foreground'}`}>
          {chapter}
        </span>
        {timesRead >= 2 && (
          <span className="text-[7px] font-medium text-muted-foreground/70 leading-none">
            x{timesRead}
          </span>
        )}
      </div>
    </motion.button>
  );
}