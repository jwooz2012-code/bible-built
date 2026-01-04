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
      {timesRead === 0 && (
        <span className="text-[15px] font-semibold text-foreground leading-none">
          {chapter}
        </span>
      )}
      
      {timesRead === 1 && (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <CheckCircle className="w-4 h-4 text-accent-foreground" />
          <span className="text-[13px] font-semibold text-accent-foreground leading-none">
            {chapter}
          </span>
        </div>
      )}
      
      {timesRead >= 2 && (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <span className="text-[15px] font-semibold text-accent-foreground leading-none">
            {chapter}
          </span>
          <span className="text-[10px] font-medium text-accent-foreground/60 leading-none">
            x{timesRead}
          </span>
        </div>
      )}
    </motion.button>
  );
}