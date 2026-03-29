import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const GRACE_DAYS_PER_MONTH = 2;

function GraceDot({ filled, color }) {
  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: filled ? color : 'transparent',
        border: `1.5px solid ${filled ? color : 'rgba(161,161,170,0.5)'}`,
        transition: 'all 0.3s ease',
      }}
    />
  );
}

export default function GraceDaysBanner({ userId, tierColor }) {
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const color = tierColor || '#10B981';

  const { data: graceDayRecords = [] } = useQuery({
    queryKey: ['graceDays', userId],
    queryFn: () => base44.entities.GraceDay.filter({ userId }),
    enabled: !!userId,
    staleTime: 30000,
  });

  const currentRecord = graceDayRecords.find(r => r.monthKey === currentMonthKey);
  const graceDaysUsed = currentRecord?.graceDaysUsed || 0;
  const graceDaysAvailable = Math.max(0, GRACE_DAYS_PER_MONTH - graceDaysUsed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-card border border-border rounded-2xl px-4 py-3 mb-4"
      style={{
        boxShadow: `0 0 12px ${color}10`,
        borderColor: `${color}25`,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-semibold text-foreground tracking-wide">Grace Days This Month</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Miss up to 2 days each month without losing your streak.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 ml-4">
          <div className="flex gap-1.5">
            {Array.from({ length: GRACE_DAYS_PER_MONTH }, (_, i) => (
              <GraceDot
                key={i}
                filled={i < graceDaysAvailable}
                color={color}
              />
            ))}
          </div>
          <p className="text-[10px] font-medium text-muted-foreground">
            {graceDaysAvailable === 0
              ? 'None left'
              : graceDaysAvailable === 1
              ? '1 left'
              : '2 left'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}