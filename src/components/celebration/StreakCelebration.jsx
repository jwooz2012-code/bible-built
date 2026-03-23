import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function StreakCelebration({ data, onDismiss }) {
  const { days } = data;
  const DURATION = 5000;

  useEffect(() => {
    const t = setTimeout(onDismiss, DURATION);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className="fixed bottom-[140px] left-0 right-0 z-[9998] flex justify-center px-5 pointer-events-none"
    >
      <div
        className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl overflow-hidden pointer-events-auto cursor-pointer"
        onClick={onDismiss}
      >
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="w-11 h-11 flex-shrink-0 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-500" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
              Streak Milestone
            </p>
            <p className="text-base font-bold text-foreground leading-tight mt-0.5">
              {days}-Day Streak
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Keep showing up. It matters.
            </p>
          </div>
          <span className="text-4xl font-black text-foreground/8 select-none flex-shrink-0 tabular-nums">
            {days}
          </span>
        </div>
        {/* Progress bar */}
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: DURATION / 1000, ease: 'linear' }}
          style={{ originX: 0 }}
          className="h-[2px] bg-orange-500/30"
        />
      </div>
    </motion.div>
  );
}