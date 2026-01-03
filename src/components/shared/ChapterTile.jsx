import React from 'react';
import { motion } from 'framer-motion';

export default function ChapterTile({ chapter, timesRead, onClick, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative aspect-square rounded-xl flex items-center justify-center transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/10'}
        ${timesRead > 0 ? 'bg-accent/10' : 'bg-card'}
        border border-border
      `}
    >
      <span className="text-sm font-semibold text-foreground">{chapter}</span>
      
      {timesRead > 0 && (
        <div className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-accent rounded-full flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">{timesRead}</span>
        </div>
      )}
    </motion.button>
  );
}