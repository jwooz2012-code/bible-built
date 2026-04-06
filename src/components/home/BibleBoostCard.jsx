import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, Lock } from 'lucide-react';

export default function BibleBoostCard({ user }) {
  const versesRead = user?.versesReadToday ?? 0;
  const target = user?.dailyVerseTarget ?? 30;
  const goalMet = user?.hasActivatedBibleBoost ?? false;

  const progress = goalMet ? 1 : Math.min(versesRead / target, 1);
  const percent = Math.round(progress * 100);
  const segments = 10;
  const filled = goalMet ? segments : Math.floor(progress * segments);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-4 mb-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)' }}>
            {goalMet
              ? <CheckCircle className="w-4 h-4" style={{ color: '#16A34A' }} />
              : <Zap className="w-4 h-4" style={{ color: '#16A34A' }} />
            }
          </div>
          <span className="text-sm font-semibold text-foreground">Daily Momentum</span>
          {goalMet && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#16A34A' }}>
              Daily Goal Met! ✨
            </span>
          )}
        </div>
        <span className="text-xs font-medium text-muted-foreground">{Math.min(versesRead, target)} / {target} verses</span>
      </div>

      {/* Segmented bar */}
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
          {goalMet
            ? '+100 bonus XP earned today'
            : `${Math.max(0, target - versesRead)} verses to reach daily goal`}
        </span>
        <span className="text-xs font-bold" style={{ color: '#16A34A' }}>{percent}%</span>
      </div>

      {!goalMet && (
        <div className="flex items-center gap-2 px-3 py-2 mt-3 rounded-xl border border-dashed border-border">
          <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">Reach {target} verses to earn +100 bonus XP</p>
        </div>
      )}
    </motion.div>
  );
}