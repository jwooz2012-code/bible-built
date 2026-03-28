import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BarChart2, BookOpen, ChevronDown, Check } from 'lucide-react';

// ── Tier config ────────────────────────────────────────────────────────────

function getTier(streak) {
  if (streak >= 100) return {
    ring: '#A855F7',
    ringLight: '#C084FC',
    glow: 'rgba(168,85,247,0.45)',
    glowSoft: 'rgba(168,85,247,0.12)',
    label: 'Legend',
    labelColor: '#A855F7',
    badgeBg: 'radial-gradient(135deg at 30% 20%, #C084FC 0%, #7C3AED 60%, #4C1D95 100%)',
  };
  if (streak >= 30) return {
    ring: '#FACC15',
    ringLight: '#FDE68A',
    glow: 'rgba(250,204,21,0.45)',
    glowSoft: 'rgba(250,204,21,0.12)',
    label: 'On Fire',
    labelColor: '#B45309',
    badgeBg: 'radial-gradient(135deg at 30% 20%, #FDE68A 0%, #FACC15 50%, #B45309 100%)',
  };
  if (streak >= 7) return {
    ring: '#22C55E',
    ringLight: '#86EFAC',
    glow: 'rgba(34,197,94,0.40)',
    glowSoft: 'rgba(34,197,94,0.10)',
    label: 'Consistent',
    labelColor: '#15803D',
    badgeBg: 'radial-gradient(135deg at 30% 20%, #86EFAC 0%, #22C55E 55%, #14532D 100%)',
  };
  return {
    ring: '#9CA3AF',
    ringLight: '#D1D5DB',
    glow: 'rgba(156,163,175,0.30)',
    glowSoft: 'rgba(156,163,175,0.08)',
    label: 'Getting Started',
    labelColor: '#6B7280',
    badgeBg: 'radial-gradient(135deg at 30% 20%, #E5E7EB 0%, #9CA3AF 55%, #4B5563 100%)',
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
        {/* Outer ambient glow — largest, softest */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: EMBLEM_SIZE + 48,
            height: EMBLEM_SIZE + 48,
            top: -24, left: -24,
            background: `radial-gradient(circle, ${tier.glow} 0%, transparent 65%)`,
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }}
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
            opacity: 0.35,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.35 }}
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
            opacity: 0.6,
          }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
        />

        {/* Main badge circle */}
        <motion.div
          className="relative rounded-full flex items-center justify-center"
          style={{
            width: EMBLEM_SIZE,
            height: EMBLEM_SIZE,
            background: tier.badgeBg,
            boxShadow: `0 8px 32px ${tier.glow}, 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.25)`,
          }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
        >
          {/* Inner highlight */}
          <div
            className="absolute rounded-full"
            style={{
              width: EMBLEM_SIZE - 16,
              height: EMBLEM_SIZE - 16,
              top: 8, left: 8,
              background: 'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.22) 0%, transparent 65%)',
            }}
          />

          {/* Content */}
          <div className="flex flex-col items-center z-10">
            <span className="text-white text-[56px] font-black leading-none tabular-nums drop-shadow-sm">
              {animatedStreak}
            </span>
            <span className="text-white/80 text-[11px] font-bold tracking-[0.15em] uppercase mt-0.5">
              Day Streak
            </span>
          </div>
        </motion.div>

        {/* Read-today check bubble — floats bottom-right */}
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
                boxShadow: '0 2px 8px rgba(34,197,94,0.5), 0 0 0 3px hsl(var(--background))',
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
          background: tier.glowSoft,
          color: tier.labelColor,
          border: `1px solid ${tier.ring}40`,
        }}
      >
        {tier.label}
      </motion.div>

      {/* Status line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        className="text-sm text-muted-foreground mt-2 text-center font-medium"
      >
        {readToday ? 'You showed up today.' : 'Keep your streak alive.'}
      </motion.p>
    </div>
  );
}

// ── Highlight Card ─────────────────────────────────────────────────────────

function HighlightCard({ icon: Icon, label, value, color, glow, delay = 0, fullWidth = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      className={`rounded-3xl p-5 ${fullWidth ? 'w-full' : 'flex-1'}`}
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        boxShadow: `0 4px 24px ${glow || 'transparent'}, 0 1px 4px rgba(0,0,0,0.08)`,
      }}
    >
      {/* Icon badge */}
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
        style={{
          background: `${color}18`,
          boxShadow: `0 0 0 1px ${color}28`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>

      <div className="text-[28px] font-black text-foreground tabular-nums leading-none">
        {value}
      </div>
      <div className="text-[12px] text-muted-foreground font-semibold mt-1.5 uppercase tracking-wide">
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
      className="w-full rounded-3xl p-5 flex items-center gap-4"
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        boxShadow: '0 4px 24px rgba(168,85,247,0.10), 0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{
          background: 'rgba(168,85,247,0.12)',
          boxShadow: '0 0 0 1px rgba(168,85,247,0.25)',
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
          glow="rgba(34,197,94,0.10)"
          delay={0.3}
        />
        <HighlightCard
          icon={BarChart2}
          label="Best Month"
          value={animatedBestMonth}
          color="#3B82F6"
          glow="rgba(59,130,246,0.10)"
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
            <div className="mt-4 bg-card border border-border rounded-3xl p-5">
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
    <div className="bg-secondary/60 rounded-2xl p-4">
      <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-1.5">{label}</div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}