import React from 'react';
import { motion } from 'framer-motion';

export default function ChapterTile({ chapter, timesRead, onClick, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative aspect-square rounded-lg flex items-center justify-center transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${timesRead > 0 ? 'bg-accent/10' : 'bg-card'}
        border-0
      `}
    >
      <span className="text-sm font-medium text-foreground">{chapter}</span>
      
      {timesRead > 0 && (
        <div className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-accent rounded-full flex items-center justify-center">
          <span className="text-[9px] font-bold text-white">{timesRead}</span>
        </div>
      )}
    </motion.button>
  );
}