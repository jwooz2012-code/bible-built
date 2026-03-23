import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const COPY = {
  3:   "Three days straight. The habit is starting.",
  7:   "One full week of faithfulness.",
  14:  "Two weeks. Consistency is becoming character.",
  30:  "Thirty days. This is who you are now.",
  50:  "Fifty days. Most people quit long before this.",
  100: "One hundred days in the Word. Remarkable.",
  150: "150 days. You're building something lasting.",
  200: "200 days. This discipline is extraordinary.",
  365: "A full year. The Word has been with you every day.",
};

export default function StreakCelebration({ count, onDismiss }) {
  const copy = COPY[count] || `${count} days of staying consistent. Keep showing up.`;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-end justify-center p-6 pb-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onDismiss}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <motion.div
        className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <span className="text-4xl font-black text-foreground tabular-nums leading-none">
              {count}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">
              Day Streak
            </p>
            <p className="text-sm text-muted-foreground leading-snug">
              {copy}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <Button
            variant="outline"
            className="w-full h-10 text-sm font-medium rounded-xl"
            onClick={onDismiss}
          >
            Let's Go
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}