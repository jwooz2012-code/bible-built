import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BarChart2, BookOpen, ChevronDown } from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────

function getStreakColor(streak) {
  if (streak >= 100) return { ring: '#A855F7', glow: 'rgba(168,85,247,0.25)', text: 'text-purple-500' };
  if (streak >= 30)  return { ring: '#FACC15', glow: 'rgba(250,204,21,0.25)',  text: 'text-yellow-500' };
  if (streak >= 7)   return { ring: '#22C55E', glow: 'rgba(34,197,94,0.25)',   text: 'text-green-500' };
  return              { ring: '#6B7280', glow: 'rgba(107,114,128,0.18)',        text: 'text-muted-foreground' };
}

function getNextMilestone(streak) {
  if (streak < 7)   return 7;
  if (streak < 30)  return 30;
  if (streak < 100) return 100;
  return Math.ceil((streak + 1) / 50) * 50;
}

function getMilestoneLabel(streak) {
  const next = getNextMilestone(streak);
  if (streak === 0) return `${next} days to green`;
  if (streak >= 100) return `${streak} days strong`;
  return `${next - streak} days to next tier`;
}

function getEncouragementLine(streak, readToday) {
  if (readToday) {
    if (streak >= 100) return "A century of faithfulness.";
    if (streak >= 30)  return "You showed up again.";
    if (streak >= 7)   return "You're building something real.";
    return "You showed up today.";
  }
  return "Read today to keep your streak alive.";
}

// ── Count-up hook ──────────────────────────────────────────────────────────

function useCountUp(target, duration = 1000, delay = 0) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const timeout = setTimeout(() => {
      started.current = true;
      const start = performance.now();
      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);

  return value;
}

// ── Streak Ring ─────────────────────────────────────────────────────────────

function StreakRing({ streak, animatedStreak, readToday }) {
  const R = 72;
  const STROKE = 7;
  const SIZE = (R + STROKE) * 2;
  const circumference = 2 * Math.PI * R;

  const colors = getStreakColor(streak);
  const nextMilestone = getNextMilestone(streak);
  const prevMilestone = streak >= 100 ? Math.floor(streak / 50) * 50 : streak >= 30 ? 100 > streak ? 30 : 100 : streak >= 7 ? 7 : 0;
  const rangeStart = streak >= 100 ? Math.floor(streak / 50) * 50 : streak >= 30 ? 30 : streak >= 7 ? 7 : 0;
  const fill = nextMilestone === rangeStart ? 1 : Math.min((streak - rangeStart) / (nextMilestone - rangeStart), 1);
  const dashOffset = circumference * (1 - fill);

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      {/* Glow */}
      {streak > 0 && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)` }}
        />
      )}

      <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={STROKE}
        />
        {/* Fill */}
        <motion.circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none"
          stroke={colors.ring}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.1, ease: [0.33, 1, 0.68, 1], delay: 0.1 }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="text-5xl font-bold tracking-tight text-foreground tabular-nums"
          style={{ lineHeight: 1 }}
        >
          {animatedStreak}
        </motion.div>
        <div className="text-xs font-medium text-muted-foreground mt-1 tracking-wide uppercase">
          day streak
        </div>
        {readToday && (
          <div className="mt-1.5 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] text-green-500 font-medium">Read today</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stat Trophy Card ─────────────────────────────────────────────────────────

function TrophyCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="bg-secondary/60 border border-border/60 rounded-2xl p-4 flex-1"
    >
      <Icon className="w-4 h-4 mb-2.5" style={{ color }} />
      <div className="text-base font-bold text-foreground tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">{label}</div>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function ProgressHero({ currentStreak, records, todayLogs = [], isLoading }) {
  const [expanded, setExpanded] = useState(false);
  const readToday = todayLogs.length > 0;
  const colors = getStreakColor(currentStreak);

  const animatedStreak = useCountUp(currentStreak, 900, 150);
  const animatedBestWeek = useCountUp(records.bestRolling7, 800, 300);
  const animatedBestMonth = useCountUp(records.bestMonth, 850, 400);

  const encouragement = getEncouragementLine(currentStreak, readToday);
  const milestoneLabel = getMilestoneLabel(currentStreak);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-5"
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between mb-4 active:scale-[0.99] transition-transform"
      >
        <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Hero card */}
      <motion.div
        whileTap={{ scale: 0.985 }}
        onClick={() => setExpanded(v => !v)}
        className="bg-card border border-border rounded-3xl p-6 cursor-pointer shadow-sm"
      >
        {/* Streak ring centered */}
        <div className="flex flex-col items-center mb-5">
          <StreakRing
            streak={currentStreak}
            animatedStreak={animatedStreak}
            readToday={readToday}
          />

          {/* Encouragement line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-muted-foreground mt-3 font-medium text-center"
          >
            {encouragement}
          </motion.p>

          {/* Milestone sub-line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className={`text-xs mt-1 ${colors.text}`}
          >
            {milestoneLabel}
          </motion.p>
        </div>

        {/* Trophy cards row */}
        <div className="flex gap-2.5">
          <TrophyCard
            icon={Calendar}
            label="Best Week"
            value={`${animatedBestWeek} ch`}
            color="#22C55E"
            delay={0.35}
          />
          <TrophyCard
            icon={BarChart2}
            label="Best Month"
            value={`${animatedBestMonth} ch`}
            color="#3B82F6"
            delay={0.45}
          />
          <TrophyCard
            icon={BookOpen}
            label="Most Read"
            value={records.mostReadBook.name === 'None' ? '—' : records.mostReadBook.name}
            color="#A855F7"
            delay={0.55}
          />
        </div>
      </motion.div>

      {/* Expandable detail section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-card border border-border rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">All-Time Records</h3>

              <div className="grid grid-cols-2 gap-3">
                <StatRow label="Longest Streak" value={`${records.longestStreak} days`} />
                <StatRow label="Best 7-Day Run" value={`${records.bestRolling7} chapters`} />
                <StatRow label="Best Month" value={`${records.bestMonth} chapters`} />
                <StatRow label="Most Read Book" value={records.mostReadBook.name} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="bg-secondary/50 rounded-xl p-3">
      <div className="text-[11px] text-muted-foreground font-medium mb-0.5">{label}</div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}