import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function WeeklySummaryCard({ thisWeekChapters, thisWeekActiveDays, deltaVsLastWeek }) {
  const TrendIcon = deltaVsLastWeek > 0 ? TrendingUp : deltaVsLastWeek < 0 ? TrendingDown : Minus;
  const trendColor = deltaVsLastWeek > 0 ? 'hsl(var(--chart-3))' : deltaVsLastWeek < 0 ? 'hsl(var(--chart-5))' : 'hsl(var(--muted-foreground))';

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-semibold text-foreground">This Week</span>
        <div className="flex items-center gap-1">
          <TrendIcon className="w-3.5 h-3.5" style={{ color: trendColor }} />
          <span className="text-sm font-medium" style={{ color: trendColor }}>
            {deltaVsLastWeek > 0 ? '+' : ''}{deltaVsLastWeek}
          </span>
        </div>
      </div>
      <div className="text-3xl font-bold text-foreground">{thisWeekChapters}</div>
      <div className="text-sm text-muted-foreground mt-1">
        {thisWeekActiveDays} active {thisWeekActiveDays === 1 ? 'day' : 'days'}
      </div>
    </div>
  );
}