import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Lock, Unlock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCelebration, CELEBRATION_TYPES } from '@/components/celebration/CelebrationContext';
import { triggerHaptic } from '@/components/utils/haptics';

export default function SpiritualMomentumCard({ user }) {
  const { triggerCelebration } = useCelebration();
  const hasTriggeredRef = useRef(false);

  const versesRead = user?.versesReadToday ?? 0;
  const target = user?.dailyVerseTarget ?? 100;
  const isUnlocked = user?.hasUnlockedDailyRevelation ?? false;
  const revelation = user?.dailyRevelationContent;
  const focus = user?.dailyScriptureFocus;

  const progress = Math.min(versesRead / target, 1);
  const percent = Math.round(progress * 100);

  // Trigger celebration when target is first reached
  useEffect(() => {
    if (versesRead >= target && !isUnlocked && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      triggerHaptic('heavy');
      triggerCelebration(CELEBRATION_TYPES.DAILY_REVELATION_UNLOCKED, {
        title: 'Daily Revelation Unlocked!',
        message: 'You\'ve reached your daily verse goal.',
      });
      base44.auth.updateMe({ hasUnlockedDailyRevelation: true });
    }
  }, [versesRead, target, isUnlocked, triggerCelebration]);

  // Segment-based progress bar
  const segments = 10;
  const filledSegments = Math.floor(progress * segments);

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
            <Sparkles className="w-4 h-4" style={{ color: '#16A34A' }} />
          </div>
          <span className="text-sm font-semibold text-foreground">Daily Momentum</span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {versesRead} / {target} verses
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="flex gap-1 mb-3">
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 h-2 rounded-full"
            initial={false}
            animate={{
              background: i < filledSegments
                ? 'linear-gradient(90deg, #16A34A, #22C55E)'
                : isUnlocked
                ? 'rgba(34,197,94,0.2)'
                : 'hsl(var(--muted))',
            }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">
          {isUnlocked ? '✨ Goal reached!' : `${target - versesRead > 0 ? target - versesRead : 0} verses to unlock revelation`}
        </span>
        <span className="text-xs font-bold" style={{ color: '#16A34A' }}>{percent}%</span>
      </div>

      {/* Daily Scripture Focus */}
      {focus && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(34,197,94,0.07)' }}>
          <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: '#16A34A' }} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              Today's Focus: {focus.book} {focus.chapter}
            </p>
            {focus.theme && (
              <p className="text-xs text-muted-foreground truncate">{focus.theme}</p>
            )}
          </div>
        </div>
      )}

      {/* Daily Revelation — shown only when unlocked */}
      {isUnlocked && revelation && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 p-3 rounded-xl border"
          style={{ borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)' }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Unlock className="w-3.5 h-3.5" style={{ color: '#16A34A' }} />
            <span className="text-xs font-semibold" style={{ color: '#16A34A' }}>Today's Revelation</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{revelation}</p>
        </motion.div>
      )}

      {/* Locked revelation placeholder */}
      {!isUnlocked && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border">
          <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Keep reading to unlock today's revelation
          </p>
        </div>
      )}
    </motion.div>
  );
}