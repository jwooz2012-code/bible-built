import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BarChart2, BookOpen, Flame, Check } from 'lucide-react';

// ── Tiers ──────────────────────────────────────────────────────────────────

const TIERS = [
  { min: 0,   max: 6,   label: 'Getting Started', next: 7,   nextLabel: 'Disciple'  },
  { min: 7,   max: 29,  label: 'Disciple',         next: 30,  nextLabel: 'Builder'   },
  { min: 30,  max: 59,  label: 'Builder',           next: 60,  nextLabel: 'Warrior'  },
  { min: 60,  max: 99,  label: 'On Fire',           next: 100, nextLabel: 'Legend'   },
  { min: 100, max: Infinity, label: 'Legend',       next: null, nextLabel: null       },
];

function getTier(streak) {
  return TIERS.find(t => streak >= t.min && streak <= t.max) || TIERS[0];
}

// ── Count-up ───────────────────────────────────────────────────────────────

function useCountUp(target, duration = 1400, delay = 0) {
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

// ── Stars ──────────────────────────────────────────────────────────────────

function Stars({ count = 5 }) {
  return (
    <div className="flex gap-0.5 mt-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill={i < count ? '#FBBF24' : '#374151'}>
          <path d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.1L6 8.02 3.22 9.56l.53-3.1L1.5 4.27l3.11-.45z"/>
        </svg>
      ))}
    </div>
  );
}

// ── Fire Ring ──────────────────────────────────────────────────────────────

function FireRing({ animatedStreak, readToday }) {
  const SIZE = 188;
  const STROKE = 11;

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      {/* Outer glow halo */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(251,146,60,0.28) 40%, transparent 72%)',
          filter: 'blur(14px)',
          transform: 'scale(1.12)',
        }}
      />

      {/* Fire gradient ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 200deg, #FDE047 0%, #FB923C 25%, #EF4444 50%, #F97316 70%, #FBBF24 85%, #FDE047 100%)',
          padding: STROKE,
        }}
        initial={{ opacity: 0, scale: 0.78, rotate: -20 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.3, 0.64, 1], delay: 0.05 }}
      >
        {/* Inner cutout */}
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle at 40% 35%, #1a1108 0%, #0d0905 100%)',
            boxShadow: 'inset 0 2px 12px rgba(251,146,60,0.18)',
          }}
        />
      </motion.div>

      {/* Streak number + label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-black tabular-nums leading-none"
          style={{ fontSize: 60, color: '#FB923C', textShadow: '0 0 24px rgba(251,146,60,0.55)' }}
        >
          {animatedStreak}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-[11px] font-bold tracking-[0.16em] uppercase mt-0.5"
          style={{ color: 'rgba(251,191,36,0.75)' }}
        >
          Day Streak
        </motion.span>

        {/* Read Today pill */}
        <AnimatePresence>
          {readToday && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ delay: 1.1, type: 'spring', stiffness: 450, damping: 22 }}
              className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{
                background: 'rgba(34,197,94,0.18)',
                border: '1px solid rgba(34,197,94,0.40)',
              }}
            >
              <Check className="w-3.5 h-3.5" style={{ color: '#4ADE80' }} strokeWidth={3} />
              <span className="text-[11px] font-bold" style={{ color: '#4ADE80' }}>Read Today</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Tier + Milestone Row ───────────────────────────────────────────────────

function TierMilestoneRow({ streak }) {
  const tier = getTier(streak);
  const pct = tier.next
    ? Math.min(((streak - tier.min) / (tier.next - tier.min)) * 100, 100)
    : 100;
  const daysLeft = tier.next ? tier.next - streak : 0;
  const milestoneText = tier.next ? `${daysLeft} days to ${tier.nextLabel}` : 'Max tier reached';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.35 }}
      className="w-full mt-5 px-1"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5" style={{ color: '#FB923C' }} />
          <span className="text-[12px] font-bold" style={{ color: '#FB923C' }}>{tier.label}</span>
        </div>
        <span className="text-[12px] font-semibold" style={{ color: 'rgba(251,191,36,0.70)' }}>
          {milestoneText}
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #F97316, #FBBF24)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.85, duration: 0.9, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

// ── Stat Cards ─────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="flex-1 rounded-2xl p-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
        style={{ background: `${color}20`, border: `1px solid ${color}30` }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="text-[30px] font-black tabular-nums leading-none" style={{ color: '#F8FAFC' }}>
        {value}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider mt-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
        {label}
      </div>
      <Stars count={5} />
    </motion.div>
  );
}

function MostReadCard({ value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="w-full rounded-2xl p-4 flex items-center gap-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.28)' }}
      >
        <BookOpen className="w-5 h-5" style={{ color: '#A78BFA' }} />
      </div>
      <div className="min-w-0">
        <div className="text-base font-black truncate" style={{ color: '#F8FAFC' }}>
          {!value || value === 'None' ? '—' : value}
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Most Read Book
        </div>
        <Stars count={5} />
      </div>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function ProgressHero({ currentStreak, records, todayLogs = [] }) {
  const readToday = todayLogs.length > 0;
  const tier = getTier(currentStreak);

  const animatedStreak    = useCountUp(currentStreak,        1500, 60);
  const animatedBestWeek  = useCountUp(records.bestRolling7, 950,  300);
  const animatedBestMonth = useCountUp(records.bestMonth,    1000, 420);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0f0a04 0%, #110c05 50%, #0b0704 100%)',
        border: '1px solid rgba(251,146,60,0.22)',
        boxShadow: '0 0 0 1px rgba(251,146,60,0.08), 0 8px 32px rgba(251,146,60,0.12)',
      }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-bold" style={{ color: '#F8FAFC' }}>Your Progress</h2>
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{
              background: 'rgba(251,146,60,0.12)',
              border: '1px solid rgba(251,146,60,0.28)',
            }}
          >
            <Flame className="w-3.5 h-3.5" style={{ color: '#FB923C' }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#FB923C' }}>
              {tier.label}
            </span>
          </div>
        </div>

        {/* Hero ring */}
        <div className="flex justify-center">
          <FireRing animatedStreak={animatedStreak} readToday={readToday} />
        </div>

        {/* Tier + milestone + progress bar */}
        <TierMilestoneRow streak={currentStreak} />

        {/* Divider */}
        <div className="mt-5 mb-4 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Stat cards */}
        <div className="flex gap-3 mb-3">
          <StatCard icon={Calendar} label="Best Week"  value={animatedBestWeek}  color="#22C55E" delay={0.3} />
          <StatCard icon={BarChart2} label="Best Month" value={animatedBestMonth} color="#3B82F6" delay={0.4} />
        </div>
        <MostReadCard value={records.mostReadBook?.name} delay={0.5} />
      </div>
    </motion.div>
  );
}