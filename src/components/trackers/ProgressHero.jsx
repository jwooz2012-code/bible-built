import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BarChart2, BookOpen, ChevronDown, Check } from 'lucide-react';

// ── Tier config ────────────────────────────────────────────────────────────

const TIERS = [
  {
    min: 0, max: 6, label: 'Getting Started', next: 7, nextLabel: 'Disciple',
    ring: '#9CA3AF',
    badgeBg: 'linear-gradient(145deg, #E5E7EB 0%, #9CA3AF 50%, #6B7280 100%)',
    glow: 'rgba(156,163,175,0.30)',
    pill: { bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.20)', color: '#374151', colorDark: '#D1D5DB' },
  },
  {
    min: 7, max: 29, label: 'Disciple', next: 30, nextLabel: 'Builder',
    ring: '#34D399',
    badgeBg: 'linear-gradient(145deg, #A7F3D0 0%, #34D399 45%, #059669 100%)',
    glow: 'rgba(52,211,153,0.35)',
    pill: { bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.25)', color: '#065F46', colorDark: '#A7F3D0' },
  },
  {
    min: 30, max: 59, label: 'Builder', next: 60, nextLabel: 'Warrior',
    ring: '#FBBF24',
    badgeBg: 'linear-gradient(145deg, #FDE68A 0%, #FBBF24 45%, #D97706 100%)',
    glow: 'rgba(251,191,36,0.38)',
    pill: { bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.28)', color: '#78350F', colorDark: '#FDE68A' },
  },
  {
    min: 60, max: 99, label: 'Warrior', next: 100, nextLabel: 'Legend',
    ring: '#FB923C',
    badgeBg: 'linear-gradient(145deg, #FED7AA 0%, #FB923C 45%, #C2410C 100%)',
    glow: 'rgba(251,146,60,0.38)',
    pill: { bg: 'rgba(251,146,60,0.10)', border: 'rgba(251,146,60,0.26)', color: '#7C2D12', colorDark: '#FED7AA' },
  },
  {
    min: 100, max: Infinity, label: 'Legend', next: null, nextLabel: null,
    ring: '#C084FC',
    badgeBg: 'linear-gradient(145deg, #E9D5FF 0%, #A855F7 45%, #6D28D9 100%)',
    glow: 'rgba(192,132,252,0.40)',
    pill: { bg: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.25)', color: '#5B21B6', colorDark: '#E9D5FF' },
  },
];

function getTier(streak) {
  return TIERS.find(t => streak >= t.min && streak <= t.max) || TIERS[0];
}

// ── Count-up ───────────────────────────────────────────────────────────────

function useCountUp(target, duration = 1500, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(0);
    if (target === 0) return;
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
  }, [target]);
  return value;
}

// ── Emblem ─────────────────────────────────────────────────────────────────

function StreakEmblem({ streak, animatedStreak, readToday }) {
  const tier = getTier(streak);
  const SIZE = 168;

  const milestoneText = tier.next
    ? `${tier.next - streak} day${tier.next - streak === 1 ? '' : 's'} to ${tier.nextLabel}`
    : `${streak} days of faithfulness`;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Badge ring area */}
      <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        {/* Ambient glow */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: SIZE + 56, height: SIZE + 56,
            top: -28, left: -28,
            background: `radial-gradient(circle, ${tier.glow} 0%, transparent 65%)`,
          }}
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Outer halo */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: SIZE + 22, height: SIZE + 22,
            top: -11, left: -11,
            border: `1.5px solid ${tier.ring}40`,
          }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        />

        {/* Inner ring */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: SIZE + 8, height: SIZE + 8,
            top: -4, left: -4,
            border: `2px solid ${tier.ring}90`,
          }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />

        {/* Main badge */}
        <motion.div
          className="relative rounded-full flex items-center justify-center overflow-hidden"
          style={{
            width: SIZE, height: SIZE,
            background: tier.badgeBg,
            boxShadow: `0 16px 48px ${tier.glow}, 0 4px 16px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.30)`,
          }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.55, ease: [0.34, 1.4, 0.64, 1] }}
        >
          {/* Sheen */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.25) 0%, transparent 55%)' }}
          />

          <div className="flex flex-col items-center z-10 select-none">
            <span
              className="text-white font-black tabular-nums leading-none"
              style={{ fontSize: 60, textShadow: '0 2px 12px rgba(0,0,0,0.28)' }}
            >
              {animatedStreak}
            </span>
            <span className="text-white/80 text-[11px] font-bold tracking-[0.18em] uppercase mt-1">
              Day Streak
            </span>
          </div>
        </motion.div>

        {/* Read today badge */}
        <AnimatePresence>
          {readToday && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 480, damping: 22 }}
              className="absolute bottom-0.5 right-0.5 w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: '#22C55E',
                boxShadow: '0 2px 10px rgba(34,197,94,0.55)',
                outline: '3px solid hsl(var(--background))',
              }}
            >
              <Check className="w-[18px] h-[18px] text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tier + milestone */}
      <div className="flex flex-col items-center gap-2">
        <motion.span
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.35 }}
          className="px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
          style={{
            background: tier.pill.bg,
            border: `1px solid ${tier.pill.border}`,
            color: tier.pill.color,
          }}
        >
          {tier.label}
        </motion.span>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-[13px] font-medium text-muted-foreground text-center"
        >
          {milestoneText}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05 }}
          className="text-xs text-muted-foreground/60 text-center"
        >
          {readToday ? 'You showed up today.' : 'Keep your streak alive.'}
        </motion.p>
      </div>
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.38, ease: 'easeOut' }}
      className="flex-1 rounded-3xl p-5 bg-card border border-border"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: `${color}15`, border: `1.5px solid ${color}28` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="text-[34px] font-black text-foreground tabular-nums leading-none mb-1.5">
        {value}
      </div>
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}

function MostReadCard({ value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.38, ease: 'easeOut' }}
      className="w-full rounded-3xl p-5 flex items-center gap-4 bg-card border border-border"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(168,85,247,0.12)', border: '1.5px solid rgba(168,85,247,0.22)' }}
      >
        <BookOpen className="w-6 h-6" style={{ color: '#A855F7' }} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Most Read Book</div>
        <div className="text-xl font-black text-foreground truncate leading-tight">
          {!value || value === 'None' ? '—' : value}
        </div>
      </div>
    </motion.div>
  );
}

function RecordItem({ label, value }) {
  return (
    <div className="bg-muted/40 border border-border/50 rounded-2xl p-4">
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">{label}</div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function ProgressHero({ currentStreak, records, todayLogs = [] }) {
  const [expanded, setExpanded] = useState(false);
  const readToday = todayLogs.length > 0;

  const animatedStreak   = useCountUp(currentStreak, 1400, 80);
  const animatedBestWeek = useCountUp(records.bestRolling7, 900, 300);
  const animatedBestMonth = useCountUp(records.bestMonth, 950, 420);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between mb-7 active:opacity-70 transition-opacity"
      >
        <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.22 }}>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Hero — open, no card wrapper */}
      <motion.div
        whileTap={{ scale: 0.975 }}
        onClick={() => setExpanded(v => !v)}
        className="flex justify-center mb-8 cursor-pointer"
      >
        <StreakEmblem
          streak={currentStreak}
          animatedStreak={animatedStreak}
          readToday={readToday}
        />
      </motion.div>

      {/* Stat cards */}
      <div className="flex gap-3 mb-3">
        <StatCard icon={Calendar} label="Best Week"  value={animatedBestWeek}  color="#22C55E" delay={0.28} />
        <StatCard icon={BarChart2} label="Best Month" value={animatedBestMonth} color="#3B82F6" delay={0.38} />
      </div>
      <MostReadCard value={records.mostReadBook?.name} delay={0.48} />

      {/* Expandable all-time records */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="mt-4 rounded-3xl bg-card border border-border p-5"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}
            >
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">All-Time Records</p>
              <div className="grid grid-cols-2 gap-3">
                <RecordItem label="Longest Streak"  value={`${records.longestStreak} days`} />
                <RecordItem label="Best 7-Day Run"  value={`${records.bestRolling7} ch`} />
                <RecordItem label="Best Month"      value={`${records.bestMonth} ch`} />
                <RecordItem label="Most Read"       value={records.mostReadBook?.name || '—'} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}