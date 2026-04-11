import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const DAILY_VERSE_GOAL = 30;
const DAILY_XP_REWARD = 100;

export default function DailyVerseGoalBar({ versesReadToday = 0 }) {
  const pct = Math.min((versesReadToday / DAILY_VERSE_GOAL) * 100, 100);
  const isComplete = versesReadToday >= DAILY_VERSE_GOAL;

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-semibold text-foreground">Daily Goal</span>
        </div>
        <span className={`text-xs font-bold ${isComplete ? 'text-green-500' : 'text-muted-foreground'}`}>
          {isComplete ? `+${DAILY_XP_REWARD} XP earned! 🎉` : `${versesReadToday} / ${DAILY_VERSE_GOAL} verses`}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: isComplete ? '#22C55E' : 'linear-gradient(90deg, #EAB308, #F59E0B)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}