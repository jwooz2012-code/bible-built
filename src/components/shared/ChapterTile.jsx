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
        <div 
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-secondary flex items-center justify-center border-2 dark:border-[#1a1a1a] border-white"
        >
          <span 
            className="text-[8px] font-normal leading-none"
            style={{ color: '#F97316' }}
          >
            {timesRead}
          </span>
        </div>
      )}
      
      <span className="text-[15px] font-semibold leading-none text-foreground">
        {chapter}
      </span>
    </motion.button>
  );
}