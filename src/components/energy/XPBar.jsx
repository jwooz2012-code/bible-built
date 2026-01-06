import React from 'react';
import { motion } from 'framer-motion';

export default function XPBar({ todayCount = 0 }) {
  const xpPerChapter = 100;
  const currentXP = todayCount * xpPerChapter;
  const levelCap = 500;
  const fillPercent = Math.min((currentXP / levelCap) * 100, 100);

  // Tick marks at every 100 XP (20% intervals)
  const ticks = [20, 40, 60, 80];

  return (
    <div className="bb-energy-card rounded-xl p-5">
      <div className="text-center mb-3">
        <span className="text-xs font-bold text-primary block mb-1">XP TODAY</span>
        <span className="text-lg font-mono text-foreground">{currentXP} / {levelCap} XP</span>
      </div>
      <div className="relative h-4 bg-muted/40 rounded-full overflow-hidden">
        <motion.div
          className="h-full bb-shimmer rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {ticks.map((tick) => (
          <div
            key={tick}
            className="absolute top-0 bottom-0 w-[1px] bg-muted-foreground/20"
            style={{ left: `${tick}%` }}
          />
        ))}
      </div>
    </div>
  );
}