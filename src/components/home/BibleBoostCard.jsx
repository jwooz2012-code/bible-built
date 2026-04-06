import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Lock } from 'lucide-react';

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
  if (ms == null || ms <= 0) return '';
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function BibleBoostCard({ user }) {
  const versesRead = user?.versesReadToday ?? 0;
  const target = user?.dailyVerseTarget ?? 30;
  const isActive = user?.hasActivatedBibleBoost ?? false;
  const boostUntil = user?.bibleBoostActiveUntil;
  const boostContent = user?.bibleBoostContent;

  const remaining = useCountdown(boostUntil);
  const boostLive = isActive && remaining != null && remaining > 0;

  const progress = Math.min(versesRead / target, 1);
  const percent = Math.round(progress * 100);
  const segments = 10;
  const filled = Math.floor(progress * segments);

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
              ⚡ BOOST ACTIVE! {formatMs(remaining)}
            </span>
          )}
        </div>
        <span className="text-xs font-medium text-muted-foreground">{versesRead} / {target} verses</span>
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
                ? boostLive
                  ? 'linear-gradient(90deg,#CA8A04,#EAB308)'
                  : 'linear-gradient(90deg,#16A34A,#22C55E)'
                : 'hsl(var(--muted))',
            }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">
          {boostLive
            ? '⚡ 1.5× XP active!'
            : isActive
            ? '✅ Bible Boost used today'
            : `${Math.max(0, target - versesRead)} verses to activate Bible Boost`}
        </span>
        <span className="text-xs font-bold" style={{ color: boostLive ? '#CA8A04' : '#16A34A' }}>{percent}%</span>
      </div>

      {/* Boost content */}
      {isActive && boostContent && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl border text-sm text-foreground leading-relaxed"
          style={{ borderColor: 'rgba(234,179,8,0.3)', background: 'rgba(234,179,8,0.06)' }}
        >
          {boostContent}
        </motion.div>
      )}

      {!isActive && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border">
          <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">Reach your verse goal to activate 1.5× XP for 15 min</p>
        </div>
      )}
    </motion.div>
  );
}