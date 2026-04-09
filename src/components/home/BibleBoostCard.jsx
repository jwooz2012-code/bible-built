import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2 } from 'lucide-react';

export default function BibleBoostCard({ user, versesReadTodayOverride, xpEarnedToday }) {
  const versesRead = versesReadTodayOverride ?? user?.versesReadToday ?? 0;
  const target = user?.dailyVerseTarget ?? 30;
  const goalMet = versesRead >= target;
  const todayXp = xpEarnedToday ?? Math.round(versesRead * 5);

  const progress = goalMet ? 1 : Math.min(versesRead / target, 1);
  const percent = Math.round(progress * 100);

  if (goalMet) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-border bg-card p-4 mb-5 shadow-sm"
      >
        <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(34,197,94,0.12)' }}>
          <CheckCircle2 className="w-5 h-5" style={{ color: '#16A34A' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Daily Goal Met! ✨</p>
          <p className="text-xs text-muted-foreground mt-0.5">{target} verses read today</p>
        </div>
        </div>
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg,#16A34A,#22C55E)' }}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    );
  }

  // In-progress state
  const segments = 10;
  const filled = Math.floor(progress * segments);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-4 mb-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)' }}>
            <Zap className="w-4 h-4" style={{ color: '#16A34A' }} />
          </div>
          <span className="text-sm font-semibold text-foreground">Daily Momentum</span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">{versesRead} / {target} verses</span>
      </div>

      <div className="flex gap-1 mb-3">
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 h-2 rounded-full"
            initial={false}
            animate={{
              background: i < filled
                ? 'linear-gradient(90deg,#16A34A,#22C55E)'
                : 'hsl(var(--muted))',
            }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {Math.max(0, target - versesRead)} verses to reach daily goal
        </span>
        <span className="text-xs font-semibold" style={{ color: '#16A34A' }}>{percent}%</span>
      </div>
    </motion.div>
  );
}