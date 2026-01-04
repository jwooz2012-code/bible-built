import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getDateKey } from '@/components/bible/utils/dateUtils';

export default function WeekView({ logs = [] }) {
  const navigate = useNavigate();
  const today = new Date();
  
  // Get start of week (Monday)
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
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
    // Note: Calendar page would need to accept URL params to pre-select a date
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-6">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">This Week</h3>
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, i) => {
          const dateKey = getDateKey(date);
          const count = logsGrouped[dateKey] || 0;
          const isToday = getDateKey(today) === dateKey;
          
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDayClick(date)}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all
                ${isToday ? 'bg-accent text-white' : count > 0 ? 'bg-accent/10' : 'bg-secondary'}
                hover:bg-accent/20 border border-border
              `}
            >
              <span className={`text-[10px] font-medium ${isToday ? 'text-white/70' : 'text-muted-foreground'}`}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className={`text-sm font-bold ${isToday ? 'text-white' : 'text-foreground'}`}>
                {date.getDate()}
              </span>
              {count > 0 && (
                <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-accent'}`} />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}