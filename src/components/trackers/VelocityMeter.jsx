import React from 'react';
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { getChartColors } from '@/components/utils/chartColors';

export default function VelocityMeter({ avg7, trend }) {
  const { resolvedTheme, energyMode } = useTheme();
  const colors = getChartColors(resolvedTheme, energyMode);
  
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.neutral;
  const trendBg = trend === 'up' ? colors.successBg : trend === 'down' ? colors.errorBg : colors.neutralBg;

  const barHeights = [65, 48, 72, 85, 55, 78, 62];

  return (
    <div
      className="bg-card border border-border/60 rounded-2xl p-5"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'hsl(var(--primary)/0.07)' }}
        >
          <Zap className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
        </div>
        <p className="text-sm font-medium text-muted-foreground flex-1">Reading Velocity</p>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-md"
          style={{ backgroundColor: trendBg }}
        >
          <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
          <span className="text-[10px] font-semibold" style={{ color: trendColor }}>
            {trend === 'up' ? '+' : trend === 'down' ? '−' : '—'}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[3.25rem] font-bold text-foreground tracking-tight leading-none">{avg7.toFixed(1)}</p>
          <p className="text-[10px] font-medium text-muted-foreground/60 mt-2">ch/day avg (7 days)</p>
        </div>

        <div className="flex items-end gap-1 h-12 pb-1">
          {barHeights.map((height, idx) => (
            <div
              key={idx}
              className="w-1.5 rounded-full transition-all"
              style={{
                height: `${height}%`,
                backgroundColor: colors.primaryOpacity
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}