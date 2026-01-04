import React from 'react';
import { motion } from 'framer-motion';

export default function ChapterTile({ chapter, timesRead, onClick, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative aspect-square rounded-xl flex items-center justify-center transition-all border shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''} bg-card border-border`}
      style={timesRead > 0 ? {
        background: 'rgba(249, 115, 22, 0.08)',
        borderColor: 'var(--energy-orange)',
        borderWidth: '1.5px',
        boxShadow: '0 0 6px rgba(249, 115, 22, 0.08)'
      } : {}}
    >
      <span className="text-[15px] font-semibold text-foreground leading-none">
        {chapter}
      </span>
      
      {timesRead > 0 && (
        <div 
          className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-md"
          style={{
            background: 'linear-gradient(135deg, var(--energy-orange), var(--energy-gold))',
            border: '1.5px solid rgba(255, 255, 255, 0.25)'
          }}
        >
          <span 
            className="text-[10px] font-bold leading-none"
            style={{ color: 'var(--badge-text)' }}
          >
            {timesRead}
          </span>
        </div>
      )}
    </motion.button>
  );
}