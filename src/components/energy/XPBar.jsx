import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { getChartColors } from '@/components/utils/chartColors';

export default function XPBar({ user }) {
  const { resolvedTheme, energyMode } = useTheme();
  const colors = getChartColors(resolvedTheme, energyMode);

  const totalXp = user?.xp ?? 0;
  const level = user?.level ?? 1;
  // XP required to reach next level: level^2 * 100
  const xpForCurrentLevel = (level - 1) * (level - 1) * 100;
  const xpForNextLevel = level * level * 100;
  const xpIntoLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const fillPercent = Math.min((xpIntoLevel / xpNeeded) * 100, 100);

  const ticks = [20, 40, 60, 80];

  return (
    <div className="bb-energy-card rounded-xl px-4 py-3">
      <div className="text-center mb-2">
        <span className="text-xs font-bold text-primary block mb-0.5">LEVEL {level}</span>
        <span className="text-base font-mono text-foreground">{xpIntoLevel} / {xpNeeded} XP to next level</span>
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