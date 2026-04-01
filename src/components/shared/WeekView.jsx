import React, { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
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

export default function WeekView({ logs = [], tierColor }) {
  const navigate = useNavigate();
  const isDark = useIsDark();
  const { energyMode } = useTheme();
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



  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.4 }}
      className="bg-card border border-border rounded-2xl p-3 mb-4 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-muted-foreground/70 uppercase tracking-wide mb-3">This Week</h3>

      <div className="relative">

        <div className="grid grid-cols-7 gap-1.5 relative">
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
                className="relative flex flex-col items-center justify-center rounded-xl py-1.5 px-1 gap-0.5 transition-colors border"
                style={energyMode ? {
                  minHeight: 54,
                  background: isToday
                    ? 'rgba(28,32,38,0.6)'
                    : hasActivity
                    ? 'rgba(28,32,38,0.9)'
                    : 'hsl(var(--card))',
                  borderColor: isToday
                    ? 'hsl(var(--primary))'
                    : hasActivity
                    ? 'hsla(var(--primary)/0.4)'
                    : 'hsl(var(--border))',
                  borderWidth: isToday ? '2px' : hasActivity ? '1.5px' : '1px',
                  boxShadow: isToday ? '0 0 0 1px hsla(var(--primary)/0.2)' : hasActivity ? 'inset 0 0 8px hsla(var(--primary)/0.1)' : 'none',
                  opacity: (!isToday && !hasActivity) ? 0.45 : 1,
                } : {
                  minHeight: 54,
                  background: isToday
                    ? 'transparent'
                    : hasActivity
                    ? 'hsl(var(--accent))'
                    : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  borderColor: isToday
                    ? 'transparent'
                    : hasActivity
                    ? 'hsl(var(--accent))'
                    : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                  opacity: (!isToday && !hasActivity) ? 0.55 : 1,
                  ...(isToday ? {
                    background: tierColor
                      ? `${tierColor}22`
                      : 'rgba(249,115,22,0.13)',
                    borderColor: tierColor ? `${tierColor}60` : 'rgba(249,115,22,0.4)',
                    boxShadow: `0 0 10px ${tierColor ? tierColor + '30' : 'rgba(249,115,22,0.20)'}`,
                  } : {})
                }}
              >
                {isToday && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    animate={{ opacity: [0.08, 0.16, 0.08] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ background: energyMode ? 'hsl(var(--primary))' : (tierColor || '#F97316') }}
                  />
                )}

                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: energyMode ? 'hsl(var(--muted-foreground))' : (isToday ? (tierColor || '#F97316') : 'hsl(var(--muted-foreground))') }}
                >
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: energyMode ? 'hsl(var(--foreground))' : (isToday ? (tierColor || '#F97316') : 'hsl(var(--foreground))') }}
                >
                  {date.getDate()}
                </span>

                {/* Chapter count or completion dot */}
                <div className="h-4 flex flex-col items-center justify-center gap-0.5">
                  {hasActivity ? (
                    <>
                      <span className="text-[11px] font-bold" style={{ color: energyMode ? 'hsl(var(--accent))' : (isToday ? (tierColor || '#10B981') : '#10B981') }}>
                        {count}
                      </span>
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: energyMode ? 'hsl(var(--accent))' : (isToday ? (tierColor || '#10B981') : '#10B981') }}
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