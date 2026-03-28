import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Flame, Star, Trophy, CalendarCheck } from 'lucide-react';

// ── Tier config ────────────────────────────────────────────────────────────

const TIERS = [
  { min: 0,   max: 6,   label: 'Getting Started', status: 'Just Starting',
    next: 7,   nextLabel: 'Disciple',
    badgeFrom: '#4B5563', badgeTo: '#9CA3AF', glow: 'rgba(156,163,175,0.50)', textColor: '#F3F4F6' },
  { min: 7,   max: 29,  label: 'Disciple',        status: 'Building Habits',
    next: 30,  nextLabel: 'Builder',
    badgeFrom: '#059669', badgeTo: '#34D399', glow: 'rgba(52,211,153,0.55)', textColor: '#ECFDF5' },
  { min: 30,  max: 59,  label: 'Builder',          status: 'On Fire',
    next: 60,  nextLabel: 'Warrior',
    badgeFrom: '#C2410C', badgeTo: '#FBBF24', glow: 'rgba(251,191,36,0.60)', textColor: '#FFF7ED' },
  { min: 60,  max: 99,  label: 'Warrior',          status: 'Unstoppable',
    next: 100, nextLabel: 'Legend',
    badgeFrom: '#C2410C', badgeTo: '#FB923C', glow: 'rgba(249,115,22,0.60)', textColor: '#FFF7ED' },
  { min: 100, max: Infinity, label: 'Legend',       status: 'Legendary',
    next: null, nextLabel: null,
    badgeFrom: '#C2410C', badgeTo: '#FDE047', glow: 'rgba(251,191,36,0.65)', textColor: '#FEFCE8' },
];

function getTier(streak) {
  return TIERS.find(t => streak >= t.min && streak <= t.max) || TIERS[0];
}

// ── Dark mode detector ─────────────────────────────────────────────────────

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

// ── CSS keyframes injected once ─────────────────────────────────────────────

const STYLES = `
@keyframes ring-spin { to { transform: rotate(360deg); } }
@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
@keyframes bar-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
@media (prefers-reduced-motion: reduce) {
  .bb-ring-spin { animation: none !important; }
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

// ── Animated Ring ──────────────────────────────────────────────────────────

function FireRing({ streak, animatedStreak, readToday }) {
  const tier = getTier(streak);
  const isDark = useIsDark();
  const RING_SIZE = 120;
  const RING_THICK = 8;

  useEffect(() => { injectStyles(); }, []);

  return (
    <div className="relative flex items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: RING_SIZE + 36, height: RING_SIZE + 36,
          top: -18, left: -18,
          background: `radial-gradient(circle, ${isDark ? tier.glow : 'rgba(249,115,22,0.12)'} 0%, transparent 65%)`,
          opacity: isDark ? 0.55 : 0.7,
        }}
      />

      <div
        className="absolute rounded-full bb-ring-spin"
        style={{
          width: RING_SIZE, height: RING_SIZE,
          background: 'conic-gradient(#C2410C 0%, #F97316 35%, #FDE047 65%, #F97316 80%, #C2410C 100%)',
          animationName: 'ring-spin',
          animationDuration: '8s',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          willChange: 'transform',
        }}
      />

      <div
        className="absolute rounded-full z-10"
        style={{
          width: RING_SIZE - RING_THICK * 2,
          height: RING_SIZE - RING_THICK * 2,
          background: 'hsl(var(--background))',
          top: RING_THICK, left: RING_THICK,
        }}
      />

      <div
        className="absolute rounded-full z-10 pointer-events-none"
        style={{
          width: RING_SIZE - RING_THICK * 2 - 4,
          height: RING_SIZE - RING_THICK * 2 - 4,
          top: RING_THICK + 2, left: RING_THICK + 2,
          border: '1.5px solid rgba(253,224,71,0.30)',
        }}
      />

      <div className="relative z-20 flex flex-col items-center justify-center select-none">
        <span
          className="font-black tabular-nums leading-none"
          style={{
            fontSize: 40,
            background: 'linear-gradient(135deg, #F97316, #FDE047)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {animatedStreak}
        </span>
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground mt-0.5">
          Day Streak
        </span>

        <AnimatePresence>
          {readToday && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 1.8, type: 'spring', stiffness: 500, damping: 18 }}
              className="mt-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.38)' }}
            >
              <Check className="w-2.5 h-2.5" style={{ color: '#22C55E' }} strokeWidth={3} />
              <span className="text-[11px] font-bold" style={{ color: '#22C55E' }}>Read today</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Milestone bar ──────────────────────────────────────────────────────────

function MilestoneBar({ streak, tier }) {
  const isDark = useIsDark();
  const [barWidth, setBarWidth] = useState(0);

  const progress = tier.next
    ? Math.min(((streak - tier.min) / (tier.next - tier.min)) * 100, 100)
    : 100;
  const daysLeft = tier.next ? tier.next - streak : 0;
  const motivational = tier.next
    ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} to ${tier.nextLabel}`
    : `You've reached the top tier. Keep going!`;

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(progress), 200);
    return () => clearTimeout(t);
  }, [progress]);

  const trackBg     = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
  const trackBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)';
  const fillGlow    = isDark ? '0 0 8px rgba(249,115,22,0.40)' : '0 0 6px rgba(249,115,22,0.25)';
  const labelColor  = isDark ? '#A1A1AA' : '#52525B';
  const shimmer     = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.30)';

  return (
    <div className="w-full mt-2">
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3 h-3 text-orange-400" />
          <span className="text-xs font-semibold text-orange-400">{tier.status}</span>
        </div>
        {tier.next && (
          <span className="text-xs font-medium" style={{ color: labelColor }}>{tier.nextLabel}</span>
        )}
      </div>

      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{ height: 7, background: trackBg, border: trackBorder }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full overflow-hidden transition-all ease-out"
          style={{
            width: `${barWidth}%`,
            transitionDuration: '1000ms',
            background: 'linear-gradient(90deg, #C2410C, #F97316, #FDE047)',
            boxShadow: fillGlow,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${shimmer}, transparent)`,
              animation: 'bar-shimmer 3s ease-in-out infinite',
              width: '40%',
            }}
          />
        </div>
      </div>

      <p className="text-[12px] mt-1 text-center font-medium" style={{ color: labelColor }}>
        {motivational}
      </p>
    </div>
  );
}

// ── Stats Ribbon ──────────────────────────────────────────────────────────

function StatsRibbon({ thisWeek, bestWeek, bestMonth }) {
  const isDark = useIsDark();
  const isNewPB = thisWeek >= bestWeek && bestWeek > 0;

  const thisWeekAnim  = useCountUp(thisWeek,  1000, 0);
  const bestWeekAnim  = useCountUp(isNewPB ? thisWeek : bestWeek, 800, 1100);
  const bestMonthAnim = useCountUp(bestMonth, 800, 1250);

  const [labelVisible, setLabelVisible] = useState(false);
  const [dotVisible,   setDotVisible]   = useState(false);
  const [badge1,       setBadge1]        = useState(false);
  const [badge2,       setBadge2]        = useState(false);
  const [shimmer1,     setShimmer1]      = useState(false);
  const [shimmer2,     setShimmer2]      = useState(false);

  useEffect(() => {
    const ts = [
      setTimeout(() => setLabelVisible(true), 800),
      setTimeout(() => setDotVisible(true),   1000),
      setTimeout(() => setBadge1(true),       1100),
      setTimeout(() => setBadge2(true),       1250),
      setTimeout(() => setShimmer1(true),     1400),
      setTimeout(() => setShimmer2(true),     1700),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  const prevIsNewPB = useRef(false);
  useEffect(() => {
    if (isNewPB && !prevIsNewPB.current) {
      setShimmer1(false);
      setTimeout(() => setShimmer1(true), 50);
    }
    prevIsNewPB.current = isNewPB;
  }, [isNewPB]);

  const fireGrad = {
    background: 'linear-gradient(135deg, #F97316, #FDE047)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };
  const labelColor    = isDark ? '#A1A1AA' : '#71717A';
  const badgeBg       = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const badgeBorder   = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)';
  const badgeBorderPB = '1px solid rgba(251,191,36,0.20)';
  const numColor      = isDark ? '#ffffff' : '#27272A';
  const glowBg        = isDark
    ? 'radial-gradient(circle at center, rgba(249,115,22,0.06) 0%, transparent 70%)'
    : 'radial-gradient(circle at center, rgba(249,115,22,0.04) 0%, transparent 70%)';

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero: This Week */}
      <div className="relative flex flex-col items-center w-full" style={{ paddingTop: 12, paddingBottom: 10 }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: glowBg }} />
        <div className="relative flex items-center gap-2">
          <span className="font-black tabular-nums leading-none" style={{ fontSize: 36, ...fireGrad }}>
            {thisWeekAnim}
          </span>
          {dotVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ marginBottom: 2, background: '#FB923C' }}
            >
              <motion.div
                className="w-full h-full rounded-full"
                style={{ background: '#FB923C' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: labelVisible ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="mt-1 text-center"
          style={{ fontSize: 12, color: labelColor, fontWeight: 400 }}
        >
          chapters this week
          {isNewPB && (
            <span className="font-bold" style={{ color: '#FBBF24' }}> — new personal best</span>
          )}
        </motion.div>
      </div>

      {/* Personal Best Badges */}
      <div className="flex items-center justify-center gap-3" style={{ marginTop: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: badge1 ? 1 : 0, y: badge1 ? 0 : 8 }}
          transition={{ duration: 0.3 }}
          whileTap={{ scale: 0.95 }}
          className="relative overflow-hidden flex items-center gap-1.5 rounded-full"
          style={{ background: badgeBg, border: isNewPB ? badgeBorderPB : badgeBorder, padding: '6px 14px' }}
        >
          <Star className="w-4 h-4 shrink-0" style={{ color: '#FBBF24' }} />
          <span className="text-[20px] font-bold tabular-nums leading-none" style={{ color: numColor }}>{bestWeekAnim}</span>
          <span className="text-[12px]" style={{ color: labelColor }}>best week</span>
          {shimmer1 && (
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)',
              animation: 'shimmer 1.2s ease-out forwards',
            }} />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: badge2 ? 1 : 0, y: badge2 ? 0 : 8 }}
          transition={{ duration: 0.3 }}
          whileTap={{ scale: 0.95 }}
          className="relative overflow-hidden flex items-center gap-1.5 rounded-full"
          style={{ background: badgeBg, border: badgeBorder, padding: '6px 14px' }}
        >
          <Trophy
            className="w-4 h-4 shrink-0" style={{ color: '#FBBF24' }} />
          <span className="text-[20px] font-bold tabular-nums leading-none" style={{ color: numColor }}>{bestMonthAnim}</span>
          <span className="text-[12px]" style={{ color: labelColor }}>best month</span>
          {shimmer2 && (
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)',
              animation: 'shimmer 1.2s ease-out forwards',
            }} />
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ── Most Read Book card ────────────────────────────────────────────────────

function MostReadCard({ value, delay = 0 }) {
  const [shimmerDone, setShimmerDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShimmerDone(true), (delay + 1.5) * 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileTap={{ scale: 0.97 }}
      className="w-full rounded-2xl flex items-center gap-3 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(147,51,234,0.08), rgba(249,115,22,0.04))',
        border: '1px solid rgba(147,51,234,0.16)',
        minHeight: 52,
        padding: '10px 12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
      }}
    >
      {!shimmerDone && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)',
            animation: 'shimmer 1.5s ease-in-out',
            animationDelay: `${delay}s`,
            animationFillMode: 'forwards',
          }}
        />
      )}

      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(124,58,237,0.16)', border: '1.5px solid rgba(124,58,237,0.28)' }}
      >
        <BookOpen className="w-5 h-5" style={{ color: '#7C3AED' }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Most Read Book</div>
        <div className="text-lg font-black text-foreground truncate leading-tight">
          {!value || value === 'None' ? '—' : value}
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: '#EAB308' }} />
        ))}
      </div>
    </motion.div>
  );
}

// ── Year Counter ────────────────────────────────────────────────────────────

function YearCounter({ yearChapters }) {
  const isDark = useIsDark();
  const year = new Date().getFullYear();
  const animatedCount = useCountUp(yearChapters, 1500, 1400);

  const fireGrad = {
    background: 'linear-gradient(135deg, #F97316, #FDE047)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };
  const bg = isDark ? 'linear-gradient(90deg, rgba(249,115,22,0.04), rgba(251,191,36,0.04))' : 'linear-gradient(90deg, rgba(249,115,22,0.03), rgba(251,191,36,0.03))';
  const border = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)';
  const labelColor = isDark ? '#A1A1AA' : '#71717A';
  const yearColor = isDark ? '#ffffff' : '#27272A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.3 }}
      className="w-full flex items-center justify-between rounded-xl"
      style={{ background: bg, border, padding: '10px 14px', minHeight: 44 }}
    >
      <div className="flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5" style={{ color: isDark ? '#A1A1AA' : '#71717A' }} />
        <span className="text-[13px] font-bold" style={{ color: yearColor }}>{year}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[20px] font-bold tabular-nums leading-none" style={fireGrad}>{animatedCount}</span>
        <span className="text-[12px]" style={{ color: labelColor }}>chapters read</span>
      </div>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function ProgressHero({ currentStreak, records, todayLogs = [], thisWeekChapters = 0, yearChapters = 0 }) {
  const readToday = todayLogs.length > 0;
  const tier = getTier(currentStreak);
  const animatedStreak = useCountUp(currentStreak, 1500, 80);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-3"
    >
      {/* Header with tier badge */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide"
          style={{
            background: `linear-gradient(135deg, ${tier.badgeFrom}, ${tier.badgeTo})`,
            color: tier.textColor,
            minHeight: 28,
            boxShadow: '0 2px 8px rgba(249,115,22,0.30)',
          }}
        >
          <Flame className="w-3 h-3" />
          {tier.label}
        </motion.div>
      </div>

      {/* Ring hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
        className="flex flex-col items-center"
        style={{ marginBottom: 8 }}
      >
        <FireRing streak={currentStreak} animatedStreak={animatedStreak} readToday={readToday} />
        <MilestoneBar streak={currentStreak} tier={tier} />
      </motion.div>

      {/* Stats */}
      <div style={{ marginTop: 12, marginBottom: 12 }}>
        <StatsRibbon
          thisWeek={thisWeekChapters}
          bestWeek={records.bestRolling7}
          bestMonth={records.bestMonth}
        />
      </div>

      <MostReadCard value={records.mostReadBook?.name} delay={0.54} />

      <div style={{ marginTop: 12 }}>
        <YearCounter yearChapters={yearChapters} />
      </div>
    </motion.div>
  );
}