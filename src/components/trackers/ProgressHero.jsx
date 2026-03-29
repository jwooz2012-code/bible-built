import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Flame, Star } from 'lucide-react';

const TIERS = [
  { min: 0, max: 6, label: 'Getting Started', status: 'Just Starting', next: 7, nextLabel: 'Disciple', color: '#6B7280' },
  { min: 7, max: 29, label: 'Disciple', status: 'Building Habits', next: 30, nextLabel: 'Builder', color: '#10B981' },
  { min: 30, max: 59, label: 'Builder', status: 'On Fire', next: 60, nextLabel: 'Warrior', color: '#F97316' },
  { min: 60, max: 99, label: 'Warrior', status: 'Unstoppable', next: 100, nextLabel: 'Legend', color: '#FB923C' },
  { min: 100, max: Infinity, label: 'Legend', status: 'Legendary', next: null, nextLabel: null, color: '#FBBF24' },
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
@keyframes pulse-dot { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const s = document.createElement('style');
  s.textContent = STYLES;
  document.head.appendChild(s);
  stylesInjected = true;
}

function HeaderBar({ tier, isDark }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Your Progress</h2>
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
        style={{ background: tier.color, boxShadow: `0 0 8px ${tier.color}33` }}
      >
        <Flame className="w-2.5 h-2.5 inline mr-1 mb-0.5" />
        {tier.label}
      </motion.div>
    </div>
  );
}

function StreakRing({ currentStreak, animatedStreak, readToday, isDark }) {
  const ringSize = 120;
  const ringStroke = 8;
  const glowColor = isDark ? 'rgba(249,115,22,0.25)' : 'rgba(249,115,22,0.15)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center mb-4"
    >
      <div className="relative flex items-center justify-center" style={{ width: ringSize, height: ringSize }}>
        {/* Glow */}
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

        {/* Ring SVG */}
        <svg width={ringSize} height={ringSize} className="absolute">
          <defs>
            <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="50%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>
          </defs>
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={(ringSize - ringStroke) / 2}
            fill="none"
            stroke="url(#fireGradient)"
            strokeWidth={ringStroke}
            strokeLinecap="round"
            opacity={0.9}
          />
        </svg>

        {/* Content inside ring */}
        <div className="relative z-10 flex flex-col items-center justify-center select-none gap-0">
          {/* Streak number */}
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

          {/* Day Streak label */}
          <span
            className="font-bold uppercase leading-none mt-1"
            style={{
              fontSize: 8,
              letterSpacing: '1.5px',
              color: isDark ? '#71717A' : '#52525B',
            }}
          >
            Day Streak
          </span>

          {/* Read Today Badge — inside ring, below label */}
          <AnimatePresence>
            {readToday && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.5 }}
                className="mt-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  background: isDark ? 'rgba(34,197,94,0.10)' : 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.25)',
                }}
              >
                <Check style={{ width: 10, height: 10, color: '#22C55E', strokeWidth: 3 }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: '#22C55E', lineHeight: 1 }}>Read today</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function TierProgressBar({ streak, tier, isDark }) {
  const [barWidth, setBarWidth] = useState(0);
  const progress = tier.next ? Math.min(((streak - tier.min) / (tier.next - tier.min)) * 100, 100) : 100;
  const daysLeft = tier.next ? Math.max(0, tier.next - streak) : 0;

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(progress), 200);
    return () => clearTimeout(t);
  }, [progress]);

  const trackBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const trackBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)';
  const textColor = isDark ? '#71717A' : '#52525B';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className="w-full mb-4"
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-1">
          <Flame className="w-3 h-3" style={{ color: tier.color }} />
          <span className="text-xs font-semibold" style={{ color: tier.color }}>{tier.status}</span>
        </div>
        {tier.next && <span className="text-xs" style={{ color: textColor }}>{tier.nextLabel}</span>}
      </div>

      <div className="relative w-full rounded-full overflow-hidden" style={{ height: 4, background: trackBg, border: trackBorder }}>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${tier.color}, ${tier.color}cc)`, boxShadow: `0 0 6px ${tier.color}40` }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 30%, ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)'} 50%, transparent 70%)`,
              animation: 'bar-shimmer 3s ease-in-out infinite',
              width: '40%',
            }}
          />
        </motion.div>
      </div>

      {tier.next && (
        <p className="text-xs mt-1.5 text-center font-medium" style={{ color: textColor }}>
          {daysLeft} day{daysLeft !== 1 ? 's' : ''} to {tier.nextLabel}
        </p>
      )}
    </motion.div>
  );
}

function StatsRibbon({ thisWeek, bestWeek, bestMonth, isDark }) {
  const [isNewBest, setIsNewBest] = useState(false);

  const thisWeekAnim = useCountUp(thisWeek, 600, 700);
  const bestWeekAnim = useCountUp(isNewBest ? thisWeek : bestWeek, 600, 800);
  const bestMonthAnim = useCountUp(bestMonth, 600, 900);

  useEffect(() => {
    if (thisWeek >= bestWeek && bestWeek > 0 && !isNewBest) {
      setIsNewBest(true);
      const timer = setTimeout(() => setIsNewBest(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [thisWeek, bestWeek, isNewBest]);

  const statColor = isDark ? '#FFFFFF' : '#18181B';
  const labelColor = isDark ? '#71717A' : '#52525B';
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.3 }}
      className="flex items-center justify-center gap-3 mb-4 px-2"
    >
      {/* This Week */}
      <div className="flex flex-col items-center gap-0.5 flex-1">
        <div className="flex items-center gap-1.5 justify-center">
          <span className="font-bold tabular-nums leading-none" style={{ fontSize: 22, color: statColor }}>
            {thisWeekAnim}
          </span>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#FB923C', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>This Week</span>
      </div>

      <div style={{ width: 1, height: 28, background: dividerColor }} />

      {/* Best Week */}
      <div className="flex flex-col items-center gap-0.5 flex-1">
        <span className="font-bold tabular-nums leading-none" style={{
          fontSize: 22,
          background: 'linear-gradient(135deg, #F97316, #FDE047)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {bestWeekAnim}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: isNewBest ? '#FBBF24' : labelColor }}>
          {isNewBest ? 'NEW BEST' : 'Best Week'}
        </span>
      </div>

      <div style={{ width: 1, height: 28, background: dividerColor }} />

      {/* Best Month */}
      <div className="flex flex-col items-center gap-0.5 flex-1">
        <span className="font-bold tabular-nums leading-none" style={{
          fontSize: 22,
          background: 'linear-gradient(135deg, #F97316, #FDE047)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {bestMonthAnim}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Best Month</span>
      </div>
    </motion.div>
  );
}

function BottomCards({ yearChapters, mostReadBook, isDark }) {
  const animatedYear = useCountUp(yearChapters, 1000, 1100);
  const year = new Date().getFullYear();

  const bg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)';
  const border = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)';
  const topLabelColor = isDark ? '#A1A1AA' : '#71717A';
  const bookNameColor = isDark ? '#FFFFFF' : '#18181B';

  return (
    <div className="flex gap-2.5">
      {/* Left card: Year Total */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.3 }}
        className="flex-1 rounded-xl p-3"
        style={{ background: bg, border, minHeight: 80 }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <BookOpen style={{ width: 14, height: 14, color: '#F59E0B' }} />
          <span className="text-xs font-semibold" style={{ color: topLabelColor }}>{year}</span>
        </div>
        <div
          className="font-bold tabular-nums leading-none"
          style={{
            fontSize: 24,
            background: 'linear-gradient(135deg, #F97316, #FDE047)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {animatedYear}
        </div>
        <div className="mt-0.5 text-xs" style={{ color: topLabelColor }}>chapters read</div>
      </motion.div>

      {/* Right card: Most Read */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.15, duration: 0.3 }}
        className="flex-1 rounded-xl p-3"
        style={{ background: bg, border, minHeight: 80 }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Star style={{ width: 14, height: 14, color: '#F59E0B' }} />
          <span className="text-xs font-semibold" style={{ color: topLabelColor }}>Most Read</span>
        </div>
        <div className="font-semibold truncate leading-tight" style={{ fontSize: 16, color: bookNameColor }}>
          {mostReadBook || '—'}
        </div>
        <div className="flex items-center gap-0.5 mt-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="fill-current"
              style={{ width: 11, height: 11, color: '#EAB308' }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function ProgressHero({ currentStreak, records, todayLogs = [], thisWeekChapters = 0, yearChapters = 0 }) {
  injectStyles();
  const isDark = useIsDark();
  const tier = getTier(currentStreak);
  const readToday = todayLogs.length > 0;
  const animatedStreak = useCountUp(currentStreak, 800, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <HeaderBar tier={tier} isDark={isDark} />
      <StreakRing currentStreak={currentStreak} animatedStreak={animatedStreak} readToday={readToday} isDark={isDark} />
      <TierProgressBar streak={currentStreak} tier={tier} isDark={isDark} />
      <StatsRibbon thisWeek={thisWeekChapters} bestWeek={records.bestRolling7} bestMonth={records.bestMonth} isDark={isDark} />
      <BottomCards yearChapters={yearChapters} mostReadBook={records.mostReadBook?.name} isDark={isDark} />
    </motion.div>
  );
}