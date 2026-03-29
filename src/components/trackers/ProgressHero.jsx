import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Check, Flame, Star, Shield, Crown, Sprout, Calendar, Layers } from 'lucide-react';

// ─── Tier config ───────────────────────────────────────────────────────────────
const TIERS = [
  {
    min: 0,   max: 6,        label: 'Follower',   next: 7,   nextLabel: 'Disciple',
    color: '#22C55E', bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.30)',   Icon: Sprout,
  },
  {
    min: 7,   max: 29,       label: 'Disciple',   next: 30,  nextLabel: 'Warrior',
    color: '#3B82F6', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.30)',  Icon: BookOpen,
  },
  {
    min: 30,  max: 99,       label: 'Warrior',    next: 100, nextLabel: 'Builder',
    color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.30)',   Icon: Shield,
  },
  {
    min: 100, max: 249,      label: 'Builder',    next: 250, nextLabel: 'Faithful',
    color: '#06B6D4', bg: 'rgba(6,182,212,0.15)',   border: 'rgba(6,182,212,0.30)',   Icon: Layers,
  },
  {
    min: 250, max: 499,      label: 'Faithful',   next: 500, nextLabel: 'Steadfast',
    color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)',  border: 'rgba(139,92,246,0.30)',  Icon: Crown,
  },
  {
    min: 500, max: Infinity, label: 'Steadfast',  next: null, nextLabel: null,
    color: '#FDE047', bg: 'rgba(253,224,71,0.15)',  border: 'rgba(253,224,71,0.30)',  Icon: Star,
  },
];

export function getTier(streak) {
  return TIERS.find(t => streak >= t.min && streak <= t.max) || TIERS[0];
}

function getNextTierColor(tier) {
  if (!tier.next) return '#71717A';
  const next = TIERS.find(t => t.label === tier.nextLabel);
  return next ? next.color : '#71717A';
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
@keyframes ring-glow-pulse { 0%,100%{opacity:.15} 50%{opacity:.25} }
@keyframes bar-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
@keyframes pulse-dot { 0%,100%{opacity:.4} 50%{opacity:1} }
@keyframes ring-tap { 0%{transform:scale(1)} 50%{transform:scale(1.05)} 100%{transform:scale(1)} }
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
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
  const TierIcon = tier.Icon;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: isDark ? '#ffffff' : '#18181B', margin: 0 }}>
        Your Progress
      </h2>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
        style={{
          paddingLeft: 10, paddingRight: 10, height: 28,
          borderRadius: 9999,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.3px',
          color: tier.color,
          backgroundColor: tier.bg,
          border: `1px solid ${tier.border}`,
          display: 'flex', alignItems: 'center', gap: 5,
        }}
      >
        <TierIcon style={{ width: 11, height: 11 }} />
        {tier.label}
      </motion.div>
    </div>
  );
}

// ─── Row 2: Streak ring ───────────────────────────────────────────────────────
function StreakRing({ animatedStreak, readToday, isDark, tier }) {
  const SIZE = 140;
  const SW = 7;
  const r = (SIZE - SW) / 2;
  const [tapped, setTapped] = useState(false);
  const handleTap = useCallback(() => { setTapped(true); setTimeout(() => setTapped(false), 200); }, []);
  const TierIcon = tier.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
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
        {/* Breathing glow */}
        {readToday && (
          <div style={{
            position: 'absolute',
            width: SIZE + 40, height: SIZE + 40,
            top: -20, left: -20,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${tier.color}33 0%, transparent 65%)`,
            animation: 'ring-glow-pulse 3s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        )}

        <svg width={SIZE} height={SIZE} style={{
          position: 'absolute',
          filter: readToday ? `drop-shadow(0 0 14px ${tier.color}44)` : 'none',
          transition: 'filter 0.5s ease',
        }}>
          <defs>
            <linearGradient id="tierGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={tier.color} />
              <stop offset="100%" stopColor={tier.color + 'CC'} />
            </linearGradient>
          </defs>
          {/* Track ring */}
          <circle cx={SIZE/2} cy={SIZE/2} r={r} fill="none"
            stroke={isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)'}
            strokeWidth={SW} />
          {/* Tier-colored ring */}
          <circle cx={SIZE/2} cy={SIZE/2} r={r} fill="none"
            stroke={readToday ? `url(#tierGrad)` : `${tier.color}4D`}
            strokeWidth={SW} strokeLinecap="round"
            style={{ transition: 'stroke 0.6s ease' }}
          />
        </svg>

        {/* Content inside ring */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {/* Streak number — fire gradient */}
          <span style={{
            fontSize: 50, fontWeight: 700, lineHeight: 1.12, fontVariantNumeric: 'tabular-nums',
            paddingTop: 2, paddingLeft: 1, paddingRight: 1,
            background: 'linear-gradient(135deg, #F97316, #EF4444, #FDE047)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            overflow: 'visible',
          }}>
            {animatedStreak}
          </span>

          {/* Day Streak label */}
          <span style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px',
            color: isDark ? '#A1A1AA' : '#71717A', marginTop: 3, lineHeight: 1,
          }}>
            Day Streak
          </span>

          {/* Read state */}
          {readToday ? (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 4 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 1.0 }}
              style={{ marginTop: 4 }}
            >
              <Check style={{ width: 14, height: 14, color: '#10B981', strokeWidth: 3 }} />
            </motion.div>
          ) : (
            <span style={{
              fontSize: 9, fontStyle: 'italic',
              color: isDark ? '#71717A' : '#A1A1AA',
              marginTop: 4, lineHeight: 1, textAlign: 'center',
            }}>
              open your Bible
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Row 3: Tier progress bar ───────────────────────────────────────────────────────
function TierProgressBar({ streak, tier, isDark }) {
  const TierIcon = tier.Icon;
  const [barWidth, setBarWidth] = useState(0);
  const progress = tier.next ? Math.min(((streak - tier.min) / (tier.next - tier.min)) * 100, 100) : 100;
  const daysLeft = tier.next ? Math.max(0, tier.next - streak) : 0;
  const nextColor = getNextTierColor(tier);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(progress), 1000);
    return () => clearTimeout(t);
  }, [progress]);

  const subtleLabel = isDark ? '#71717A' : '#A1A1AA';
  const trackBg     = isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.09)';
  const trackBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      style={{ width: '100%', marginBottom: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        {/* Current tier: icon + label */}
        <motion.div
          key={tier.label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <TierIcon style={{ width: 12, height: 12, color: tier.color }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: tier.color }}>{tier.label}</span>
        </motion.div>
        {/* Next tier: icon + label */}
        {tier.next && (() => {
          const NextTier = TIERS.find(t => t.label === tier.nextLabel);
          const NextIcon = NextTier?.Icon;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {NextIcon && <NextIcon style={{ width: 12, height: 12, color: nextColor }} />}
              <span style={{ fontSize: 11, fontWeight: 600, color: nextColor }}>{tier.nextLabel}</span>
            </div>
          );
        })()}
      </div>

      <div style={{ position: 'relative', width: '100%', height: 6, borderRadius: 9999, background: trackBg, border: trackBorder, overflow: 'visible' }}>
        <motion.div
          style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            borderRadius: 9999, overflow: 'hidden',
            backgroundColor: tier.color,
            boxShadow: `0 0 6px ${tier.color}50`,
          }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* One-shot shimmer on load */}
          <div style={{
            position: 'absolute', inset: 0, width: '40%',
            background: `linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)`,
            animation: 'bar-shimmer 1.5s ease-out 0.5s 1',
            pointerEvents: 'none',
          }} />
        </motion.div>

        {/* Playhead dot */}
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
        <p style={{ fontSize: 11, color: subtleLabel, textAlign: 'center', marginTop: 6, fontWeight: 400 }}>
          {daysLeft} day{daysLeft !== 1 ? 's' : ''} to {tier.nextLabel}
        </p>
      )}
    </motion.div>
  );
}

// ─── Row 4: Stats ribbon ──────────────────────────────────────────────────────
function StatsRibbon({ thisWeek, bestWeek, bestMonth, isDark }) {
  const [isNewBest, setIsNewBest] = useState(false);
  const twAnim = useCountUp(thisWeek,  600, 1000);
  const bwAnim = useCountUp(isNewBest ? thisWeek : bestWeek, 600, 1100);
  const bmAnim = useCountUp(bestMonth, 600, 1200);

  useEffect(() => {
    if (thisWeek >= bestWeek && bestWeek > 0 && !isNewBest) {
      setIsNewBest(true);
      const t = setTimeout(() => setIsNewBest(false), 4000);
      return () => clearTimeout(t);
    }
  }, [thisWeek, bestWeek, isNewBest]);

  const labelColor   = isDark ? '#71717A' : '#A1A1AA';
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const Divider = () => (
    <div style={{ width: 1, height: 32, background: dividerColor, flexShrink: 0 }} />
  );

  // This Week number style — fire gradient if new best, else emerald
  const twNumberStyle = isNewBest
    ? {
        fontSize: 28, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        background: 'linear-gradient(135deg, #F97316, #EF4444, #FDE047)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }
    : {
        fontSize: 28, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        color: '#10B981',
      };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.0, duration: 0.3 }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 12 }}
    >
      {/* THIS WEEK — emerald */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', paddingTop: 2, paddingLeft: 2, paddingRight: 8, overflow: 'visible' }}>
          <span style={{ ...twNumberStyle, lineHeight: 1.12, paddingTop: 1, paddingLeft: 1, paddingRight: 1, overflow: 'visible' }}>{twAnim}</span>
          {/* Pulsing live dot upper-right */}
          <div style={{
            position: 'absolute', top: -1, right: -1,
            width: 5, height: 5, borderRadius: '50%', background: '#10B981',
            animation: 'pulse-dot 2s ease-in-out infinite',
          }} />
        </div>
        {isNewBest
          ? <span style={{ fontSize: 8, fontWeight: 700, color: '#EAB308', textTransform: 'uppercase', letterSpacing: '0.5px' }}>new best!</span>
          : <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: labelColor }}>This Week</span>
        }
      </div>

      <Divider />

      {/* BEST WEEK — foreground */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
        <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.12, paddingTop: 1, paddingLeft: 1, paddingRight: 1, fontVariantNumeric: 'tabular-nums', color: isDark ? '#ffffff' : '#18181B', overflow: 'visible' }}>
          {bwAnim}
        </span>
        <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: labelColor }}>
          Best Week
        </span>
      </div>

      <Divider />

      {/* BEST MONTH — foreground */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
        <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.12, paddingTop: 1, paddingLeft: 1, paddingRight: 1, fontVariantNumeric: 'tabular-nums', color: isDark ? '#ffffff' : '#18181B', overflow: 'visible' }}>
          {bmAnim}
        </span>
        <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: labelColor }}>
          Best Month
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ProgressHero({ currentStreak, records, todayLogs = [], thisWeekChapters = 0, yearChapters = 0 }) {
  injectStyles();
  const isDark     = useIsDark();
  const tier       = getTier(currentStreak);
  const readToday  = todayLogs.length > 0;
  const animStreak = useCountUp(currentStreak, 800, 200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ marginBottom: 0 }}
    >
      <HeaderBar tier={tier} isDark={isDark} />
      <StreakRing animatedStreak={animStreak} readToday={readToday} isDark={isDark} tier={tier} />
      <TierProgressBar streak={currentStreak} tier={tier} isDark={isDark} />
      <StatsRibbon thisWeek={thisWeekChapters} bestWeek={records.bestRolling7} bestMonth={records.bestMonth} isDark={isDark} />
      <BottomCards yearChapters={yearChapters} mostReadBook={records.mostReadBook?.name} isDark={isDark} tier={tier} />
      <SectionDivider isDark={isDark} />
    </motion.div>
  );
}