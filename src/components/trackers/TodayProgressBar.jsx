import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { getChartColors } from '@/components/utils/chartColors';

export default function TodayProgressBar({ chaptersToday, goal = 3 }) {
  const { resolvedTheme, energyMode } = useTheme();
  const colors = getChartColors(resolvedTheme, energyMode);
  const percent = Math.min(100, (chaptersToday / goal) * 100);
  const goalHit = chaptersToday >= goal;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-base font-semibold text-foreground">Today</span>
        <div className="flex items-center gap-2">
          {goalHit && (
            <span className="text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              Goal Hit
            </span>
          )}
          <span className="text-base font-medium text-muted-foreground">
            {chaptersToday} / {goal}
          </span>
        </div>
      </div>
      <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.track }}>
        <motion.div
          className={`h-full ${energyMode ? 'bb-shimmer' : ''}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            backgroundColor: energyMode ? undefined : colors.primary,
            boxShadow: goalHit ? '0 0 12px hsl(var(--primary) / 0.4)' : undefined
          }}
        />
      </div>
    </div>
  );
}