import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getDateKey } from '@/components/bible/utils/dateUtils';

export default function WeekView({ logs = [] }) {
  const navigate = useNavigate();
  const today = new Date();

  // Get start of week (Sunday)
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day;
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // Generate 7 days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const logsGrouped = logs.reduce((acc, log) => {
    acc[log.dateKey] = (acc[log.dateKey] || 0) + 1;
    return acc;
  }, {});

  const handleDayClick = (date) => {
    navigate(createPageUrl('Calendar'));
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-sm">
      <h3 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide mb-4">This Week</h3>
      <div className="grid grid-cols-7 gap-2.5">
        {weekDays.map((date, i) => {
          const dateKey = getDateKey(date);
          const count = logsGrouped[dateKey] || 0;
          const isToday = getDateKey(today) === dateKey;

          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDayClick(date)}
              className="py-3 rounded-xl aspect-square flex flex-col items-center justify-center gap-0.5 transition-all border"
              style={isToday ? {
                background: 'color-mix(in srgb, hsl(var(--primary)) 15%, transparent)',
                borderColor: 'hsl(var(--primary))',
                borderWidth: '2px'
              } : count > 0 ? {
                background: 'color-mix(in srgb, hsl(var(--primary)) 8%, transparent)',
                borderColor: 'color-mix(in srgb, hsl(var(--primary)) 35%, transparent)',
                borderWidth: '1.5px'
              } : {
                background: 'hsl(var(--muted))',
                borderColor: 'hsl(var(--border))'
              }}>

              <span
                className="text-xs font-medium tracking-wide"
                style={{ color: isToday ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}>

                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span
                className="text-lg font-semibold my-0.5"
                style={{ color: isToday ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))' }}>

                {date.getDate()}
              </span>
              <div className="h-4 flex items-center justify-center">
                {count > 0 &&
                <span
                  className="text-xs font-bold"
                  style={{ color: isToday ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))' }}>

                    {count}
                  </span>
                }
              </div>
            </motion.button>);

        })}
      </div>
    </div>);

}