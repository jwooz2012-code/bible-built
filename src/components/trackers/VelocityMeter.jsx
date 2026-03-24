import React from 'react';
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VelocityMeter({ avg7, trend }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'rgb(34,197,94)' : trend === 'down' ? 'rgb(239,68,68)' : 'rgb(148,163,184)';
  const trendBg = trend === 'up' ? 'rgba(34,197,94,0.1)' : trend === 'down' ? 'rgba(239,68,68,0.1)' : 'rgba(148,163,184,0.1)';

  const barHeights = [65, 48, 72, 85, 55, 78, 62];

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border)/0.7)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
      }}
    >
      <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)' }} />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}
          >
            <Zap className="w-4 h-4" style={{ color: 'rgb(34,197,94)' }} />
          </div>
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest">Reading Velocity</p>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: trendBg }}
        >
          <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
          <span className="text-[11px] font-bold" style={{ color: trendColor }}>
            {trend === 'up' ? 'Rising' : trend === 'down' ? 'Slowing' : 'Steady'}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-[3.5rem] font-black text-foreground tracking-tight leading-none"
            style={{ textShadow: '0 0 30px rgba(34,197,94,0.15)' }}
          >
            {avg7.toFixed(1)}
          </motion.p>
          <p className="text-[13px] font-medium mt-1.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
            chapters/day · 7-day avg
          </p>
        </div>

        <div className="flex items-end gap-1 h-14 pb-0.5 flex-shrink-0">
          {barHeights.map((height, idx) => (
            <motion.div
              key={idx}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: `${height}%`, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.05 * idx, ease: 'easeOut' }}
              className="w-2 rounded-full"
              style={{
                backgroundColor: idx === barHeights.length - 1
                  ? 'rgb(34,197,94)'
                  : idx >= barHeights.length - 3
                  ? 'rgba(34,197,94,0.5)'
                  : 'hsl(var(--border))'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}