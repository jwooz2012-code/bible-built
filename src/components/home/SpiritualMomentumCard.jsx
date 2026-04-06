import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Lock, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCelebration, CELEBRATION_TYPES } from '@/components/celebration/CelebrationContext';
import { triggerHaptic } from '@/components/utils/haptics';

function useCountdown(until) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!until) { setRemaining(null); return; }
    const end = new Date(until).getTime();
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setRemaining(diff);
      if (diff === 0) clearInterval(id);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [until]);

  return remaining;
}

function formatMs(ms) {
  if (ms == null) return '';
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SpiritualMomentumCard({ user }) {
  const { triggerCelebration } = useCelebration();
  const hasTriggeredRef = useRef(false);

  const versesRead = user?.versesReadToday ?? 0;
  const target = user?.dailyVerseTarget ?? 30;
  const isActive = user?.hasActivatedBibleBoost ?? false;
  const boostContent = user?.bibleBoostContent;
  const focus = user?.dailyScriptureFocus;
  const boostActiveUntil = user?.bibleBoostActiveUntil;

  const remaining = useCountdown(boostActiveUntil);
  const boostLive = remaining != null && remaining > 0;

  const progress = Math.min(versesRead / target, 1);
  const percent = Math.round(progress * 100);
  const segments = 10;
  const filledSegments = Math.floor(progress * segments);

  // Trigger celebration when target first reached (handled by hook now, but card can also fire)
  useEffect(() => {
    if (versesRead >= target && !isActive && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
    }
  }, [versesRead, target, isActive]);

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
            <Zap className="w-4 h-4" style={{ color: '#16A34A' }} />
          </div>
          <span className="text-sm font-semibold text-foreground">Daily Momentum</span>
          {boostLive && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(234,179,8,0.15)', color: '#CA8A04' }}>
              ⚡ 1.5× XP — {formatMs(remaining)}
            </span>
          )}
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
                ? boostLive
                  ? 'linear-gradient(90deg, #CA8A04, #EAB308)'
                  : 'linear-gradient(90deg, #16A34A, #22C55E)'
                : 'hsl(var(--muted))',
            }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">
          {isActive
            ? boostLive ? '⚡ Bible Boost active!' : '✅ Bible Boost used today'
            : `${Math.max(0, target - versesRead)} verses to activate Bible Boost`}
        </span>
        <span className="text-xs font-bold" style={{ color: isActive ? '#CA8A04' : '#16A34A' }}>{percent}%</span>
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

      {/* Bible Boost Content — shown when activated */}
      {isActive && boostContent && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 p-3 rounded-xl border"
          style={{ borderColor: 'rgba(234,179,8,0.3)', background: 'rgba(234,179,8,0.06)' }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#CA8A04' }} />
            <span className="text-xs font-semibold" style={{ color: '#CA8A04' }}>Bible Boost Insight</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{boostContent}</p>
        </motion.div>
      )}

      {/* Locked placeholder */}
      {!isActive && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border">
          <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Reach your verse goal to activate 1.5× XP for 15 minutes
          </p>
        </div>
      )}
    </motion.div>
  );
}