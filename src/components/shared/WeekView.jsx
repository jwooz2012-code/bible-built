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
      <h3 className="text-sm font-semibold text-muted-foreground/70 uppercase tracking-wide mb-4">This Week</h3>
      <div className="grid grid-cols-7 gap-2.5">
        {weekDays.map((date, i) => {
          const dateKey = getDateKey(date);
          const count = logsGrouped[dateKey] || 0;
          const isToday = getDateKey(today) === dateKey;

          // Match Calendar's dark tile styling
          const getTilestyle = () => {
            if (isToday) {
              return count > 0 
                ? {
                    background: 'hsl(var(--accent))',
                    borderColor: 'hsl(var(--primary))',
                    borderWidth: '2px',
                    boxShadow: '0 0 0 1px hsla(var(--primary) / 0.1)'
                  }
                : {
                    background: 'hsla(var(--accent) / 0.08)',
                    borderColor: 'hsl(var(--primary))',
                    borderWidth: '2px',
                    boxShadow: '0 0 0 1px hsla(var(--primary) / 0.1)'
                  };
            }
            if (count > 0) {
              return {
                background: 'hsl(var(--accent))',
                borderWidth: '1.5px',
                borderColor: 'hsl(var(--accent))'
              };
            }
            return {
              background: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))'
            };
          };

          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDayClick(date)}
              className="aspect-square rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 transition-all text-sm font-medium hover:opacity-80 border"
              style={getTilestyle()}>

              <span
                className="text-sm font-medium tracking-wide"
                style={{ color: isToday ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>

                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span
                className="text-base font-semibold"
                style={{ color: isToday || count > 0 ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))' }}>

                {date.getDate()}
              </span>
              <div className="h-4 flex items-center justify-center">
                {count > 0 &&
                <span
                  className="text-sm font-bold"
                  style={{ color: '#10B981' }}>

                    {count}
                  </span>
                }
              </div>
            </motion.button>);

        })}
      </div>
    </div>);

}