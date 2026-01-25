import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { getChartColors } from '@/components/utils/chartColors';

export default function XPBar({ todayCount = 0 }) {
  const { resolvedTheme, energyMode } = useTheme();
  const colors = getChartColors(resolvedTheme, energyMode);
  const xpPerChapter = 100;
  const currentXP = todayCount * xpPerChapter;
  const levelCap = 500;
  const fillPercent = Math.min((currentXP / levelCap) * 100, 100);

  // Tick marks at every 100 XP (20% intervals)
  const ticks = [20, 40, 60, 80];

  return (
    <div className="bb-energy-card rounded-xl px-4 py-3">
      <div className="text-center mb-2">
        <span className="text-xs font-bold text-primary block mb-0.5">XP TODAY</span>
        <span className="text-base font-mono text-foreground">{currentXP} / {levelCap} XP</span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: colors.track }}>
        <motion.div
          className="h-full bb-shimmer rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {ticks.map((tick) => (
          <div
            key={tick}
            className="absolute top-0 bottom-0 w-[1px]"
            style={{ 
              left: `${tick}%`,
              backgroundColor: colors.grid
            }}
          />
        ))}
      </div>
    </div>
  );
}