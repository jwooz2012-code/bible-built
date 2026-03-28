import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BarChart2, BookOpen, Check, Flame, Star } from 'lucide-react';

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
  const RING_SIZE = 180;
  const RING_THICK = 11;

  useEffect(() => { injectStyles(); }, []);

  return (
    <div className="relative flex items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
      {/* Ambient glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: RING_SIZE + 52, height: RING_SIZE + 52,
          top: -26, left: -26,
          background: `radial-gradient(circle, ${isDark ? tier.glow : 'rgba(249,115,22,0.12)'} 0%, transparent 65%)`,
          opacity: isDark ? 0.55 : 0.7,
        }}
      />

      {/* Rotating conic gradient ring */}
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

      {/* Mask to create ring */}
      <div
        className="absolute rounded-full z-10"
        style={{
          width: RING_SIZE - RING_THICK * 2,
          height: RING_SIZE - RING_THICK * 2,
          background: 'hsl(var(--background))',
          top: RING_THICK, left: RING_THICK,
        }}
      />

      {/* Inner accent ring */}
      <div
        className="absolute rounded-full z-10 pointer-events-none"
        style={{
          width: RING_SIZE - RING_THICK * 2 - 6,
          height: RING_SIZE - RING_THICK * 2 - 6,
          top: RING_THICK + 3, left: RING_THICK + 3,
          border: '2px solid rgba(253,224,71,0.30)',
        }}
      />

      {/* Inner content */}
      <div className="relative z-20 flex flex-col items-center justify-center select-none">
        <span
          className="font-black tabular-nums leading-none"
          style={{
            fontSize: 56,
            background: 'linear-gradient(135deg, #F97316, #FDE047)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {animatedStreak}
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mt-0.5">
          Day Streak
        </span>

        <AnimatePresence>
          {readToday && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 1.8, type: 'spring', stiffness: 500, damping: 18 }}
              className="mt-2 flex items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.38)' }}
            >
              <Check className="w-3 h-3" style={{ color: '#22C55E' }} strokeWidth={3} />
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
    <div className="w-full mt-4">
      <div className="flex justify-between items-center mb-2">
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
        style={{ height: 8, background: trackBg, border: trackBorder }}
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

      <p className="text-[13px] mt-2 text-center font-medium" style={{ color: labelColor }}>
        {motivational}
      </p>
    </div>
  );
}

// ── Sparkline ──────────────────────────────────────────────────────────────

function Sparkline({ color, delay = 0 }) {
  const heights = [4, 8, 5, 11, 7, 10, 12];
  const [animate, setAnimate] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setAnimate(true), delay * 1000); } },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="flex items-end gap-0.5 mt-3" style={{ height: 16 }}>
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          initial={{ height: 0 }}
          animate={{ height: animate ? h : 0 }}
          transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
          style={{ background: color }}
        />
      ))}
    </div>
  );
}

// ── Stat cards ─────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, fromColor, toColor, delay = 0 }) {
  const isDark = useIsDark();
  const bgFrom    = isDark ? `${fromColor}12` : `${fromColor}18`;
  const bgTo      = isDark ? `${fromColor}04` : `${fromColor}08`;
  const borderCol = isDark ? `${fromColor}18` : 'rgba(0,0,0,0.07)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileTap={{ scale: 0.97 }}
      className="flex-1 rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})`,
        border: `1px solid ${borderCol}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
      }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none rounded-bl-full"
        style={{ background: `radial-gradient(circle at top right, ${fromColor}16 0%, transparent 70%)` }} />

      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${fromColor}20`, border: `1.5px solid ${fromColor}30` }}
      >
        <Icon className="w-[18px] h-[18px]" style={{ color: fromColor }} />
      </div>

      <div className="text-[30px] font-black text-foreground tabular-nums leading-none">{value}</div>
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
      <Sparkline color={`linear-gradient(90deg, ${fromColor}, ${toColor})`} delay={delay + 0.3} />
    </motion.div>
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
      className="w-full rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(147,51,234,0.08), rgba(249,115,22,0.04))',
        border: '1px solid rgba(147,51,234,0.16)',
        minHeight: 64,
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
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
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

// ── Main ───────────────────────────────────────────────────────────────────

export default function ProgressHero({ currentStreak, records, todayLogs = [] }) {
  const readToday = todayLogs.length > 0;
  const tier = getTier(currentStreak);

  const animatedStreak    = useCountUp(currentStreak, 1500, 80);
  const animatedBestWeek  = useCountUp(records.bestRolling7, 1200, 300);
  const animatedBestMonth = useCountUp(records.bestMonth, 1200, 420);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      {/* Header with tier badge */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide"
          style={{
            background: `linear-gradient(135deg, ${tier.badgeFrom}, ${tier.badgeTo})`,
            color: tier.textColor,
            minHeight: 32,
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
        className="flex flex-col items-center mb-2"
      >
        <FireRing streak={currentStreak} animatedStreak={animatedStreak} readToday={readToday} />
        <MilestoneBar streak={currentStreak} tier={tier} />
      </motion.div>

      {/* Stat cards */}
      <div className="flex gap-3 mt-6 mb-3">
        <StatCard icon={Calendar}  label="Best Week"  value={animatedBestWeek}  fromColor="#22C55E" toColor="#86EFAC" delay={0.3} />
        <StatCard icon={BarChart2} label="Best Month" value={animatedBestMonth} fromColor="#6366F1" toColor="#818CF8" delay={0.42} />
      </div>

      <MostReadCard value={records.mostReadBook?.name} delay={0.54} />
    </motion.div>
  );
}