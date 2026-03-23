import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { useCurrentStreak } from '@/components/bible/hooks/useCurrentStreak';
import {
  ChevronRight,
  Share2,
  UserPlus,
  Award,
  Settings,
  CalendarDays,
  CalendarRange,
  Calendar,
  Flame,
  BookOpen,
} from 'lucide-react';

function ProfileRow({ icon: Icon, label, onPress }) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center justify-between px-4 py-3.5 bg-card border border-border/60 rounded-xl hover:bg-accent/40 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4.5 h-4.5 text-muted-foreground" style={{ width: 18, height: 18 }} />
        <span className="text-[15px] font-medium text-foreground">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
    </button>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-3 mt-7">
      <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest">{title}</h2>
      {subtitle && <p className="text-[12px] text-muted-foreground/60 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

  const displayName = user?.displayName || user?.full_name || user?.email?.split('@')[0] || 'Friend';
  const initials = displayName.slice(0, 2).toUpperCase();

  const navigateToSummary = (mode) => {
    const now = new Date();
    let params;
    if (mode === 'monthly') {
      params = `?mode=monthly&year=${now.getFullYear()}&month=${now.getMonth() + 1}`;
    } else if (mode === 'weekly') {
      params = `?mode=weekly`;
    } else {
      params = `?mode=yearly&year=${now.getFullYear()}`;
    }
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
    } catch (e) {
      // Share not available (e.g. iframe) — silently ignore
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-2xl mx-auto px-5 pt-6 pb-8">

        {/* Identity */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center pt-4 pb-6"
        >
          <div className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-foreground">{initials}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Tracking what matters.</p>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 mt-5">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xl font-bold text-foreground">{currentStreak}</span>
              </div>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Day Streak</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="text-xl font-bold text-foreground">{lifetimeLogs.length}</span>
              </div>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Chapters</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >

          {/* Share Your Progress */}
          <SectionHeader title="Share Your Progress" subtitle="Encourage others. Stay accountable." />
          <div className="space-y-2">
            <ProfileRow icon={CalendarDays} label="Weekly Summary" onPress={() => navigateToSummary('weekly')} />
            <ProfileRow icon={CalendarRange} label="Monthly Summary" onPress={() => navigateToSummary('monthly')} />
            <ProfileRow icon={Calendar} label="Yearly Summary" onPress={() => navigateToSummary('yearly')} />
          </div>

          {/* Grow Together */}
          <SectionHeader title="Grow Together" />
          <div className="space-y-2">
            <ProfileRow icon={UserPlus} label="Invite a Friend" onPress={handleInvite} />
          </div>

          {/* Your Progress */}
          <SectionHeader title="Your Progress" />
          <div className="space-y-2">
            <ProfileRow icon={Award} label="Badges" onPress={() => navigate('/stats')} />
          </div>

          {/* Settings */}
          <SectionHeader title="Settings" />
          <div className="space-y-2">
            <ProfileRow icon={Settings} label="Preferences" onPress={() => navigate('/settings')} />
          </div>

        </motion.div>
      </div>
    </div>
  );
}