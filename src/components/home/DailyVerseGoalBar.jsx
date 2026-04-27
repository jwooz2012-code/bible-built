import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame } from 'lucide-react';
import { getArtifactById } from '@/data/artifactCatalog';

const DAILY_VERSE_GOAL = 30;
const DAILY_XP_REWARD = 100;

function getMultiplier(user) {
  const ids = user?.equippedArtifactIds ?? [];
  let m = 1.0;
  for (const id of ids) {
    const artifact = getArtifactById(id);
    if (artifact?.xpBoost) m *= artifact.xpBoost;
  }
  return m;
}

export default function DailyVerseGoalBar({ versesReadToday = 0, user }) {
  const pct = Math.min((versesReadToday / DAILY_VERSE_GOAL) * 100, 100);
  const isComplete = versesReadToday >= DAILY_VERSE_GOAL;
  const multiplier = getMultiplier(user);
  const hasBoost = multiplier > 1.0;
  const boostedXP = Math.round(DAILY_XP_REWARD * multiplier);
  const boostPct = Math.round((multiplier - 1) * 100);

  return (
    <div
      className="rounded-2xl border mb-4 overflow-hidden"
      style={{
        background: isComplete
          ? 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(16,185,129,0.08))'
          : hasBoost
          ? 'linear-gradient(135deg, rgba(234,179,8,0.1), rgba(245,158,11,0.06))'
          : 'hsl(var(--card))',
        borderColor: isComplete ? 'rgba(34,197,94,0.4)' : hasBoost ? 'rgba(234,179,8,0.4)' : 'hsl(var(--border))',
      }}
    >
      <div className="px-4 pt-3 pb-3">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: isComplete ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)' }}
            >
              {isComplete ? (
                <Flame className="w-4 h-4 text-green-500" />
              ) : (
                <Zap className="w-4 h-4 text-yellow-400" />
              )}
            </div>
            <span className="text-sm font-bold text-foreground">Daily Verse Goal</span>
          </div>

          {/* XP reward — always visible */}
          <div className="flex items-center gap-1.5">
            {hasBoost && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(234,179,8,0.22)', color: '#B45309' }}
              >
                +{boostPct}% boost
              </span>
            )}
            <span
              className="text-sm font-bold"
              style={{ color: isComplete ? '#16A34A' : hasBoost ? '#D97706' : 'hsl(var(--foreground))' }}
            >
              {isComplete ? '🎉' : ''} {hasBoost ? boostedXP : DAILY_XP_REWARD} XP
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isComplete
                ? 'linear-gradient(90deg, #16A34A, #22C55E)'
                : 'linear-gradient(90deg, #CA8A04, #EAB308, #FDE047)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-muted-foreground">
            {isComplete ? 'Goal complete! Come back tomorrow.' : `${versesReadToday} / ${DAILY_VERSE_GOAL} verses`}
          </span>
          {hasBoost && (
            <span className="text-[11px] text-muted-foreground">
              {DAILY_XP_REWARD} × {multiplier.toFixed(2)}× = <span className="font-semibold" style={{ color: '#D97706' }}>{boostedXP} XP</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}