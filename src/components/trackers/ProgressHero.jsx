import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Check, Flame, Star, Sword, Crown, BookMarked, Sprout, Calendar, TrendingUp } from 'lucide-react';

// ─── Tier config ───────────────────────────────────────────────────────────────
const TIERS = [
  { min: 0,   max: 6,        label: 'Beginner',   next: 7,   nextLabel: 'Disciple',  color: '#3B82F6', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.30)',  Icon: BookMarked, sub: 'Every journey begins here.' },
  { min: 7,   max: 29,       label: 'Disciple',   next: 30,  nextLabel: 'Warrior',   color: '#10B981', bg: 'rgba(16,185,129,0.15)',   border: 'rgba(16,185,129,0.30)',  Icon: Sprout,     sub: 'Roots are forming.' },
  { min: 30,  max: 99,       label: 'Warrior',    next: 100, nextLabel: 'Builder',   color: '#F97316', bg: 'rgba(249,115,22,0.15)',   border: 'rgba(249,115,22,0.30)',  Icon: Flame,      sub: 'Stay faithful.' },
  { min: 100, max: 249,      label: 'Builder',    next: 250, nextLabel: 'Faithful',  color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)',   border: 'rgba(139,92,246,0.30)',  Icon: Sword,      sub: 'You are building something real.' },
  { min: 250, max: 499,      label: 'Faithful',   next: 500, nextLabel: 'Steadfast', color: '#EAB308', bg: 'rgba(234,179,8,0.15)',    border: 'rgba(234,179,8,0.30)',   Icon: Crown,      sub: 'Faithfulness defines you.' },
  { min: 500, max: Infinity, label: 'Steadfast',  next: null, nextLabel: null,       color: '#E879F9', bg: 'rgba(232,121,249,0.15)',  border: 'rgba(232,121,249,0.30)', Icon: Crown,      sub: 'A living testament.' },
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
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
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

// ─── CSS ──────────────────────────────────────────────────────────────────────
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

// ─── Header ───────────────────────────────────────────────────────────────────
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
          paddingLeft: 10, paddingRight: 10, height: 28, borderRadius: 9999,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.3px',
          color: tier.color, backgroundColor: tier.bg, border: `1px solid ${tier.border}`,
          display: 'flex', alignItems: 'center', gap: 5,
        }}
      >
        <TierIcon style={{ width: 11, height: 11 }} />
        {tier.label}
      </motion.div>
    </div>
  );
}

// ─── Streak Ring ──────────────────────────────────────────────────────────────
function StreakRing({ animatedStreak, readToday, isDark, tier }) {
  const SIZE = 140;
  const SW = 8;
  const r = (SIZE - SW) / 2;
  const [tapped, setTapped] = useState(false);
  const handleTap = useCallback(() => { setTapped(true); setTimeout(() => setTapped(false), 200); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}
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
        {readToday && (
          <div style={{
            position: 'absolute', width: SIZE + 40, height: SIZE + 40, top: -20, left: -20,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.20) 0%, transparent 65%)',
            animation: 'ring-glow-pulse 3s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        )}
        <svg width={SIZE} height={SIZE} style={{
          position: 'absolute',
          filter: readToday ? 'drop-shadow(0 0 14px rgba(249,115,22,0.25))' : 'none',
        }}>
          <defs>
            <linearGradient id="fireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#C2410C" />
              <stop offset="50%"  stopColor="#F97316" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>
          </defs>
          <circle cx={SIZE/2} cy={SIZE/2} r={r} fill="none"
            stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
            strokeWidth={SW} />
          <circle cx={SIZE/2} cy={SIZE/2} r={r} fill="none"
            stroke={readToday ? 'url(#fireGrad)' : 'rgba(249,115,22,0.30)'}
            strokeWidth={SW} strokeLinecap="round" />
        </svg>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{
            fontSize: 42, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
            background: 'linear-gradient(135deg, #C2410C, #F97316, #FDE047)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {animatedStreak}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px',
            color: isDark ? '#A1A1AA' : '#71717A', marginTop: 2, lineHeight: 1,
          }}>
            Days
          </span>
          {readToday ? (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 4 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 1.0 }}
              style={{ marginTop: 6 }}
            >
              <Check style={{ width: 14, height: 14, color: '#10B981', strokeWidth: 3 }} />
            </motion.div>
          ) : (
            <span style={{
              fontSize: 9, fontStyle: 'italic',
              color: isDark ? '#71717A' : '#A1A1AA',
              marginTop: 6, lineHeight: 1, textAlign: 'center',
            }}>
              open your Bible
            </span>
          )}
        </div>
      </div>

      {/* Identity label + subtext */}
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: tier.color }}>{tier.label}</div>
        <div style={{ fontSize: 11, color: isDark ? '#71717A' : '#A1A1AA', marginTop: 2, fontStyle: 'italic' }}>{tier.sub}</div>
      </div>
    </motion.div>
  );
}

// ─── Next Milestone ───────────────────────────────────────────────────────────
function MilestoneBar({ streak, tier, isDark }) {
  const [barWidth, setBarWidth] = useState(0);
  const progress = tier.next ? Math.min(((streak - tier.min) / (tier.next - tier.min)) * 100, 100) : 100;
  const daysLeft = tier.next ? Math.max(0, tier.next - streak) : 0;
  const nextColor = getNextTierColor(tier);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(progress), 1000);
    return () => clearTimeout(t);
  }, [progress]);

  const subtleLabel = isDark ? '#71717A' : '#A1A1AA';
  const trackBg     = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.3 }}
      style={{ width: '100%', marginBottom: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: isDark ? '#A1A1AA' : '#71717A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Next Milestone
        </span>
        {tier.next && (
          <span style={{ fontSize: 11, fontWeight: 600, color: nextColor }}>
            {tier.nextLabel} — {daysLeft} day{daysLeft !== 1 ? 's' : ''} away
          </span>
        )}
        {!tier.next && (
          <span style={{ fontSize: 11, fontWeight: 600, color: tier.color }}>Peak achieved 👑</span>
        )}
      </div>

      <div style={{ position: 'relative', width: '100%', height: 6, borderRadius: 9999, background: trackBg, overflow: 'visible' }}>
        <motion.div
          style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            borderRadius: 9999, overflow: 'hidden',
            backgroundColor: tier.color,
            boxShadow: `0 0 8px ${tier.color}60`,
          }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div style={{
            position: 'absolute', inset: 0, width: '40%',
            background: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
            animation: 'bar-shimmer 1.5s ease-out 0.5s 1',
            pointerEvents: 'none',
          }} />
        </motion.div>
        {barWidth > 2 && (
          <motion.div
            style={{
              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
              width: 6, height: 6, borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              boxShadow: `0 0 5px ${tier.color}`,
            }}
            animate={{ left: `calc(${barWidth}% - 3px)` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: tier.color, fontWeight: 600 }}>{tier.label}</span>
        {tier.nextLabel && <span style={{ fontSize: 10, color: nextColor, fontWeight: 600 }}>{tier.nextLabel}</span>}
      </div>
    </motion.div>
  );
}

// ─── Insight Cards ────────────────────────────────────────────────────────────
function InsightCards({ thisWeek, lastWeekDelta, bestWeek, bestMonth, mostReadBook, isDark }) {
  const twAnim = useCountUp(thisWeek, 600, 1000);
  const bwAnim = useCountUp(bestWeek, 600, 1100);
  const bmAnim = useCountUp(bestMonth, 600, 1200);

  const bg     = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const border = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)';
  const label  = isDark ? '#71717A' : '#A1A1AA';
  const text   = isDark ? '#ffffff' : '#18181B';

  const cards = [
    {
      color: '#10B981',
      icon: <TrendingUp style={{ width: 14, height: 14, color: '#10B981' }} />,
      value: twAnim,
      unit: 'chapters',
      desc: 'read this week',
      sub: lastWeekDelta > 0
        ? `↑ ${lastWeekDelta} more than last week`
        : lastWeekDelta < 0
        ? `↓ ${Math.abs(lastWeekDelta)} fewer than last week`
        : 'Same pace as last week',
    },
    {
      color: '#A78BFA',
      icon: <Star style={{ width: 14, height: 14, color: '#A78BFA' }} />,
      value: bwAnim,
      unit: 'chapters',
      desc: 'best week ever',
      sub: `Your personal record`,
    },
    {
      color: '#38BDF8',
      icon: <Calendar style={{ width: 14, height: 14, color: '#38BDF8' }} />,
      value: bmAnim,
      unit: 'chapters',
      desc: 'best month ever',
      sub: `Monthly record`,
    },
    {
      color: '#EAB308',
      icon: <BookOpen style={{ width: 14, height: 14, color: '#EAB308' }} />,
      value: null,
      label: mostReadBook || '—',
      desc: 'most read book',
      sub: '★★★★★',
      isBook: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.0, duration: 0.3 }}
      style={{ marginBottom: 16 }}
    >
      <div style={{
        display: 'flex', gap: 10, overflowX: 'auto', scrollSnapType: 'x mandatory',
        paddingBottom: 6, paddingLeft: 2, paddingRight: 2,
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 + i * 0.07, duration: 0.3 }}
            style={{
              flexShrink: 0, scrollSnapAlign: 'start',
              width: 140, borderRadius: 16, padding: 12,
              background: bg, border, boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.04)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
              {card.icon}
              <span style={{ fontSize: 10, fontWeight: 600, color: card.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {card.desc}
              </span>
            </div>
            {card.isBook ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: text, lineHeight: 1.2, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 11, color: '#EAB308' }}>{card.sub}</div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: card.color }}>
                    {card.value}
                  </span>
                  <span style={{ fontSize: 11, color: label }}>{card.unit}</span>
                </div>
                <div style={{ fontSize: 10, color: label }}>{card.sub}</div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Your Foundation ──────────────────────────────────────────────────────────
function FoundationSection({ totalChapters, isDark }) {
  const stage = totalChapters >= 500 ? 4 : totalChapters >= 150 ? 3 : totalChapters >= 50 ? 2 : 1;

  const stages = [
    { emoji: '🪨', desc: 'Foundation laid', detail: 'The first stone.' },
    { emoji: '🧱', desc: 'Walls rising',    detail: 'Layer by layer.' },
    { emoji: '🏛️', desc: 'Structure standing', detail: 'Growing strong.' },
    { emoji: '⛪', desc: 'House complete', detail: 'Built on the Word.' },
  ];

  const current = stages[stage - 1];
  const bg     = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const border = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)';
  const label  = isDark ? '#71717A' : '#A1A1AA';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, duration: 0.4 }}
      style={{ borderRadius: 16, padding: '14px 16px', background: bg, border, marginBottom: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#fff' : '#18181B' }}>Your Foundation</span>
        <span style={{ fontSize: 11, color: label }}>{totalChapters} chapters total</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 36, lineHeight: 1 }}>{current.emoji}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#fff' : '#18181B', marginBottom: 2 }}>{current.desc}</div>
          <div style={{ fontSize: 11, color: label, fontStyle: 'italic' }}>{current.detail}</div>
        </div>
      </div>

      {/* Stage dots */}
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        {stages.map((s, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 9999,
            background: i < stage ? '#F97316' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      <p style={{ fontSize: 10, color: label, marginTop: 8, textAlign: 'center', fontStyle: 'italic' }}>
        Every day adds to what you're building
      </p>
    </motion.div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
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

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ProgressHero({ currentStreak, records, todayLogs = [], thisWeekChapters = 0, yearChapters = 0 }) {
  injectStyles();
  const isDark     = useIsDark();
  const tier       = getTier(currentStreak);
  const readToday  = todayLogs.length > 0;
  const animStreak = useCountUp(currentStreak, 1400, 200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ marginBottom: 0 }}
    >
      <HeaderBar tier={tier} isDark={isDark} />
      <StreakRing animatedStreak={animStreak} readToday={readToday} isDark={isDark} tier={tier} />
      <MilestoneBar streak={currentStreak} tier={tier} isDark={isDark} />
      <InsightCards
        thisWeek={thisWeekChapters}
        lastWeekDelta={records.deltaVsLastWeek ?? 0}
        bestWeek={records.bestRolling7 ?? 0}
        bestMonth={records.bestMonth ?? 0}
        mostReadBook={records.mostReadBook?.name}
        isDark={isDark}
      />
      <FoundationSection totalChapters={yearChapters} isDark={isDark} />
      <SectionDivider isDark={isDark} />
    </motion.div>
  );
}