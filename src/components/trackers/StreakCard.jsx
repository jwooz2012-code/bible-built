import React from 'react';
import { Flame } from 'lucide-react';

export default function StreakCard({ currentStreak, longestStreak }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4" style={{ color: 'hsl(var(--chart-4))' }} />
        <span className="text-sm font-medium text-foreground">Streak</span>
      </div>
      <div className="text-2xl font-bold text-foreground">{currentStreak}</div>
      <div className="text-[13px] text-muted-foreground mt-1">
        Best: {longestStreak} days
      </div>
    </div>
  );
}