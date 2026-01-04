import React from 'react';
import { motion } from 'framer-motion';

export default function ChapterTile({ chapter, timesRead, onClick, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      animate={timesRead > 0 ? { 
        boxShadow: [
          '0 0 0px rgba(47,62,92,0)',
          '0 0 12px rgba(47,62,92,0.2)',
          '0 0 0px rgba(47,62,92,0)'
        ]
      } : {}}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative aspect-square rounded-xl flex items-center justify-center transition-all
        border shadow-sm
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${timesRead > 0 ? 'bg-accent/8 border-accent/20' : 'bg-card border-border'}
      `}
    >
      <span className={`text-sm font-semibold ${timesRead > 0 ? 'text-foreground' : 'text-foreground'}`}>
        {chapter}
      </span>
      
      {timesRead > 0 && (
        <div className="absolute top-1.5 right-1.5 min-w-[16px] h-[15px] px-1.5 rounded-full flex items-center justify-center bg-[#F0F4F8] dark:bg-[#1E293B]">
          <span className="text-[9px] font-semibold text-[#475569] dark:text-[#9CA3AF]">{timesRead}</span>
        </div>
      )}
    </motion.button>
  );
}