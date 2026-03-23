import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { useCurrentStreak } from '@/components/bible/hooks/useCurrentStreak';
import { computeBadgeState } from '@/components/badges/badgeEngine';
import { getAchievementIcon, getAchievementColor } from '@/components/badges/badgeIcons';
import { triggerHaptic } from '@/components/utils/haptics';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import {
  ChevronRight,
  Share2,
  UserPlus,
  Settings,
  Flame,
  BookOpen,
  CalendarDays,
  CalendarRange,
  Calendar,
  X,
} from 'lucide-react';

// ── Level System ─────────────────────────────────────────────────────────────
const LEVEL_THRESHOLDS = [0, 1, 10, 25, 50, 100, 200, 350, 500, 750, 1000, 1500, 2000];
function getLevel(chapters) {
  let level = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (chapters >= LEVEL_THRESHOLDS[i]) level = i;
    else break;
  }
  return level;
}
function getLevelProgress(chapters) {
  const level = getLevel(chapters);
  const current = LEVEL_THRESHOLDS[level] ?? 0;
  const next = LEVEL_THRESHOLDS[level + 1];
  if (!next) return { level, pct: 1, chaptersIntoLevel: chapters - current, chaptersNeeded: 0 };
  const pct = Math.min((chapters - current) / (next - current), 1);
  return { level, pct, chaptersIntoLevel: chapters - current, chaptersNeeded: next - chapters };
}

// ── Streak Ring ───────────────────────────────────────────────────────────────
const RING_R = 38;
const RING_CIRC = 2 * Math.PI * RING_R;
function StreakRing({ streak, children }) {
  const MAX = 30;
  const fill = Math.min(streak / MAX, 1);
  const dash = fill * RING_CIRC;
  return (
    <div className="relative" style={{ width: 88, height: 88 }}>
      <svg width={88} height={88} className="absolute inset-0 -rotate-90">
        <circle cx={44} cy={44} r={RING_R} fill="none" stroke="currentColor" strokeWidth={3} className="text-border" />
        {streak > 0 && (
          <circle
            cx={44} cy={44} r={RING_R} fill="none"
            stroke="rgb(251,146,60)"
            strokeWidth={3}
            strokeDasharray={`${dash} ${RING_CIRC}`}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// ── Tap-animated row ──────────────────────────────────────────────────────────
function TapRow({ children, onPress, className = '' }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => { triggerHaptic(); onPress(); }}
      className={`w-full text-left ${className}`}
    >
      {children}
    </motion.button>
  );
}

// ── Summary Row ───────────────────────────────────────────────────────────────
function SummaryRow({ icon: Icon, label, chapters, streak, onPress }) {
  return (
    <TapRow onPress={onPress} className="flex items-center justify-between px-4 py-3.5 bg-card border border-border/60 rounded-xl hover:bg-accent/30 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="text-muted-foreground" style={{ width: 18, height: 18 }} />
        <div>
          <span className="text-[15px] font-medium text-foreground block">{label}</span>
          <span className="text-[12px] text-muted-foreground">
            {chapters} chapter{chapters !== 1 ? 's' : ''}
            {streak > 0 ? ` · 🔥 ${streak}-day streak` : ''}
          </span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
    </TapRow>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title }) {
  return (
    <div className="mb-3 mt-7">
      <h2 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest">{title}</h2>
    </div>
  );
}

// ── Simple ProfileRow ─────────────────────────────────────────────────────────
function ProfileRow({ icon: Icon, label, onPress }) {
  return (
    <TapRow onPress={onPress} className="flex items-center justify-between px-4 py-3.5 bg-card border border-border/60 rounded-xl hover:bg-accent/30 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="text-muted-foreground" style={{ width: 18, height: 18 }} />
        <span className="text-[15px] font-medium text-foreground">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
    </TapRow>
  );
}

// ── Share Sheet ───────────────────────────────────────────────────────────────
function ShareSheet({ onClose, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full bg-card rounded-t-3xl p-6 pb-10 max-w-lg mx-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[17px] font-semibold text-foreground">Share My Progress</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-2">
          {[
            { icon: CalendarDays, label: 'This Week', mode: 'weekly' },
            { icon: CalendarRange, label: 'This Month', mode: 'monthly' },
            { icon: Calendar, label: 'This Year', mode: 'yearly' },
          ].map(({ icon: Icon, label, mode }) => (
            <TapRow key={mode} onPress={() => onSelect(mode)} className="flex items-center gap-3 px-4 py-3.5 bg-secondary rounded-xl hover:bg-accent/40 transition-colors">
              <Icon className="text-muted-foreground" style={{ width: 18, height: 18 }} />
              <span className="text-[15px] font-medium text-foreground">{label}</span>
            </TapRow>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    base44.auth.me()
      .then(u => { if (mounted) { setUser(u); setIsLoading(false); } })
      .catch(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const userId = user?.id;
  const { data: lifetimeLogs = [] } = useReadingLogsRange(userId, '2000-01-01', '2099-12-31');
  const currentStreak = useCurrentStreak(lifetimeLogs);

  // Date ranges
  const todayKey = getDateKey();
  const now = new Date();

  const weekStart = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    return getDateKey(d);
  }, []);

  const monthStart = useMemo(() => {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }, []);

  const yearStart = `${now.getFullYear()}-01-01`;

  // Chapter counts per period
  const weekChapters = useMemo(() => lifetimeLogs.filter(l => l.dateKey >= weekStart && l.dateKey <= todayKey).length, [lifetimeLogs, weekStart, todayKey]);
  const monthChapters = useMemo(() => lifetimeLogs.filter(l => l.dateKey >= monthStart && l.dateKey <= todayKey).length, [lifetimeLogs, monthStart, todayKey]);
  const yearChapters = useMemo(() => lifetimeLogs.filter(l => l.dateKey >= yearStart && l.dateKey <= todayKey).length, [lifetimeLogs, yearStart, todayKey]);

  // Level
  const totalChapters = lifetimeLogs.length;
  const { level, pct, chaptersNeeded } = getLevelProgress(totalChapters);

  // Badges
  const badgeState = useMemo(() => computeBadgeState(lifetimeLogs, user), [lifetimeLogs, user]);
  const earnedBadges = useMemo(() => badgeState.badges.filter(b => b.achieved), [badgeState]);
  const lastEarned = earnedBadges[earnedBadges.length - 1];
  const nextBadge = useMemo(() => badgeState.badges.find(b => !b.achieved), [badgeState]);

  const displayName = user?.displayName || user?.full_name || user?.email?.split('@')[0] || 'Friend';
  const initials = displayName.slice(0, 2).toUpperCase();

  const navigateToSummary = (mode) => {
    const params = mode === 'monthly'
      ? `?mode=monthly&year=${now.getFullYear()}&month=${now.getMonth() + 1}`
      : mode === 'weekly'
      ? `?mode=weekly`
      : `?mode=yearly&year=${now.getFullYear()}`;
    navigate(createPageUrl('ShareSummary') + params);
  };

  const handleInvite = async () => {
    const message = 'Join me on Bible Built — track what matters. 📖';
    const url = window.location.origin;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Bible Built', text: message, url });
      } else {
        await navigator.clipboard?.writeText(`${message} ${url}`);
      }
    } catch (e) { /* iframe — ignore */ }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const nextBadgePct = nextBadge && nextBadge.target > 0
    ? Math.min(nextBadge.current / nextBadge.target, 1)
    : 0;

  const lastEarnedColor = lastEarned ? getAchievementColor(lastEarned.title) : null;
  const isBlackWhite = lastEarnedColor === 'BLACK_WHITE';

  return (
    <>
      <div className="min-h-screen bg-background pb-32">
        <div className="max-w-2xl mx-auto px-5 pt-4 pb-8">

          {/* ── Profile Card ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="relative overflow-hidden rounded-3xl p-6 mb-2"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--secondary)) 100%)',
              border: '1px solid hsl(var(--border))',
            }}
          >
            {/* Decorative blur orb */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-orange-400/10 blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center pt-2 pb-1">
              {/* Avatar with streak ring */}
              <StreakRing streak={currentStreak}>
                <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground">{initials}</span>
                </div>
              </StreakRing>

              <h1 className="text-[22px] font-bold text-foreground mt-3 mb-0.5">{displayName}</h1>

              {/* Level */}
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Level {level}</span>
                {chaptersNeeded > 0 && (
                  <span className="text-[11px] text-muted-foreground/60">· {chaptersNeeded} ch to next</span>
                )}
              </div>

              {/* Level Progress Bar */}
              <div className="w-full max-w-[180px] h-1.5 bg-border rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="h-full bg-orange-400 rounded-full"
                />
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-[20px] font-bold text-foreground">{currentStreak}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Day Streak</span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="text-[20px] font-bold text-foreground">{totalChapters}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Chapters</span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[20px] font-bold text-foreground">{earnedBadges.length}</span>
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Badges</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08 }}
          >

            {/* ── Progress Summaries ── */}
            <SectionHeader title="Progress" />
            <div className="space-y-2">
              <SummaryRow icon={CalendarDays} label="This Week" chapters={weekChapters} streak={currentStreak} onPress={() => navigateToSummary('weekly')} />
              <SummaryRow icon={CalendarRange} label="This Month" chapters={monthChapters} streak={0} onPress={() => navigateToSummary('monthly')} />
              <SummaryRow icon={Calendar} label="This Year" chapters={yearChapters} streak={0} onPress={() => navigateToSummary('yearly')} />
            </div>

            {/* ── Badges Preview ── */}
            <SectionHeader title="Badges" />
            <TapRow
              onPress={() => {
                navigate('/stats');
                setTimeout(() => {
                  const el = document.getElementById('badges-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 400);
              }}
              className="w-full px-4 py-3.5 bg-card border border-border/60 rounded-xl hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {lastEarned ? (
                    <div className={`w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 ${isBlackWhite ? 'bg-gray-900' : `bg-gradient-to-br ${lastEarnedColor}`}`}>
                      {getAchievementIcon(lastEarned.title, true, 'default')}
                    </div>
                  ) : (
                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary flex-shrink-0">
                      <span className="text-lg">🏅</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[15px] font-medium text-foreground block">
                      {lastEarned ? lastEarned.title : 'No badges yet'}
                    </span>
                    {nextBadge && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-400 rounded-full transition-all"
                            style={{ width: `${nextBadgePct * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {nextBadge.current}/{nextBadge.target} → {nextBadge.title}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
              </div>
            </TapRow>

            {/* ── Share My Progress ── */}
            <SectionHeader title="Share" />
            <TapRow
              onPress={() => setShowShareSheet(true)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-card border border-border/60 rounded-xl hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Share2 className="text-muted-foreground" style={{ width: 18, height: 18 }} />
                <span className="text-[15px] font-medium text-foreground">Share My Progress</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            </TapRow>

            {/* ── Grow Together ── */}
            <SectionHeader title="Community" />
            <div className="space-y-2">
              <ProfileRow icon={UserPlus} label="Invite a Friend" onPress={handleInvite} />
            </div>

            {/* ── Settings ── */}
            <SectionHeader title="Settings" />
            <div className="space-y-2">
              <ProfileRow icon={Settings} label="Preferences" onPress={() => navigate('/settings')} />
            </div>

          </motion.div>
        </div>
      </div>

      {/* ── Share Sheet ── */}
      <AnimatePresence>
        {showShareSheet && (
          <ShareSheet
            onClose={() => setShowShareSheet(false)}
            onSelect={(mode) => {
              setShowShareSheet(false);
              navigateToSummary(mode);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}