import React from 'react';
import { motion } from 'framer-motion';

export default function TodayProgressBar({ chaptersToday, goal = 3 }) {
  const percent = Math.min(100, (chaptersToday / goal) * 100);
  const goalHit = chaptersToday >= goal;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">Today</span>
        <div className="flex items-center gap-2">
          {goalHit && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              Goal Hit
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {chaptersToday} / {goal}
          </span>
        </div>
      </div>
      <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bb-progress-gradient"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={goalHit ? { boxShadow: '0 0 12px hsl(var(--primary) / 0.4)' } : {}}
        />
      </div>
    </div>
  );
}