import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Check, Flame, Star } from 'lucide-react';

// ─── Tier config — tier.color drives badge, progress bar, label ───────────────
const TIERS = [
  { min: 0,   max: 6,        label: 'Getting Started', status: 'Just Starting',   next: 7,   nextLabel: 'Disciple', color: '#60A5FA' },
  { min: 7,   max: 29,       label: 'Disciple',        status: 'Building Habits', next: 30,  nextLabel: 'Builder',  color: '#34D399' },
  { min: 30,  max: 59,       label: 'Builder',         status: 'On Fire',         next: 60,  nextLabel: 'Warrior',  color: '#FB923C' },
  { min: 60,  max: 99,       label: 'Warrior',         status: 'Unstoppable',     next: 100, nextLabel: 'Legend',   color: '#C084FC' },
  { min: 100, max: Infinity, label: 'Legend',          status: 'Legendary',       next: null,nextLabel: null,       color: '#FBBF24' },
];

export function getTier(streak) {
  return TIERS.find(t => streak >= t.min && streak <= t.max) || TIERS[0];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark'))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function useCountUp(target, duration, delay) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
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

// ─── CSS keyframes ────────────────────────────────────────────────────────────
const STYLES = `
@keyframes ring-glow-pulse { 0%,100%{opacity:.15} 50%{opacity:.30} }
@keyframes bar-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
@keyframes pulse-dot { 0%,100%{opacity:.4} 50%{opacity:1} }
@keyframes ring-tap { 0%{transform:scale(1)} 50%{transform:scale(1.05)} 100%{transform:scale(1)} }
@media(prefers-reduced-motion:reduce){*{animation:none!important}}
`;
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const s = document.createElement('style');
  s.textContent = STYLES;
  document.head.appendChild(s);
  stylesInjected = true;
}

// ─── Row 1: Header ────────────────────────────────────────────────────────────
function HeaderBar({ tier, isDark }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#ffffff' : '#18181B', margin: 0 }}>
        Your Progress
      </h2>
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4,
          borderRadius: 9999,
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
          color: '#ffffff',
          /* tier-specific background — NOT hardcoded orange */
          backgroundColor: tier.color,
          boxShadow: `0 0 8px ${tier.color}44`,
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        <Flame style={{ width: 10, height: 10 }} />
        {tier.label}
      </motion.div>
    </div>
  );
}

// ─── Row 2: Streak ring ───────────────────────────────────────────────────────
function StreakRing({ animatedStreak, readToday, isDark }) {
  const SIZE = 120;
  const SW = 8;
  const r = (SIZE - SW) / 2;
  const [tapped, setTapped] = useState(false);
  const handleTap = useCallback(() => { setTapped(true); setTimeout(() => setTapped(false), 200); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}
    >
      <div
        onClick={handleTap}
        style={{
          position: 'relative', width: SIZE, height: SIZE,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', userSelect: 'none',
          animation: tapped ? 'ring-tap 0.2s ease-out' : 'none',
        }}
      >
        {/* Pulsing glow — only when read */}
        {readToday && (
          <div style={{
            position: 'absolute',
            width: SIZE + 36, height: SIZE + 36,
            top: -18, left: -18,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 65%)',
            animation: 'ring-glow-pulse 2s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        )}

        <svg width={SIZE} height={SIZE} style={{ position: 'absolute', filter: readToday ? 'drop-shadow(0 0 12px rgba(249,115,22,0.25))' : 'none' }}>
          <defs>
            <linearGradient id="fireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#F97316" />
              <stop offset="50%"  stopColor="#EF4444" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>
          </defs>
          {/* Track ring */}
          <circle cx={SIZE/2} cy={SIZE/2} r={r} fill="none"
            stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
            strokeWidth={SW} />
          {/* Fire ring — dimmed when not read */}
          <circle cx={SIZE/2} cy={SIZE/2} r={r} fill="none"
            stroke={readToday ? 'url(#fireGrad)' : 'rgba(249,115,22,0.3)'}
            strokeWidth={SW} strokeLinecap="round" />
        </svg>

        {/* Content inside ring */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {/* Streak number — FIRE GRADIENT (the only gradient in the section) */}
          <span style={{
            fontSize: 38, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
            background: 'linear-gradient(135deg, #F97316, #EF4444, #FDE047)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {animatedStreak}
          </span>

          {/* Label */}
          <span style={{
            fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px',
            color: isDark ? '#A1A1AA' : '#71717A', marginTop: 4, lineHeight: 1,
          }}>
            Day Streak
          </span>

          {/* Completion state */}
          {readToday ? (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.5 }}
              style={{ marginTop: 6 }}
            >
              {/* Checkmark — TEAL #34D399, no pill, no background */}
              <Check style={{ width: 12, height: 12, color: '#34D399', strokeWidth: 3 }} />
            </motion.div>
          ) : (
            <span style={{
              fontSize: 10, color: isDark ? '#71717A' : '#A1A1AA',
              marginTop: 6, lineHeight: 1, textAlign: 'center',
            }}>
              open your Bible
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Row 3: Tier progress bar ─────────────────────────────────────────────────
function TierProgressBar({ streak, tier, isDark }) {
  const [barWidth, setBarWidth] = useState(0);
  const progress = tier.next ? Math.min(((streak - tier.min) / (tier.next - tier.min)) * 100, 100) : 100;
  const daysLeft = tier.next ? Math.max(0, tier.next - streak) : 0;

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(progress), 200);
    return () => clearTimeout(t);
  }, [progress]);

  const labelColor = isDark ? '#A1A1AA' : '#71717A';
  const trackBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const trackBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      style={{ width: '100%', marginBottom: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Flame style={{ width: 12, height: 12, color: tier.color }} />
          {/* Tier name — tier-specific color */}
          <span style={{ fontSize: 12, fontWeight: 600, color: tier.color }}>{tier.status}</span>
        </div>
        {tier.next && <span style={{ fontSize: 12, color: labelColor }}>{tier.nextLabel}</span>}
      </div>

      <div style={{ position: 'relative', width: '100%', height: 4, borderRadius: 9999, background: trackBg, border: trackBorder, overflow: 'visible' }}>
        <motion.div
          style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            borderRadius: 9999, overflow: 'hidden',
            /* Progress bar fill — tier-specific color, NOT gradient */
            backgroundColor: tier.color,
            boxShadow: `0 0 6px ${tier.color}50`,
          }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div style={{
            position: 'absolute', inset: 0, width: '40%',
            background: `linear-gradient(90deg, transparent 30%, ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.20)'} 50%, transparent 70%)`,
            animation: 'bar-shimmer 3s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        </motion.div>

        {/* End-cap dot */}
        {barWidth > 2 && (
          <motion.div
            style={{
              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
              width: 6, height: 6, borderRadius: '50%',
              background: 'rgba(255,255,255,0.85)',
              boxShadow: `0 0 4px ${tier.color}`,
            }}
            animate={{ left: `calc(${barWidth}% - 3px)` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
      </div>

      {tier.next && (
        <p style={{ fontSize: 12, color: labelColor, textAlign: 'center', marginTop: 6, fontWeight: 500 }}>
          {daysLeft} day{daysLeft !== 1 ? 's' : ''} to {tier.nextLabel}
        </p>
      )}
    </motion.div>
  );
}

// ─── Row 4: Stats ribbon ──────────────────────────────────────────────────────
function StatsRibbon({ thisWeek, bestWeek, bestMonth, isDark }) {
  const [isNewBest, setIsNewBest] = useState(false);
  // Count-ups
  const twAnim  = useCountUp(thisWeek,  600, 700);
  const bwAnim  = useCountUp(isNewBest ? thisWeek : bestWeek, 600, 800);
  const bmAnim  = useCountUp(bestMonth, 600, 900);

  useEffect(() => {
    if (thisWeek >= bestWeek && bestWeek > 0 && !isNewBest) {
      setIsNewBest(true);
      const t = setTimeout(() => setIsNewBest(false), 3000);
      return () => clearTimeout(t);
    }
  }, [thisWeek, bestWeek, isNewBest]);

  const labelColor   = isDark ? '#A1A1AA' : '#71717A';
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const Stat = ({ value, color, label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}>
      <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color }}>
        {value}
      </span>
      <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: labelColor }}>
        {label}
      </span>
    </div>
  );

  const Divider = () => (
    <div style={{ width: 1, height: 28, background: dividerColor, flexShrink: 0 }} />
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.3 }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16, paddingLeft: 8, paddingRight: 8 }}
    >
      {/* THIS WEEK — TEAL GREEN #34D399 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: '#34D399' }}>
            {twAnim}
          </span>
          {/* Live dot — TEAL #34D399 */}
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', animation: 'pulse-dot 1.5s ease-in-out infinite', flexShrink: 0 }} />
        </div>
        <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: labelColor }}>
          This Week
        </span>
      </div>

      <Divider />

      {/* BEST WEEK — SOLID GOLD #F59E0B (no gradient, no orange) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}>
        <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: '#F59E0B' }}>
          {bwAnim}
        </span>
        <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: isNewBest ? '#FBBF24' : labelColor }}>
          {isNewBest ? 'NEW BEST' : 'Best Week'}
        </span>
      </div>

      <Divider />

      {/* BEST MONTH — SOLID GOLD #F59E0B (no gradient, no orange) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}>
        <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: '#F59E0B' }}>
          {bmAnim}
        </span>
        <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: labelColor }}>
          Best Month
        </span>
      </div>
    </motion.div>
  );
}

// ─── Section divider ──────────────────────────────────────────────────────────
function SectionDivider({ isDark }) {
  return (
    <div style={{
      width: '100%', height: 1, marginBottom: 16,
      background: isDark
        ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(0,0,0,0.04), transparent)',
    }} />
  );
}

// ─── Bottom cards (side-by-side) ──────────────────────────────────────────────
function BottomCards({ yearChapters, mostReadBook, isDark }) {
  const animYear = useCountUp(yearChapters, 1000, 1100);
  const year = new Date().getFullYear();

  const bg        = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)';
  const border    = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)';
  const bshadow   = isDark
    ? 'inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.03)'
    : 'inset 0 1px 2px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.6)';
  const topLabel  = isDark ? '#A1A1AA' : '#71717A';
  const nameColor = isDark ? '#ffffff' : '#18181B';

  const cardStyle = {
    flex: 1, borderRadius: 12, padding: 12,
    background: bg, border, boxShadow: bshadow, minHeight: 80,
  };

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {/* Left: Year Total */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.3 }}
        style={cardStyle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <BookOpen style={{ width: 14, height: 14, color: '#F59E0B' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: topLabel }}>{year}</span>
        </div>
        {/* YEAR TOTAL NUMBER — SOLID GOLD #F59E0B, no gradient */}
        <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: '#F59E0B' }}>
          {animYear}
        </div>
        <div style={{ fontSize: 10, color: topLabel, marginTop: 2 }}>chapters read</div>
      </motion.div>

      {/* Right: Most Read */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.15, duration: 0.3 }}
        style={cardStyle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Star style={{ width: 14, height: 14, color: '#F59E0B' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: topLabel }}>Most Read</span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: nameColor, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {mostReadBook || '—'}
        </div>
        <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} style={{ width: 11, height: 11, color: '#FBBF24', fill: '#FBBF24' }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ProgressHero({ currentStreak, records, todayLogs = [], thisWeekChapters = 0, yearChapters = 0 }) {
  injectStyles();
  const isDark      = useIsDark();
  const tier        = getTier(currentStreak);
  const readToday   = todayLogs.length > 0;
  const animStreak  = useCountUp(currentStreak, 800, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ marginBottom: 0 }}
    >
      <HeaderBar tier={tier} isDark={isDark} />
      <StreakRing animatedStreak={animStreak} readToday={readToday} isDark={isDark} />
      <TierProgressBar streak={currentStreak} tier={tier} isDark={isDark} />
      <StatsRibbon thisWeek={thisWeekChapters} bestWeek={records.bestRolling7} bestMonth={records.bestMonth} isDark={isDark} />
      <BottomCards yearChapters={yearChapters} mostReadBook={records.mostReadBook?.name} isDark={isDark} />
      <SectionDivider isDark={isDark} />
    </motion.div>
  );
}