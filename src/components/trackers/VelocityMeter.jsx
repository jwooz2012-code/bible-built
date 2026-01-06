import React from 'react';
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';

export default function VelocityMeter({ avg7, trend }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#9CA3AF';
  const trendBg = trend === 'up' ? 'bg-green-500/10' : trend === 'down' ? 'bg-red-500/10' : 'bg-muted';

  // Generate micro bars for visualization (last 7 days simulation)
  const barHeights = [65, 48, 72, 85, 55, 78, 62];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground">Reading Velocity</h3>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${trendBg}`}>
          <TrendIcon className="w-3.5 h-3.5" style={{ color: trendColor }} />
          <span className="text-xs font-medium" style={{ color: trendColor }}>
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
          </span>
        </div>
      </div>
      
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{avg7.toFixed(1)}</span>
            <Zap className="w-5 h-5 text-primary mb-1" />
          </div>
          <div className="text-xs text-muted-foreground mt-1">ch/day</div>
        </div>
        
        <div className="flex items-end gap-1 h-12">
          {barHeights.map((height, idx) => (
            <div
              key={idx}
              className="w-1 rounded-full bg-primary/30 transition-all"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}