import React from 'react';
import { motion } from 'framer-motion';

export default function XPBar({ todayCount = 0 }) {
  const xpPerChapter = 100;
  const currentXP = todayCount * xpPerChapter;
  const levelCap = 500;
  const fillPercent = Math.min((currentXP / levelCap) * 100, 100);

  return (
    <div className="bb-energy-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-primary">XP TODAY</span>
        <span className="text-xs font-mono text-foreground">{currentXP} / {levelCap}</span>
      </div>
      <div className="h-3 bg-muted/40 rounded-full overflow-hidden">
        <motion.div
          className="h-full bb-shimmer rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}