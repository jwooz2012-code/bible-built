import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function VelocityMeter({ avg7, trend }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'hsl(var(--chart-3))' : trend === 'down' ? 'hsl(var(--chart-5))' : 'hsl(var(--muted-foreground))';

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">Reading Velocity</h3>
        <TrendIcon className="w-5 h-5" style={{ color: trendColor }} />
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold text-foreground">{avg7.toFixed(1)}</div>
        <div className="text-sm text-muted-foreground mt-1">chapters/day (7-day avg)</div>
      </div>
    </div>
  );
}