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
            <span className="bb-pill">
              Goal Hit
            </span>
          )}
          <span className="text-sm font-semibold text-foreground">
            {chaptersToday} <span className="text-muted-foreground">/ {goal}</span>
          </span>
        </div>
      </div>
      <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bb-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}