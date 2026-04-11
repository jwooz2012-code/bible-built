import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame } from 'lucide-react';

const DAILY_VERSE_GOAL = 30;
const DAILY_XP_REWARD = 100;

const ARTIFACT_BOOSTS = {
  'ark-of-the-covenant': 1.20,
  'sword-goliath': 1.15,
  'coat-of-many-colors': 1.11,
  'sling-of-david': 1.12,
  'davids-harp': 1.13,
  'jar-of-manna': 1.08,
  'noahs-hammer': 1.09,
};

function getMultiplier(user) {
  const ids = user?.equippedArtifactIds ?? [];
  let m = 1.0;
  for (const id of ids) {
    if (ARTIFACT_BOOSTS[id]) m *= ARTIFACT_BOOSTS[id];
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
        borderColor: isComplete ? 'rgba(34,197,94,0.4)' : hasBoost ? 'rgba(234,179,8,0.35)' : 'hsl(var(--border))',
      }}
    >
      <div className="px-4 pt-3 pb-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: isComplete ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.18)' }}
            >
              {isComplete ? (
                <Flame className="w-4 h-4 text-green-500" />
              ) : (
                <Zap className="w-4 h-4 text-yellow-400" />
              )}
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">Daily Verse Goal</span>
              {hasBoost && !isComplete && (
                <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(234,179,8,0.18)', color: '#D97706' }}>
                  +{boostPct}% BOOST ACTIVE
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            {isComplete ? (
              <span className="text-sm font-bold text-green-500">
                +{hasBoost ? boostedXP : DAILY_XP_REWARD} XP 🎉
              </span>
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">
                {versesReadToday} / {DAILY_VERSE_GOAL}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              background: isComplete
                ? 'linear-gradient(90deg, #16A34A, #22C55E)'
                : 'linear-gradient(90deg, #CA8A04, #EAB308, #FDE047)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* shimmer */}
            {!isComplete && (
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                  animation: 'shimmer 2s infinite',
                }}
              />
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-muted-foreground">
            {isComplete ? 'Goal complete! Come back tomorrow.' : `${DAILY_VERSE_GOAL - versesReadToday} verses to go`}
          </span>
          <span className="text-[11px] font-semibold" style={{ color: hasBoost ? '#D97706' : 'hsl(var(--muted-foreground))' }}>
            {hasBoost
              ? `${DAILY_XP_REWARD} × ${multiplier.toFixed(2)}× = ${boostedXP} XP`
              : `${DAILY_XP_REWARD} XP reward`}
          </span>
        </div>
      </div>
    </div>
  );
}