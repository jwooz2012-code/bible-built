import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BarChart2, BookOpen, ChevronDown, Check } from 'lucide-react';

// ── Tiers ──────────────────────────────────────────────────────────────────

const TIERS = [
  { min: 0,   max: 6,   label: 'Getting Started', next: 7,   nextLabel: 'Disciple',
    pill: { bg: 'rgba(107,114,128,0.12)', border: 'rgba(156,163,175,0.30)', color: '#6B7280' } },
  { min: 7,   max: 29,  label: 'Disciple',         next: 30,  nextLabel: 'Builder',
    pill: { bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.30)',   color: '#16A34A' } },
  { min: 30,  max: 59,  label: 'Builder',           next: 60,  nextLabel: 'Warrior',
    pill: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)',  color: '#D97706' } },
  { min: 60,  max: 99,  label: 'Warrior',           next: 100, nextLabel: 'Legend',
    pill: { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.35)',  color: '#EA580C' } },
  { min: 100, max: Infinity, label: 'Legend',       next: null, nextLabel: null,
    pill: { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.35)', color: '#9333EA' } },
];

function getTier(streak) {
  return TIERS.find(t => streak >= t.min && streak <= t.max) || TIERS[0];
}

// ── Count-up ───────────────────────────────────────────────────────────────

function useCountUp(target, duration = 1500, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(0);
    if (!target) return;
    const id = setTimeout(() => {
      const start = performance.now();
      const run = (now) => {
        const t = Math.min((now - start) / duration, 1);
        setValue(Math.round((1 - Math.pow(1 - t, 3)) * target));
        if (t < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    }, delay);
    return () => clearTimeout(id);
  }, [target]);
  return value;
}

// ── Fire Ring ──────────────────────────────────────────────────────────────

const FIRE_GRADIENT = 'conic-gradient(from 180deg, #FDE047, #FB923C, #EF4444, #F97316, #FBBF24, #FDE047)';
const FIRE_GLOW = 'rgba(251,146,60,0.50)';
const RING_SIZE = 176;
const RING_STROKE = 10;

function FireRing({ readToday }) {
  return (
    <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
      {/* Tight glow behind ring */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${FIRE_GLOW} 30%, transparent 70%)`,
          filter: 'blur(10px)',
          transform: 'scale(1.05)',
        }}
      />

      {/* Conic ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: FIRE_GRADIENT,
          padding: RING_STROKE,
        }}
        initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.55, ease: [0.34, 1.3, 0.64, 1], delay: 0.05 }}
      >
        {/* Inner cutout (background fill) */}
        <div
          className="w-full h-full rounded-full bg-background flex items-center justify-center"
          style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.12)' }}
        />
      </motion.div>

      {/* Read-today check */}
      <AnimatePresence>
        {readToday && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 1.3, type: 'spring', stiffness: 500, damping: 24 }}
            className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center z-20"
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
  );
}

// ── Hero Section ───────────────────────────────────────────────────────────

function StreakHero({ streak, animatedStreak, readToday }) {
  const tier = getTier(streak);
  const daysLeft = tier.next ? tier.next - streak : 0;
  const milestoneText = tier.next
    ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} to ${tier.nextLabel}`
    : `${streak} days of faithfulness`;

  return (
    <div className="relative flex flex-col items-center pt-2 pb-1">
      {/* Tier badge — top right */}
      <motion.div
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.35 }}
        className="absolute top-0 right-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
        style={{
          background: tier.pill.bg,
          border: `1px solid ${tier.pill.border}`,
          color: tier.pill.color,
        }}
      >
        {tier.label}
      </motion.div>

      {/* Ring + streak number overlay */}
      <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
        <FireRing readToday={readToday} />

        {/* Streak number centered inside ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="font-black tabular-nums text-foreground leading-none"
            style={{ fontSize: 58, textShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          >
            {animatedStreak}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[11px] font-bold tracking-[0.16em] uppercase text-muted-foreground mt-0.5"
          >
            Day Streak
          </motion.span>
        </div>
      </div>

      {/* Milestone line */}
      <motion.p
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.35 }}
        className="mt-4 text-[13px] font-semibold text-foreground/70 text-center"
      >
        {milestoneText}
      </motion.p>

      {/* Status line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-1 text-xs text-muted-foreground/55 text-center"
      >
        {readToday ? 'You showed up today.' : 'Keep your streak alive.'}
      </motion.p>
    </div>
  );
}

// ── Stat Cards ─────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.38, ease: 'easeOut' }}
      className="flex-1 rounded-3xl p-5 bg-card border border-border"
      style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${color}14`, border: `1.5px solid ${color}26` }}
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
      style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(139,92,246,0.12)', border: '1.5px solid rgba(139,92,246,0.22)' }}
      >
        <BookOpen className="w-5 h-5" style={{ color: '#7C3AED' }} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Most Read Book</div>
        <div className="text-lg font-black text-foreground truncate">
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

  const animatedStreak    = useCountUp(currentStreak,       1500, 60);
  const animatedBestWeek  = useCountUp(records.bestRolling7, 950, 280);
  const animatedBestMonth = useCountUp(records.bestMonth,   1000, 380);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      {/* Section header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between mb-6 active:opacity-70 transition-opacity"
      >
        <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.22 }}>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Hero — no card wrapper, floats free */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => setExpanded(v => !v)}
        className="flex justify-center mb-8 cursor-pointer px-4"
      >
        <StreakHero
          streak={currentStreak}
          animatedStreak={animatedStreak}
          readToday={readToday}
        />
      </motion.div>

      {/* Stat cards */}
      <div className="flex gap-3 mb-3">
        <StatCard icon={Calendar} label="Best Week"  value={animatedBestWeek}  color="#22C55E" delay={0.25} />
        <StatCard icon={BarChart2} label="Best Month" value={animatedBestMonth} color="#3B82F6" delay={0.35} />
      </div>
      <MostReadCard value={records.mostReadBook?.name} delay={0.45} />

      {/* Expandable records */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="records"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="mt-4 rounded-3xl bg-card border border-border p-5"
              style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.07)' }}
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