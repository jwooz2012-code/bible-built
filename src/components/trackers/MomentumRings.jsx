import React from 'react';
import { motion } from 'framer-motion';

export default function MomentumRings({ otPercent, ntPercent, currentStreak }) {
  return (
    <div className="relative flex items-center justify-center h-48">
      <div className="bb-ambient" />
      <svg className="absolute" width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="ot-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--ot-a))', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--ot-b))', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle
          cx="80" cy="80" r="70"
          fill="none"
          stroke="url(#ot-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 70}
          initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 70 - (otPercent / 100) * 2 * Math.PI * 70 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <svg className="absolute" width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="nt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--nt-a))', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--nt-b))', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r="50"
          fill="none"
          stroke="url(#nt-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 50}
          initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 50 - (ntPercent / 100) * 2 * Math.PI * 50 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute bg-card rounded-full px-4 py-3 text-center shadow-sm">
        <div className="text-3xl font-bold text-foreground">{currentStreak}</div>
        <div className="text-xs text-muted-foreground mt-0.5">day streak</div>
      </div>
    </div>
  );
}