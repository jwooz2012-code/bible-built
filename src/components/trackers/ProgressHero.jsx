import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BarChart2, BookOpen, Check, Flame, Zap } from 'lucide-react';

// ── Tier config ────────────────────────────────────────────────────────────

const TIERS = [
  { min: 0,   max: 6,   label: 'Getting Started', status: 'Just Starting', next: 7,   nextLabel: 'Disciple',
    ringStart: '#9CA3AF', ringEnd: '#6B7280', glow: 'rgba(156,163,175,0.55)', badgeColor: '#9CA3AF', badgeBg: 'rgba(156,163,175,0.15)', badgeBorder: 'rgba(156,163,175,0.3)' },
  { min: 7,   max: 29,  label: 'Disciple',         status: 'Building Habits', next: 30, nextLabel: 'Builder',
    ringStart: '#6EE7B7', ringEnd: '#059669', glow: 'rgba(52,211,153,0.6)', badgeColor: '#34D399', badgeBg: 'rgba(52,211,153,0.15)', badgeBorder: 'rgba(52,211,153,0.3)' },
  { min: 30,  max: 59,  label: 'Builder',          status: 'On Fire 🔥', next: 60, nextLabel: 'Warrior',
    ringStart: '#FDE68A', ringEnd: '#D97706', glow: 'rgba(251,191,36,0.65)', badgeColor: '#FBBF24', badgeBg: 'rgba(251,191,36,0.15)', badgeBorder: 'rgba(251,191,36,0.3)' },
  { min: 60,  max: 99,  label: 'Warrior',          status: 'Unstoppable', next: 100, nextLabel: 'Legend',
    ringStart: '#FED7AA', ringEnd: '#EA580C', glow: 'rgba(249,115,22,0.65)', badgeColor: '#FB923C', badgeBg: 'rgba(249,115,22,0.15)', badgeBorder: 'rgba(249,115,22,0.3)' },
  { min: 100, max: Infinity, label: 'Legend',      status: 'Legendary', next: null, nextLabel: null,
    ringStart: '#FEF08A', ringEnd: '#F97316', glow: 'rgba(251,191,36,0.70)', badgeColor: '#FBBF24', badgeBg: 'rgba(251,146,60,0.18)', badgeBorder: 'rgba(251,191,36,0.4)' },
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
    const tid = setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        setValue(Math.round((1 - Math.pow(1 - t, 3)) * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(tid);
  }, [target]);
  return value;
}

// ── SVG Ring ───────────────────────────────────────────────────────────────

function RingGradient({ id, start, end }) {
  return (
    <defs>
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={start} />
        <stop offset="100%" stopColor={end} />
      </linearGradient>
      <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  );
}

// ── Main Emblem ────────────────────────────────────────────────────────────

function StreakEmblem({ streak, animatedStreak, readToday }) {
  const tier = getTier(streak);
  const SIZE = 200;
  const R = 82;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const STROKE = 10;
  const circumference = 2 * Math.PI * R;
  const gradId = `ring-grad-${tier.label.replace(/\s/g, '')}`;

  const milestoneText = tier.next
    ? `${tier.next - streak} day${tier.next - streak === 1 ? '' : 's'} to ${tier.nextLabel}`
    : `${streak} days of faithfulness`;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Ring + number */}
      <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        {/* Ambient glow blob */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: SIZE, height: SIZE,
            background: `radial-gradient(circle, ${tier.glow} 0%, transparent 68%)`,
            opacity: 0.6,
          }}
          animate={{ opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* SVG ring */}
        <motion.svg
          width={SIZE} height={SIZE}
          className="absolute top-0 left-0"
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: -90 }}
          transition={{ delay: 0.1 }}
          style={{ transformOrigin: '50% 50%' }}
        >
          <RingGradient id={gradId} start={tier.ringStart} end={tier.ringEnd} />
          {/* Track ring */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE} />
          {/* Glow ring (blurred underneath) */}
          <circle
            cx={CX} cy={CY} r={R} fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={STROKE + 4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={0}
            opacity={0.35}
            filter={`url(#${gradId}-glow)`}
          />
          {/* Main ring */}
          <circle
            cx={CX} cy={CY} r={R} fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={0}
          />
        </motion.svg>

        {/* Inner content */}
        <motion.div
          className="relative flex flex-col items-center justify-center z-10"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.4, 0.64, 1] }}
        >
          <span
            className="font-black tabular-nums leading-none text-foreground"
            style={{ fontSize: 64, textShadow: `0 0 30px ${tier.glow}` }}
          >
            {animatedStreak}
          </span>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mt-0.5">
            Day Streak
          </span>

          {/* Read today badge */}
          <AnimatePresence>
            {readToday && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ delay: 1.3, type: 'spring', stiffness: 460, damping: 20 }}
                className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{ background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.35)' }}
              >
                <Check className="w-3.5 h-3.5" style={{ color: '#22C55E' }} strokeWidth={3} />
                <span className="text-[11px] font-bold" style={{ color: '#22C55E' }}>Read today</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Status + milestone row */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="flex items-center justify-between w-full px-1"
      >
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5" style={{ color: tier.badgeColor }} />
          <span className="text-xs font-semibold" style={{ color: tier.badgeColor }}>{tier.status}</span>
        </div>
        <span className="text-xs text-muted-foreground font-medium">{milestoneText}</span>
      </motion.div>
    </div>
  );
}

// ── Stat Cards ─────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.38 }}
      className="flex-1 rounded-2xl p-4 bg-card border border-border relative overflow-hidden"
      style={{ boxShadow: `0 0 0 1px ${color}12, 0 4px 20px rgba(0,0,0,0.10)` }}
    >
      {/* subtle tint corner */}
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${color}20 0%, transparent 70%)` }} />
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}18`, border: `1.5px solid ${color}30` }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color }} />
      </div>
      <div className="text-[32px] font-black text-foreground tabular-nums leading-none">{value}</div>
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-1.5">{label}</div>
    </motion.div>
  );
}

function MostReadCard({ value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.38 }}
      className="w-full rounded-2xl p-4 flex items-center gap-4 bg-card border border-border relative overflow-hidden"
      style={{ boxShadow: '0 0 0 1px rgba(168,85,247,0.10), 0 4px 20px rgba(0,0,0,0.10)' }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle at top right, rgba(168,85,247,0.12) 0%, transparent 70%)' }} />
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(168,85,247,0.14)', border: '1.5px solid rgba(168,85,247,0.28)' }}
      >
        <BookOpen className="w-5 h-5" style={{ color: '#A855F7' }} />
      </div>
      <div className="min-w-0 z-10">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Most Read Book</div>
        <div className="text-xl font-black text-foreground truncate">
          {!value || value === 'None' ? '—' : value}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

export default function ProgressHero({ currentStreak, records, todayLogs = [] }) {
  const readToday = todayLogs.length > 0;
  const tier = getTier(currentStreak);

  const animatedStreak    = useCountUp(currentStreak, 1500, 80);
  const animatedBestWeek  = useCountUp(records.bestRolling7, 1000, 300);
  const animatedBestMonth = useCountUp(records.bestMonth, 1050, 420);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      {/* Header row with tier badge */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
          style={{
            background: tier.badgeBg,
            border: `1px solid ${tier.badgeBorder}`,
            color: tier.badgeColor,
          }}
        >
          <Zap className="w-3 h-3" />
          {tier.label}
        </motion.div>
      </div>

      {/* Streak ring */}
      <div className="flex justify-center mb-6">
        <StreakEmblem
          streak={currentStreak}
          animatedStreak={animatedStreak}
          readToday={readToday}
        />
      </div>

      {/* Stat cards */}
      <div className="flex gap-3 mb-3">
        <StatCard icon={Calendar}  label="Best Week"  value={animatedBestWeek}  color="#22C55E" delay={0.3} />
        <StatCard icon={BarChart2} label="Best Month" value={animatedBestMonth} color="#3B82F6" delay={0.42} />
      </div>
      <MostReadCard value={records.mostReadBook?.name} delay={0.54} />
    </motion.div>
  );
}