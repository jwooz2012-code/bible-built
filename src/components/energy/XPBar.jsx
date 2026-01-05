import React from 'react';
import { motion } from 'framer-motion';

export default function XPBar({ current, max, label }) {
  const percentage = Math.min((current / max) * 100, 100);
  
  return (
    <div className="energy-card p-4 rounded-xl">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
          {label || 'Progress'}
        </span>
        <span className="text-xs font-bold" style={{ color: 'var(--energy-orange)' }}>
          {current} / {max}
        </span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full energy-shimmer"
          style={{ background: 'var(--energy-gradient)' }}
        />
        <div 
          className="absolute inset-0 rounded-full opacity-30"
          style={{ 
            boxShadow: `inset 0 2px 4px rgba(0,0,0,0.2), 0 0 20px hsl(var(--energy-glow))` 
          }}
        />
      </div>
    </div>
  );
}