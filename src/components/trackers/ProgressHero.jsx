import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BarChart2, BookOpen, ChevronDown, Check } from 'lucide-react';

// ── Tier system ────────────────────────────────────────────────────────────

const TIERS = [
  { min: 0,   max: 6,   label: 'Getting Started', next: 7,   nextLabel: 'Disciple',  ring: '#9CA3AF', ringLight: '#D1D5DB', glow: 'rgba(156,163,175,0.35)', glowLight: 'rgba(156,163,175,0.18)', labelColor: '#374151', labelColorDark: '#D1D5DB', labelBg: 'rgba(107,114,128,0.10)', labelBorder: 'rgba(107,114,128,0.22)', badgeBg: 'radial-gradient(135deg at 30% 20%, #E5E7EB 0%, #9CA3AF 55%, #4B5563 100%)' },
  { min: 7,   max: 29,  label: 'Disciple',         next: 30,  nextLabel: 'Builder',   ring: '#22C55E', ringLight: '#86EFAC', glow: 'rgba(34,197,94,0.38)',   glowLight: 'rgba(34,197,94,0.16)',  labelColor: '#15803D', labelColorDark: '#86EFAC', labelBg: 'rgba(34,197,94,0.10)',  labelBorder: 'rgba(34,197,94,0.28)',  badgeBg: 'radial-gradient(135deg at 30% 20%, #86EFAC 0%, #22C55E 55%, #14532D 100%)' },
  { min: 30,  max: 59,  label: 'Builder',          next: 60,  nextLabel: 'Warrior',   ring: '#FACC15', ringLight: '#FDE68A', glow: 'rgba(250,204,21,0.40)',  glowLight: 'rgba(250,204,21,0.18)', labelColor: '#92400E', labelColorDark: '#FDE68A', labelBg: 'rgba(250,204,21,0.10)', labelBorder: 'rgba(250,204,21,0.30)', badgeBg: 'radial-gradient(135deg at 30% 20%, #FDE68A 0%, #FACC15 50%, #B45309 100%)' },
  { min: 60,  max: 99,  label: 'Warrior',          next: 100, nextLabel: 'Legend',    ring: '#F97316', ringLight: '#FDBA74', glow: 'rgba(249,115,22,0.38)',  glowLight: 'rgba(249,115,22,0.16)', labelColor: '#9A3412', labelColorDark: '#FDBA74', labelBg: 'rgba(249,115,22,0.10)', labelBorder: 'rgba(249,115,22,0.28)', badgeBg: 'radial-gradient(135deg at 30% 20%, #FDBA74 0%, #F97316 55%, #7C2D12 100%)' },
  { min: 100, max: Infinity, label: 'Legend',      next: null, nextLabel: null,       ring: '#A855F7', ringLight: '#C084FC', glow: 'rgba(168,85,247,0.40)', glowLight: 'rgba(168,85,247,0.18)', labelColor: '#6B21A8', labelColorDark: '#C084FC', labelBg: 'rgba(168,85,247,0.10)', labelBorder: 'rgba(168,85,247,0.28)', badgeBg: 'radial-gradient(135deg at 30% 20%, #C084FC 0%, #7C3AED 60%, #4C1D95 100%)' },
];

function getTier(streak) {
  return TIERS.find(t => streak >= t.min && streak <= t.max) || TIERS[0];
}

function getMilestoneText(streak, tier) {
  if (!tier.next) return `${streak} days of faithfulness`;
  const daysLeft = tier.next - streak;
  return `${daysLeft} day${daysLeft === 1 ? '' : 's'} to ${tier.nextLabel}`;
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
  const milestoneText = getMilestoneText(streak, tier);
  const EMBLEM_SIZE = 164;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: EMBLEM_SIZE, height: EMBLEM_SIZE }}>
        {/* Outer ambient glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: EMBLEM_SIZE + 52,
            height: EMBLEM_SIZE + 52,
            top: -26, left: -26,
            background: `radial-gradient(circle, ${tier.glow} 0%, transparent 65%)`,
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Outer halo ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: EMBLEM_SIZE + 22,
            height: EMBLEM_SIZE + 22,
            top: -11, left: -11,
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
            width: EMBLEM_SIZE + 7,
            height: EMBLEM_SIZE + 7,
            top: -3.5, left: -3.5,
            border: `2px solid ${tier.ring}`,
            opacity: 0.6,
          }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
        />

        {/* Badge circle */}
        <motion.div
          className="relative rounded-full flex items-center justify-center"
          style={{
            width: EMBLEM_SIZE,
            height: EMBLEM_SIZE,
            background: tier.badgeBg,
            boxShadow: `0 12px 40px ${tier.glow}, 0 3px 12px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -2px 0 rgba(0,0,0,0.12)`,
          }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
        >
          {/* Inner highlight sheen */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: EMBLEM_SIZE - 14,
              height: EMBLEM_SIZE - 14,
              top: 7, left: 7,
              background: 'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.26) 0%, transparent 58%)',
            }}
          />

          <div className="flex flex-col items-center z-10">
            <span
              className="text-white font-black leading-none tabular-nums"
              style={{ fontSize: 58, textShadow: '0 2px 10px rgba(0,0,0,0.30)' }}
            >
              {animatedStreak}
            </span>
            <span className="text-white/80 text-[11px] font-bold tracking-[0.16em] uppercase mt-1">
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
                boxShadow: '0 2px 10px rgba(34,197,94,0.55)',
                outline: '3px solid hsl(var(--background))',
              }}
            >
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tier badge */}
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

      {/* Milestone line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        className="text-[13px] text-muted-foreground mt-2 text-center font-medium"
      >
        {milestoneText}
      </motion.p>

      {/* Status line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="text-xs text-muted-foreground/70 mt-1 text-center"
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="flex-1 rounded-3xl p-5 bg-card border border-border"
      style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3.5"
        style={{ background: `${color}18`, border: `1px solid ${color}2E` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="text-[32px] font-black text-foreground tabular-nums leading-none">
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground font-semibold mt-2 uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}

function MostReadCard({ value, delay = 0 }) {
  const isEmpty = !value || value === 'None';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="w-full rounded-3xl p-5 flex items-center gap-4 bg-card border border-border"
      style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.24)' }}
      >
        <BookOpen className="w-6 h-6" style={{ color: '#A855F7' }} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Most Read Book</div>
        <div className="text-xl font-black text-foreground leading-tight truncate">
          {isEmpty ? '—' : value}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function ProgressHero({ currentStreak, records, todayLogs = [] }) {
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
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between mb-6 active:opacity-70 transition-opacity duration-100"
      >
        <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Hero emblem — floats free, no enclosing card */}
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

      {/* Stat cards */}
      <div className="flex gap-3 mb-3">
        <StatCard icon={Calendar} label="Best Week" value={animatedBestWeek} color="#22C55E" delay={0.3} />
        <StatCard icon={BarChart2} label="Best Month" value={animatedBestMonth} color="#3B82F6" delay={0.4} />
      </div>
      <MostReadCard value={records.mostReadBook.name} delay={0.5} />

      {/* Expandable records */}
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
              className="mt-4 bg-card border border-border rounded-3xl p-5"
              style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.07)' }}
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
    <div className="bg-muted/50 border border-border/60 rounded-2xl p-4">
      <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-1.5">{label}</div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}