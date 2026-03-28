import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Flame, Star } from 'lucide-react';

const TIERS = [
  { min: 0, max: 6, label: 'Getting Started', status: 'Just Starting', next: 7, nextLabel: 'Disciple', gradient: '#4B5563 to #9CA3AF', glow: 'rgba(156,163,175,0.25)' },
  { min: 7, max: 29, label: 'Disciple', status: 'Building Habits', next: 30, nextLabel: 'Builder', gradient: '#059669 to #34D399', glow: 'rgba(52,211,153,0.25)' },
  { min: 30, max: 59, label: 'Builder', status: 'On Fire', next: 60, nextLabel: 'Warrior', gradient: '#C2410C to #FBBF24', glow: 'rgba(251,191,36,0.25)' },
  { min: 60, max: 99, label: 'Warrior', status: 'Unstoppable', next: 100, nextLabel: 'Legend', gradient: '#C2410C to #FB923C', glow: 'rgba(249,115,22,0.25)' },
  { min: 100, max: Infinity, label: 'Legend', status: 'Legendary', next: null, nextLabel: null, gradient: '#C2410C to #FDE047', glow: 'rgba(251,191,36,0.30)' },
];

function getTier(streak) {
  return TIERS.find(t => streak >= t.min && streak <= t.max) || TIERS[0];
}

function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function useCountUp(target, duration = 1500, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
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
  }, [target, duration, delay]);
  return value;
}

const STYLES = `
@keyframes ring-glow-pulse { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.30; } }
@keyframes bar-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }
@keyframes star-shimmer { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
@keyframes pulse-dot { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const s = document.createElement('style');
  s.textContent = STYLES;
  document.head.appendChild(s);
  stylesInjected = true;
}

// Row 1: Header Bar
function HeaderBar({ tier }) {
  const tierColor = tier.glow;
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-foreground">Your Progress</h2>
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
        style={{
          background: `linear-gradient(135deg, ${tier.gradient})`,
          boxShadow: `0 0 8px ${tierColor}`,
        }}
      >
        <Flame className="w-2.5 h-2.5 inline mr-1 mb-0.5" />
        {tier.label}
      </motion.div>
    </div>
  );
}

// Row 2: Streak Ring (Hero)
function StreakRing({ streak, animatedStreak, readToday, isDark }) {
  const ringSize = 120;
  const ringStroke = 8;
  const glowColor = isDark ? 'rgba(249,115,22,0.25)' : 'rgba(249,115,22,0.12)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center mb-2"
    >
      {/* Ring with glow */}
      <div className="relative flex items-center justify-center" style={{ width: ringSize, height: ringSize }}>
        {/* Animated glow backdrop */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: ringSize + 36,
            height: ringSize + 36,
            top: -18,
            left: -18,
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 65%)`,
            animation: 'ring-glow-pulse 2s ease-in-out infinite',
          }}
        />

        {/* Ring stroke */}
        <svg
          width={ringSize}
          height={ringSize}
          className="absolute"
          style={{
            filter: `drop-shadow(0 0 12px ${glowColor})`,
          }}
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={(ringSize - ringStroke) / 2}
            fill="none"
            stroke="url(#fireGradient)"
            strokeWidth={ringStroke}
            strokeLinecap="round"
            opacity={0.95}
          />
          <defs>
            <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="50%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>
          </defs>
        </svg>

        {/* Content inside ring */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <span
            className="font-black tabular-nums leading-none"
            style={{
              fontSize: 38,
              background: 'linear-gradient(135deg, #F97316, #FDE047)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {animatedStreak}
          </span>
          <span className="text-xs font-bold tracking-wider uppercase text-zinc-400 mt-0.5">Day Streak</span>

          {/* Read Today Badge Inside Ring */}
          <AnimatePresence>
            {readToday && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 1.2 }}
                className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-full"
                style={{
                  background: 'rgba(34,197,94,0.12)',
                  border: '1px solid rgba(34,197,94,0.30)',
                }}
              >
                <Check className="w-2.5 h-2.5" style={{ color: '#22C55E', strokeWidth: 3 }} />
                <span className="text-xs font-bold" style={{ color: '#22C55E' }}>Read today</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// Row 3: Tier Progress Bar
function TierProgressBar({ streak, tier, isDark }) {
  const [barWidth, setBarWidth] = useState(0);
  const progress = tier.next ? Math.min(((streak - tier.min) / (tier.next - tier.min)) * 100, 100) : 100;
  const daysLeft = tier.next ? Math.max(0, tier.next - streak) : 0;

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(progress), 200);
    return () => clearTimeout(t);
  }, [progress]);

  const trackBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
  const trackBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className="w-full mb-3"
    >
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <div className="flex items-center gap-1">
          <Flame className="w-3 h-3 text-orange-400" />
          <span className="text-xs font-semibold text-orange-400">{tier.status}</span>
        </div>
        {tier.next && <span className="text-xs text-zinc-500">{tier.nextLabel}</span>}
      </div>

      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{ height: 4, background: trackBg, border: trackBorder }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${barWidth}%`,
            background: 'linear-gradient(90deg, #F97316, #FDE047)',
            boxShadow: '0 0 8px rgba(249,115,22,0.30)',
          }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)`,
              animation: 'bar-shimmer 3s ease-in-out infinite',
              width: '40%',
            }}
          />
        </motion.div>
      </div>

      {tier.next && (
        <p className="text-xs mt-1 text-center text-zinc-500 font-medium">
          {daysLeft} day{daysLeft !== 1 ? 's' : ''} to {tier.nextLabel}
        </p>
      )}
    </motion.div>
  );
}

// Row 4: Stats Ribbon
function StatsRibbon({ thisWeek, bestWeek, bestMonth }) {
  const [isNewBest, setIsNewBest] = useState(false);
  const [newBestTimer, setNewBestTimer] = useState(null);

  const thisWeekAnim = useCountUp(thisWeek, 600, 700);
  const bestWeekAnim = useCountUp(isNewBest ? thisWeek : bestWeek, 600, 800);
  const bestMonthAnim = useCountUp(bestMonth, 600, 900);

  useEffect(() => {
    if (thisWeek >= bestWeek && bestWeek > 0 && !isNewBest) {
      setIsNewBest(true);
      if (newBestTimer) clearTimeout(newBestTimer);
      const timer = setTimeout(() => {
        setIsNewBest(false);
      }, 3000);
      setNewBestTimer(timer);
    }
  }, [thisWeek, bestWeek, isNewBest]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.3 }}
      className="flex items-center justify-center gap-4 mb-2.5 px-4"
    >
      {/* This Week */}
      <div className="flex flex-col items-center justify-center gap-0.5 relative">
        <div className="flex items-center gap-1.5">
          <span
            className="font-bold tabular-nums leading-none"
            style={{ fontSize: 22, color: 'hsl(var(--foreground))' }}
          >
            {thisWeekAnim}
          </span>
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#FB923C',
              animation: 'pulse-dot 1.5s ease-in-out infinite',
            }}
          />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">This Week</span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.10)' }} />

      {/* Best Week */}
      <div className="flex flex-col items-center justify-center gap-0.5">
        <span
          className="font-bold tabular-nums leading-none"
          style={{
            fontSize: 22,
            background: 'linear-gradient(135deg, #F97316, #FDE047)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {bestWeekAnim}
        </span>
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: isNewBest ? '#FBBF24' : 'hsl(var(--muted-foreground))' }}
        >
          {isNewBest ? 'NEW BEST' : 'Best Week'}
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.10)' }} />

      {/* Best Month */}
      <div className="flex flex-col items-center justify-center gap-0.5">
        <span
          className="font-bold tabular-nums leading-none"
          style={{
            fontSize: 22,
            background: 'linear-gradient(135deg, #F97316, #FDE047)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {bestMonthAnim}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Best Month</span>
      </div>
    </motion.div>
  );
}

// Row 5: Year Counter
function YearCounter({ yearChapters, isDark }) {
  const year = new Date().getFullYear();
  const animatedCount = useCountUp(yearChapters, 1200, 1100);

  const bg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const border = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.3 }}
      className="w-full flex items-center justify-between rounded-xl mb-2.5 px-3.5 py-2"
      style={{ background: bg, border }}
    >
      <div className="flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-sm font-bold text-foreground">{year}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="font-bold tabular-nums leading-none"
          style={{
            fontSize: 18,
            background: 'linear-gradient(135deg, #F97316, #FDE047)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {animatedCount}
        </span>
        <span className="text-xs text-zinc-500">chapters</span>
      </div>
    </motion.div>
  );
}

// Row 6: Most Read Book
function MostReadBookCard({ bookName, isDark }) {
  const [shimmerDone, setShimmerDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShimmerDone(true), 2400);
    return () => clearTimeout(timer);
  }, []);

  const bg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const border = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3, duration: 0.3 }}
      className="w-full flex items-center justify-between rounded-xl px-3.5 py-2 relative overflow-hidden"
      style={{ background: bg, border, minHeight: 44 }}
    >
      {!shimmerDone && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)',
            animation: 'bar-shimmer 1.5s ease-in-out',
            animationDelay: '1.3s',
            animationFillMode: 'forwards',
          }}
        />
      )}

      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(124,58,237,0.16)' }}
        >
          <BookOpen className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Most Read</div>
          <div className="text-sm font-semibold text-foreground">{bookName || '—'}</div>
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className="w-3 h-3 fill-current"
            style={{
              color: '#EAB308',
              animation: shimmerDone ? 'none' : `star-shimmer 0.6s ease-in-out ${1.3 + i * 0.08}s forwards`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Main Component
export default function ProgressHero({ currentStreak, records, todayLogs = [], thisWeekChapters = 0, yearChapters = 0 }) {
  injectStyles();
  const isDark = useIsDark();
  const tier = getTier(currentStreak);
  const readToday = todayLogs.length > 0;
  const animatedStreak = useCountUp(currentStreak, 800, 0);
  const mostReadBook = records.mostReadBook?.name || 'None';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-3"
    >
      <HeaderBar tier={tier} />
      <StreakRing streak={currentStreak} animatedStreak={animatedStreak} readToday={readToday} isDark={isDark} />
      <TierProgressBar streak={currentStreak} tier={tier} isDark={isDark} />
      <StatsRibbon thisWeek={thisWeekChapters} bestWeek={records.bestRolling7} bestMonth={records.bestMonth} />
      <YearCounter yearChapters={yearChapters} isDark={isDark} />
      <MostReadBookCard bookName={mostReadBook} isDark={isDark} />
    </motion.div>
  );
}