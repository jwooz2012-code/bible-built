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
    <div className="bg-card border border-border rounded-2xl p-5 mb-8 shadow-sm">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">This Week</h3>
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
                border
                ${isToday ? 'bg-accent/12 border-accent' : count > 0 ? 'bg-accent/8 border-accent/20' : 'bg-secondary border-border'}
              `}
            >
              <span className={`text-[10px] font-medium ${isToday ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className={`text-sm font-semibold ${isToday ? 'text-accent' : 'text-foreground'}`}>
                {date.getDate()}
              </span>
              {count > 0 && (
                <div className="min-w-[18px] h-[14px] px-1.5 rounded-full flex items-center justify-center bg-[#EEF1F5] dark:bg-[#1C2433] mt-0.5">
                  <span className="text-[9px] font-semibold text-[#4B5563] dark:text-[#9CA3AF]">{count}</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}