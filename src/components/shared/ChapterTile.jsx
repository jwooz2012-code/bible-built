import React from 'react';
import { motion } from 'framer-motion';

export default function ChapterTile({ chapter, timesRead, onClick, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative p-3 rounded-xl text-center transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/10'}
        ${timesRead > 0 ? 'bg-accent/10' : 'bg-card'}
        border border-border
      `}
    >
      <div className="text-sm font-medium text-foreground mb-1">{chapter}</div>
      
      {timesRead > 0 && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
          <span className="text-[9px] font-bold text-white">{timesRead}</span>
        </div>
      )}
    </motion.button>
  );
}