import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BarChart2, BookOpen, ChevronDown, Check } from 'lucide-react';

// ── Tier config ────────────────────────────────────────────────────────────

function getTier(streak) {
  if (streak >= 100) return {
    ring: '#A855F7',
    glow: 'rgba(168,85,247,0.30)',
    bg: 'rgba(168,85,247,0.08)',
    label: 'Legend',
    labelColor: '#A855F7',
  };
  if (streak >= 30) return {
    ring: '#FACC15',
    glow: 'rgba(250,204,21,0.30)',
    bg: 'rgba(250,204,21,0.08)',
    label: 'On Fire',
    labelColor: '#CA8A04',
  };
  if (streak >= 7) return {
    ring: '#22C55E',
    glow: 'rgba(34,197,94,0.30)',
    bg: 'rgba(34,197,94,0.08)',
    label: 'Consistent',
    labelColor: '#16A34A',
  };
  return {
    ring: '#9CA3AF',
    glow: 'rgba(156,163,175,0.20)',
    bg: 'rgba(156,163,175,0.06)',
    label: 'Getting Started',
    labelColor: '#6B7280',
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

// ── Full Status Ring ───────────────────────────────────────────────────────

function StatusRing({ streak, animatedStreak, readToday }) {
  const tier = getTier(streak);
  const R = 76;
  const STROKE = 8;
  const SIZE = (R + STROKE) * 2 + 4;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const circumference = 2 * Math.PI * R;

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      {/* Outer glow pulse */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: SIZE + 16,
          height: SIZE + 16,
          top: -8,
          left: -8,
          background: `radial-gradient(circle, ${tier.glow} 0%, transparent 65%)`,
        }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg width={SIZE} height={SIZE}>
        {/* Track ring */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="hsl(var(--border))" strokeWidth={STROKE} />

        {/* Full status ring — always draws complete, just animates in */}
        <motion.circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={tier.ring}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference, opacity: 0 }}
          animate={{ strokeDashoffset: 0, opacity: 1 }}
          transition={{ duration: 1.0, ease: [0.33, 1, 0.68, 1], delay: 0.15 }}
          style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Inner tinted background */}
        <circle cx={cx} cy={cy} r={R - STROKE / 2 - 2} fill={tier.bg} />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <motion.div
          className="text-[52px] font-black tracking-tight text-foreground tabular-nums leading-none"
        >
          {animatedStreak}
        </motion.div>
        <div className="text-[11px] font-semibold text-muted-foreground tracking-widest uppercase mt-1">
          day streak
        </div>

        {/* Read-today badge */}
        <AnimatePresence>
          {readToday && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 400 }}
              className="flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full"
              style={{ background: tier.bg }}
            >
              <Check className="w-2.5 h-2.5" style={{ color: tier.ring }} strokeWidth={3} />
              <span className="text-[10px] font-semibold" style={{ color: tier.ring }}>Read today</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, bg, delay = 0, fullWidth = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={`rounded-2xl p-4 flex items-center gap-3 ${fullWidth ? 'w-full' : 'flex-1'}`}
      style={{ background: bg, border: `1px solid ${color}22` }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-black text-foreground tabular-nums leading-tight">{value}</div>
        <div className="text-[11px] text-muted-foreground font-medium mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function ProgressHero({ currentStreak, records, todayLogs = [], isLoading }) {
  const [expanded, setExpanded] = useState(false);
  const readToday = todayLogs.length > 0;
  const tier = getTier(currentStreak);

  const animatedStreak = useCountUp(currentStreak, 900, 150);
  const animatedBestWeek = useCountUp(records.bestRolling7, 800, 350);
  const animatedBestMonth = useCountUp(records.bestMonth, 850, 450);

  const statusLine = readToday ? 'You showed up today.' : 'Keep your streak alive.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-5"
    >
      {/* Section header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between mb-4 active:scale-[0.99] transition-transform duration-100"
      >
        <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Hero card */}
      <motion.div
        whileTap={{ scale: 0.985 }}
        onClick={() => setExpanded(v => !v)}
        className="bg-card border border-border rounded-3xl p-6 cursor-pointer shadow-sm overflow-hidden"
      >
        {/* Streak ring */}
        <div className="flex flex-col items-center mb-2">
          <StatusRing
            streak={currentStreak}
            animatedStreak={animatedStreak}
            readToday={readToday}
          />

          {/* Tier label */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-3 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase"
            style={{ background: tier.bg, color: tier.labelColor }}
          >
            {tier.label}
          </motion.div>

          {/* Status line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-sm text-muted-foreground mt-2 text-center"
          >
            {statusLine}
          </motion.p>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50 my-4" />

        {/* Stats row */}
        <div className="flex gap-2.5 mb-2.5">
          <StatCard
            icon={Calendar}
            label="Best Week"
            value={`${animatedBestWeek}`}
            color="#22C55E"
            bg="hsl(var(--secondary))"
            delay={0.3}
          />
          <StatCard
            icon={BarChart2}
            label="Best Month"
            value={`${animatedBestMonth}`}
            color="#3B82F6"
            bg="hsl(var(--secondary))"
            delay={0.4}
          />
        </div>

        {/* Most Read Book — full width */}
        <StatCard
          icon={BookOpen}
          label="Most Read Book"
          value={records.mostReadBook.name === 'None' ? '—' : records.mostReadBook.name}
          color="#A855F7"
          bg="hsl(var(--secondary))"
          fullWidth
          delay={0.5}
        />
      </motion.div>

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
            <div className="mt-3 bg-card border border-border rounded-3xl p-5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">All-Time Records</h3>
              <div className="grid grid-cols-2 gap-2.5">
                <RecordItem label="Longest Streak" value={`${records.longestStreak} days`} />
                <RecordItem label="Best 7-Day Run" value={`${records.bestRolling7} chapters`} />
                <RecordItem label="Best Month" value={`${records.bestMonth} chapters`} />
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
    <div className="bg-secondary/60 rounded-2xl p-3.5">
      <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">{label}</div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}