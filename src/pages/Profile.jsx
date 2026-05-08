import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import AuthRecoveryScreen from '@/components/auth/AuthRecoveryScreen';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { useStreakWithGrace } from '@/components/bible/hooks/useStreakWithGrace';
import { computeBadgeState } from '@/components/badges/badgeEngine';
import { getAchievementIcon, getAchievementColor } from '@/components/badges/badgeIcons';
import { triggerHaptic } from '@/components/utils/haptics';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import AvatarPicker from '@/components/profile/AvatarPicker';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Share2, UserPlus, Settings,
  Flame, BookOpen, CalendarDays, CalendarRange, Calendar, X, Users, Zap,
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

// ── Streak Ring ───────────────────────────────────────────────────────────────
const RING_R = 42;
const RING_CIRC = 2 * Math.PI * RING_R;
function StreakRing({ streak, children }) {
  const fill = Math.min(streak / 30, 1);
  const dash = fill * RING_CIRC;
  return (
    <div className="relative" style={{ width: 104, height: 104 }}>
      <svg width={104} height={104} className="absolute inset-0 -rotate-90">
        <circle cx={52} cy={52} r={RING_R} fill="none" stroke="currentColor" strokeWidth={3} className="text-border" />
        {streak > 0 && (
          <circle cx={52} cy={52} r={RING_R} fill="none"
            stroke="rgb(251,146,60)" strokeWidth={3}
            strokeDasharray={`${dash} ${RING_CIRC}`} strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

// ── Tap-animated row ──────────────────────────────────────────────────────────
function TapRow({ children, onPress, className = '' }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }}
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end" onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full bg-card rounded-t-3xl p-6 max-w-lg mx-auto"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 96px)' }}
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
            <TapRow key={mode} onPress={() => onSelect(mode)}
              className="flex items-center gap-3 px-4 py-3.5 bg-secondary rounded-xl hover:bg-accent/40 transition-colors"
            >
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
  const { user, isLoadingAuth, retryAuth, logout } = useAuth();
  const { totalXp } = useWallet();
  const [avatarData, setAvatarData] = useState(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const navigate = useNavigate();

  // Sync avatarData from user whenever user loads
  const prevUserId = React.useRef(null);
  React.useEffect(() => {
    if (user && user.id !== prevUserId.current) {
      prevUserId.current = user.id;
      setAvatarData({
        avatarType: user?.avatarType,
        avatarPhotoUrl: user?.avatarPhotoUrl,
        avatarEmoji: user?.avatarEmoji,
        avatarDefaultId: user?.avatarDefaultId,
      });
    }
  }, [user]);

  const userId = user?.id;
  const { data: lifetimeLogs = [] } = useReadingLogsRange(userId, '2000-01-01', '2099-12-31');
  const { currentStreak } = useStreakWithGrace(lifetimeLogs, userId);
  const now = new Date();
  const todayKey = getDateKey();

  const weekStart = useMemo(() => {
    const d = new Date(now); d.setDate(d.getDate() - d.getDay()); return getDateKey(d);
  }, []);
  const monthStart = useMemo(() => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`, []);
  const yearStart = `${now.getFullYear()}-01-01`;

  const weekChapters = useMemo(() => lifetimeLogs.filter(l => l.dateKey >= weekStart && l.dateKey <= todayKey).length, [lifetimeLogs, weekStart, todayKey]);
  const monthChapters = useMemo(() => lifetimeLogs.filter(l => l.dateKey >= monthStart && l.dateKey <= todayKey).length, [lifetimeLogs, monthStart, todayKey]);
  const yearChapters = useMemo(() => lifetimeLogs.filter(l => l.dateKey >= yearStart && l.dateKey <= todayKey).length, [lifetimeLogs, yearStart, todayKey]);
  const totalChapters = lifetimeLogs.length;

  const badgeState = useMemo(() => computeBadgeState(lifetimeLogs, user), [lifetimeLogs, user]);
  const earnedBadges = useMemo(() => badgeState.badges.filter(b => b.achieved), [badgeState]);
  const lastEarned = earnedBadges[earnedBadges.length - 1];
  const nextBadge = useMemo(() => badgeState.badges.find(b => !b.achieved), [badgeState]);

  const displayName = user?.displayName || user?.full_name || user?.email?.split('@')[0] || '';
  const nameParts = displayName.trim().split(/\s+/);
  const initials = nameParts.length >= 2
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : displayName.slice(0, 2).toUpperCase();

  const navigateToSummary = (mode) => {
    const params = mode === 'monthly'
      ? `?mode=monthly&year=${now.getFullYear()}&month=${now.getMonth() + 1}`
      : mode === 'weekly' ? `?mode=weekly`
      : `?mode=yearly&year=${now.getFullYear()}`;
    navigate(createPageUrl('ShareSummary') + params);
  };

  const handleInvite = async () => {
    const message = 'Join me on Bible Built — track what matters. 📖';
    const url = 'https://apps.apple.com/us/app/bible-built/id6757266415';
    try {
      if (navigator.share) await navigator.share({ title: 'Bible Built', text: message, url });
      else await navigator.clipboard?.writeText(`${message} ${url}`);
    } catch (e) { /* iframe — ignore */ }
  };

  if (isLoadingAuth) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );

  if (!user) {
    console.warn('[Profile] user missing after auth resolved');
    return <AuthRecoveryScreen errorType="session_missing" onRetry={retryAuth} onLogout={() => logout(true)} />;
  }

  const nextBadgePct = nextBadge && nextBadge.target > 0 ? Math.min(nextBadge.current / nextBadge.target, 1) : 0;
  const lastEarnedColor = lastEarned ? getAchievementColor(lastEarned.title) : null;
  const isBlackWhite = lastEarnedColor === 'BLACK_WHITE';

  return (
    <>
      <div className="min-h-screen bg-background pb-32">
        <div className="max-w-2xl mx-auto px-5 pt-[max(4rem,env(safe-area-inset-top))] pb-8">

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
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-orange-400/10 blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center pt-2 pb-2">
              <AvatarPicker
                initials={initials}
                avatarData={avatarData}
                onUpdate={(data) => setAvatarData(prev => ({ ...prev, ...data }))}
              />

              <h1 className="text-[22px] font-bold text-foreground mt-3 mb-2">{displayName}</h1>

              {/* Streak pill */}
              <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full mb-5" style={{ background: 'rgba(251,146,60,0.12)' }}>
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[13px] font-semibold text-orange-400">{currentStreak}-day streak</span>
              </div>

              {/* Stats row */}
              <div className="flex items-stretch gap-3 w-full">
                <div className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-2xl" style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border)/0.5)' }}>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[22px] font-bold text-foreground">{totalChapters}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Chapters</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-2xl" style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border)/0.5)' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[18px]">🏅</span>
                    <span className="text-[22px] font-bold text-foreground">{earnedBadges.length}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Badges</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { triggerHaptic(); navigate('/treasury'); }}
                  className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-2xl"
                  style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border)/0.5)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-[22px] font-bold text-foreground">{totalXp.toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">XP Wallet ›</span>
                </motion.button>
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
              onPress={() => navigate('/stats#badges-section')}
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
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${nextBadgePct * 100}%` }} />
                        </div>
                        <span className="text-[11px] text-muted-foreground">{nextBadge.current}/{nextBadge.target} → {nextBadge.title}</span>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
              </div>
            </TapRow>

            {/* ── Accountability ── */}
            <SectionHeader title="Accountability" />
            <div className="space-y-2">
              <TapRow onPress={() => setShowShareSheet(true)}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-card border border-border/60 rounded-xl hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Share2 className="text-muted-foreground" style={{ width: 18, height: 18 }} />
                  <span className="text-[15px] font-medium text-foreground">Share My Progress</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </TapRow>
              <Link
                to={createPageUrl('accountability')}
                className="flex items-center justify-between px-4 py-3.5 bg-card border border-border/60 rounded-xl hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="text-muted-foreground" style={{ width: 18, height: 18 }} />
                  <span className="text-[15px] font-medium text-foreground">Accountability</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </Link>
            </div>

            {/* ── Community ── */}
            <SectionHeader title="Community" />
            <div className="space-y-2">
              <ProfileRow icon={Users} label="Friends &amp; Groups" onPress={() => navigate('/social')} />
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

      <AnimatePresence>
        {showShareSheet && (
          <ShareSheet
            onClose={() => setShowShareSheet(false)}
            onSelect={(mode) => { setShowShareSheet(false); navigateToSummary(mode); }}
          />
        )}
        {selectedBadge && (() => {
          const color = getAchievementColor(selectedBadge.title);
          const isBlack = color === 'BLACK_WHITE';
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-6"
              onClick={() => setSelectedBadge(null)}
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                className="relative bg-card border border-border rounded-3xl p-8 max-w-xs w-full flex flex-col items-center gap-4"
                onClick={e => e.stopPropagation()}
              >
                <div className={`w-16 h-16 flex items-center justify-center rounded-full ${isBlack ? 'bg-gray-900' : `bg-gradient-to-br ${color}`}`}
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
                  {getAchievementIcon(selectedBadge.title, true, 'default')}
                </div>
                <div className="text-center">
                  <h3 className="text-[18px] font-bold text-foreground mb-1">{selectedBadge.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedBadge.description || 'Achievement unlocked'}</p>
                </div>
                <button onClick={() => setSelectedBadge(null)}
                  className="mt-2 px-6 py-2 rounded-full bg-secondary text-[14px] font-medium text-foreground">
                  Done
                </button>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
}