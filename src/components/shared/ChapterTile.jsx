import React from 'react';
import { motion } from 'framer-motion';

export default function ChapterTile({ chapter, timesRead, onClick, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      animate={timesRead > 0 ? { 
        scale: [1, 1.05, 1]
      } : {}}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative aspect-square rounded-xl flex items-center justify-center transition-all border shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''} bg-card border-border`}
      style={timesRead > 0 ? {
        background: 'rgba(249, 115, 22, 0.05)',
        borderColor: 'var(--energy-orange)',
        borderWidth: '1.5px',
        boxShadow: '0 0 14px var(--energy-glow-light, var(--energy-glow-dark, rgba(249, 115, 22, 0.16)))'
      } : {}}
    >
      <span className="text-sm font-semibold text-foreground">
        {chapter}
      </span>
      
      {timesRead > 0 && (
        <div 
          className="absolute top-1.5 right-1.5 min-w-[16px] h-[15px] px-1.5 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--energy-orange), var(--energy-gold))',
            boxShadow: '0 0 8px var(--energy-glow-light, var(--energy-glow-dark, rgba(249, 115, 22, 0.3)))'
          }}
        >
          <span className="text-[9px] font-semibold" style={{ color: '#FFFFFF' }}>{timesRead}</span>
        </div>
      )}
    </motion.button>
  );
}