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
    <div className="bg-card border border-border rounded-2xl p-5 mb-8 shadow-sm">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">This Week</h3>
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((date, i) => {
          const dateKey = getDateKey(date);
          const count = logsGrouped[dateKey] || 0;
          const isToday = getDateKey(today) === dateKey;
          
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDayClick(date)}
              className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all py-3 border"
              style={isToday ? {
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(250, 204, 21, 0.15))',
                borderColor: 'var(--energy-orange)',
                boxShadow: '0 0 16px var(--energy-glow-light, var(--energy-glow-dark, rgba(249, 115, 22, 0.2)))'
              } : {
                background: 'hsl(var(--secondary))',
                borderColor: 'hsl(var(--border))'
              }}
            >
              <span 
                className="text-[10px] font-medium"
                style={{ color: isToday ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}
              >
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span 
                className="text-sm font-semibold"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                {date.getDate()}
              </span>
              <div className="h-[14px] flex items-center justify-center">
                {count > 0 && (
                  <span 
                    className="text-[10px] font-bold"
                    style={{ color: 'hsl(var(--foreground))' }}
                  >
                    {count}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}