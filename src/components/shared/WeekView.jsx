import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getDateKey } from '@/components/bible/utils/dateUtils';

function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export default function WeekView({ logs = [] }) {
  const navigate = useNavigate();
  const isDark = useIsDark();
  const today = new Date();

  const startOfWeek = new Date(today);
  const diff = startOfWeek.getDate() - startOfWeek.getDay();
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const logsGrouped = logs.reduce((acc, log) => {
    acc[log.dateKey] = (acc[log.dateKey] || 0) + 1;
    return acc;
  }, {});

  const todayKey = getDateKey(today);

  // Determine consecutive streak days for connector line
  const activeDayIndices = weekDays
    .map((d, i) => ({ i, key: getDateKey(d), count: logsGrouped[getDateKey(d)] || 0 }))
    .filter(d => d.count > 0)
    .map(d => d.i);

  // Build a set of consecutive pairs for the connector
  const connectorPairs = new Set();
  for (let k = 0; k < activeDayIndices.length - 1; k++) {
    if (activeDayIndices[k + 1] === activeDayIndices[k] + 1) {
      connectorPairs.add(activeDayIndices[k]);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.4 }}
      className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-muted-foreground/70 uppercase tracking-wide mb-4">This Week</h3>

      {/* Connector line layer (behind cells) */}
      <div className="relative">
        {/* SVG for streak connectors */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
          preserveAspectRatio="none"
        >
          {weekDays.map((_, i) => {
            if (!connectorPairs.has(i)) return null;
            // Each cell is 1/7 of the width; connector goes from center of col i to center of col i+1
            const x1 = `${(i / 7 + 1 / 14) * 100}%`;
            const x2 = `${((i + 1) / 7 + 1 / 14) * 100}%`;
            return (
              <line
                key={i}
                x1={x1} y1="50%" x2={x2} y2="50%"
                stroke={isDark ? 'rgba(251,146,60,0.35)' : 'rgba(249,115,22,0.50)'}
                strokeWidth="2"
              />
            );
          })}
        </svg>

        <div className="grid grid-cols-7 gap-1.5 relative" style={{ zIndex: 1 }}>
          {weekDays.map((date, i) => {
            const dateKey = getDateKey(date);
            const count = logsGrouped[dateKey] || 0;
            const isToday = todayKey === dateKey;
            const hasActivity = count > 0;

            return (
              <motion.button
                key={i}
                whileTap={{ scale: 1.05 }}
                onClick={() => navigate(createPageUrl('Calendar'))}
                className="relative flex flex-col items-center justify-center rounded-xl py-2.5 px-1 gap-0.5 transition-colors border"
                style={{
                  minHeight: 64,
                  background: isToday
                    ? 'transparent'
                    : hasActivity
                    ? 'hsl(var(--accent))'
                    : 'hsl(var(--card))',
                  borderColor: isToday
                    ? 'transparent'
                    : hasActivity
                    ? 'hsl(var(--accent))'
                    : 'hsl(var(--border))',
                  // Today gets a fire gradient bg via inline style
                  ...(isToday ? {
                    background: 'linear-gradient(135deg, #F97316, #FDE047)',
                    border: 'none',
                    boxShadow: '0 0 14px rgba(249,115,22,0.38)',
                  } : {})
                }}
              >
                {isToday && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ background: 'linear-gradient(135deg, #F97316, #FDE047)', opacity: 0.15 }}
                  />
                )}

                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: isToday ? '#fff' : 'hsl(var(--muted-foreground))' }}
                >
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: isToday ? '#fff' : 'hsl(var(--foreground))' }}
                >
                  {date.getDate()}
                </span>

                {/* Chapter count or completion dot */}
                <div className="h-4 flex flex-col items-center justify-center gap-0.5">
                  {hasActivity ? (
                    <>
                      <span className="text-[11px] font-bold" style={{ color: isToday ? '#fff' : '#22C55E' }}>
                        {count}
                      </span>
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: isToday ? 'rgba(255,255,255,0.8)' : '#22C55E' }}
                      />
                    </>
                  ) : (
                    <div className="w-1.5 h-1.5" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}