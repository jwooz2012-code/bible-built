import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BarChart2, BookOpen, ChevronDown, Check } from 'lucide-react';

// ── Tier config ────────────────────────────────────────────────────────────

function getTier(streak) {
  if (streak >= 100) return {
    ring: '#A855F7',
    glow: 'rgba(168,85,247,0.40)',
    glowLight: 'rgba(168,85,247,0.18)',
    label: 'Legend',
    labelColor: '#7C3AED',
    labelBg: 'rgba(168,85,247,0.12)',
    labelBorder: 'rgba(168,85,247,0.30)',
    badgeBg: 'radial-gradient(135deg at 30% 20%, #C084FC 0%, #7C3AED 60%, #4C1D95 100%)',
    cardGlow: 'rgba(168,85,247,0.10)',
  };
  if (streak >= 30) return {
    ring: '#FACC15',
    glow: 'rgba(250,204,21,0.40)',
    glowLight: 'rgba(250,204,21,0.18)',
    label: 'On Fire',
    labelColor: '#92400E',
    labelBg: 'rgba(250,204,21,0.12)',
    labelBorder: 'rgba(250,204,21,0.35)',
    badgeBg: 'radial-gradient(135deg at 30% 20%, #FDE68A 0%, #FACC15 50%, #B45309 100%)',
    cardGlow: 'rgba(250,204,21,0.10)',
  };
  if (streak >= 7) return {
    ring: '#22C55E',
    glow: 'rgba(34,197,94,0.38)',
    glowLight: 'rgba(34,197,94,0.16)',
    label: 'Consistent',
    labelColor: '#15803D',
    labelBg: 'rgba(34,197,94,0.12)',
    labelBorder: 'rgba(34,197,94,0.30)',
    badgeBg: 'radial-gradient(135deg at 30% 20%, #86EFAC 0%, #22C55E 55%, #14532D 100%)',
    cardGlow: 'rgba(34,197,94,0.10)',
  };
  return {
    ring: '#9CA3AF',
    glow: 'rgba(156,163,175,0.30)',
    glowLight: 'rgba(156,163,175,0.14)',
    label: 'Getting Started',
    labelColor: '#374151',
    labelBg: 'rgba(107,114,128,0.10)',
    labelBorder: 'rgba(107,114,128,0.25)',
    badgeBg: 'radial-gradient(135deg at 30% 20%, #E5E7EB 0%, #9CA3AF 55%, #4B5563 100%)',
    cardGlow: 'rgba(107,114,128,0.08)',
  };
}

// ── Count-up hook ──────────────────────────────────────────────────────────

function useCountUp(target, duration = 900, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(eased * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return value;
}

// ── Streak Emblem ──────────────────────────────────────────────────────────

function StreakEmblem({ streak, animatedStreak, readToday }) {
  const tier = getTier(streak);
  const EMBLEM_SIZE = 160;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: EMBLEM_SIZE, height: EMBLEM_SIZE }}>
        {/* Outer ambient glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: EMBLEM_SIZE + 48,
            height: EMBLEM_SIZE + 48,
            top: -24, left: -24,
            background: `radial-gradient(circle, ${tier.glow} 0%, transparent 65%)`,
          }}
          animate={{ scale: [1, 1.07, 1], opacity: [0.55, 0.9, 0.55] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Mid halo ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: EMBLEM_SIZE + 20,
            height: EMBLEM_SIZE + 20,
            top: -10, left: -10,
            border: `1.5px solid ${tier.ring}`,
            opacity: 0.4,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        />

        {/* Inner ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: EMBLEM_SIZE + 6,
            height: EMBLEM_SIZE + 6,
            top: -3, left: -3,
            border: `2px solid ${tier.ring}`,
            opacity: 0.65,
          }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.65 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
        />

        {/* Main badge circle */}
        <motion.div
          className="relative rounded-full flex items-center justify-center"
          style={{
            width: EMBLEM_SIZE,
            height: EMBLEM_SIZE,
            background: tier.badgeBg,
            boxShadow: `0 10px 40px ${tier.glow}, 0 3px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -1px 0 rgba(0,0,0,0.15)`,
          }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
        >
          {/* Inner highlight sheen */}
          <div
            className="absolute rounded-full"
            style={{
              width: EMBLEM_SIZE - 16,
              height: EMBLEM_SIZE - 16,
              top: 8, left: 8,
              background: 'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.28) 0%, transparent 60%)',
            }}
          />

          {/* Content — always white since badge has a colored gradient bg */}
          <div className="flex flex-col items-center z-10">
            <span className="text-white text-[56px] font-black leading-none tabular-nums" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
              {animatedStreak}
            </span>
            <span className="text-white/85 text-[11px] font-bold tracking-[0.15em] uppercase mt-0.5">
              Day Streak
            </span>
          </div>
        </motion.div>

        {/* Read-today check bubble */}
        <AnimatePresence>
          {readToday && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 1.0, type: 'spring', stiffness: 500, damping: 20 }}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: '#22C55E',
                boxShadow: '0 2px 8px rgba(34,197,94,0.55)',
                outline: '3px solid hsl(var(--background))',
              }}
            >
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tier pill */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.4 }}
        className="mt-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
        style={{
          background: tier.labelBg,
          color: tier.labelColor,
          border: `1px solid ${tier.labelBorder}`,
        }}
      >
        {tier.label}
      </motion.div>

      {/* Status line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        className="text-sm text-foreground/60 mt-2 text-center font-medium"
      >
        {readToday ? 'You showed up today.' : 'Keep your streak alive.'}
      </motion.p>
    </div>
  );
}

// ── Highlight Card ─────────────────────────────────────────────────────────

function HighlightCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      className="flex-1 rounded-3xl p-5 bg-card border border-border/80 shadow-sm dark:shadow-none dark:border-border"
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
        style={{
          background: `${color}1A`,
          border: `1px solid ${color}30`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="text-[30px] font-black text-foreground tabular-nums leading-none">
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground font-semibold mt-1.5 uppercase tracking-wide">
        {label}
      </div>
    </motion.div>
  );
}

function MostReadCard({ value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      className="w-full rounded-3xl p-5 flex items-center gap-4 bg-card border border-border/80"
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{
          background: 'rgba(168,85,247,0.12)',
          border: '1px solid rgba(168,85,247,0.25)',
        }}
      >
        <BookOpen className="w-6 h-6" style={{ color: '#A855F7' }} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest mb-1">Most Read Book</div>
        <div className="text-xl font-black text-foreground leading-tight truncate">
          {value === 'None' || !value ? '—' : value}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function ProgressHero({ currentStreak, records, todayLogs = [], isLoading }) {
  const [expanded, setExpanded] = useState(false);
  const readToday = todayLogs.length > 0;

  const animatedStreak = useCountUp(currentStreak, 900, 120);
  const animatedBestWeek = useCountUp(records.bestRolling7, 800, 350);
  const animatedBestMonth = useCountUp(records.bestMonth, 850, 450);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-6"
    >
      {/* Section header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between mb-6 active:opacity-70 transition-opacity duration-100"
      >
        <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Streak Emblem — open, no enclosing box */}
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={() => setExpanded(v => !v)}
        className="flex justify-center mb-8 cursor-pointer"
      >
        <StreakEmblem
          streak={currentStreak}
          animatedStreak={animatedStreak}
          readToday={readToday}
        />
      </motion.div>

      {/* Highlight cards */}
      <div className="flex gap-3 mb-3">
        <HighlightCard
          icon={Calendar}
          label="Best Week"
          value={animatedBestWeek}
          color="#22C55E"
          delay={0.3}
        />
        <HighlightCard
          icon={BarChart2}
          label="Best Month"
          value={animatedBestMonth}
          color="#3B82F6"
          delay={0.4}
        />
      </div>

      <MostReadCard value={records.mostReadBook.name} delay={0.5} />

      {/* Expandable all-time records */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="mt-4 bg-card border border-border/80 rounded-3xl p-5"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
            >
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">All-Time Records</h3>
              <div className="grid grid-cols-2 gap-3">
                <RecordItem label="Longest Streak" value={`${records.longestStreak} days`} />
                <RecordItem label="Best 7-Day Run" value={`${records.bestRolling7} ch`} />
                <RecordItem label="Best Month" value={`${records.bestMonth} ch`} />
                <RecordItem label="Most Read" value={records.mostReadBook.name} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RecordItem({ label, value }) {
  return (
    <div className="bg-muted/60 border border-border/60 rounded-2xl p-4">
      <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-1.5">{label}</div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}