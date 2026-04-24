import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Flame, BookOpen, Zap, Gem, Star, Trophy, Lock, UserMinus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { computeBadgeState } from '@/components/badges/badgeEngine';
import { artifacts as artifactCatalog, ARTIFACT_RARITY_COLORS, ARTIFACT_RARITY_LABELS } from '@/data/artifactCatalog';
import { AvatarDisplay } from '@/components/profile/AvatarPicker';
import { toast } from 'sonner';

function calcStreakFromLogs(logs, userId, graceMap) {
  const userLogs = logs.filter(l => l.userId === userId);
  const daySet = new Set(userLogs.map(l => l.dateKey));
  if (daySet.size === 0) return 0;
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const mKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const graceUsed = {};
  (graceMap[userId] ?? []).forEach(r => { graceUsed[r.monthKey] = r.graceDaysUsed ?? 0; });
  const graceConsumed = {};
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let streak = 0;
  const cursor = new Date(today);
  for (let i = 0; i < 730; i++) {
    const key = fmt(cursor);
    if (daySet.has(key)) {
      streak++;
    } else {
      const mk = mKey(cursor);
      const used = (graceUsed[mk] ?? 0) + (graceConsumed[mk] ?? 0);
      if (used < 2) {
        graceConsumed[mk] = (graceConsumed[mk] ?? 0) + 1;
      } else {
        if (i <= 1) { cursor.setDate(cursor.getDate() - 1); continue; }
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function StatCard({ label, value, unit, icon: Icon, gradient }) {
  return (
    <div className={`rounded-2xl p-4 text-white shadow-lg ${gradient}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</span>
        <Icon className="w-4 h-4 opacity-70" />
      </div>
      <div className="text-4xl font-black leading-none">{value}</div>
      <div className="text-xs opacity-70 mt-1">{unit}</div>
    </div>
  );
}

function BadgePill({ badge }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium ${
      badge.achieved
        ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300'
        : 'bg-muted border-border text-muted-foreground opacity-50'
    }`}>
      {badge.achieved
        ? <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        : <Lock className="w-3.5 h-3.5 shrink-0" />
      }
      <span className="truncate">{badge.title}</span>
    </div>
  );
}

function ArtifactChip({ artifact }) {
  const rarity = artifact.rarity;
  const color = ARTIFACT_RARITY_COLORS[rarity] || '#888';
  const label = ARTIFACT_RARITY_LABELS[rarity] || rarity;
  const emoji = rarity === 'legendary' ? '🏆' : rarity === 'epic' ? '💎' : rarity === 'rare' ? '⭐' : '🔸';
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-card text-sm">
      <span className="text-lg">{emoji}</span>
      <div className="min-w-0">
        <p className="font-semibold text-foreground text-xs truncate">{artifact.name}</p>
        <p className="text-[10px]" style={{ color }}>{label}</p>
      </div>
    </div>
  );
}

export default function UserDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const params = new URLSearchParams(location.search);
  const userId = params.get('id');
  const groupId = params.get('groupId');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  const { data: targetUser, isLoading: loadingUser } = useQuery({
    queryKey: ['userDetail', userId],
    queryFn: async () => {
      const res = await base44.functions.invoke('getUsersByIds', { ids: [userId] });
      return res.data?.users?.[0] || null;
    },
    enabled: !!userId,
    staleTime: 60000,
  });

  const { data: readingLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['userLogs', userId],
    queryFn: () => base44.entities.ReadingLog.filter({ 'data.userId': userId }, '-created_date', 2000),
    enabled: !!userId,
  });

  const { data: graceDayRecords = {}, isLoading: loadingGrace } = useQuery({
    queryKey: ['userGraceDays', userId],
    queryFn: async () => {
      const res = await base44.functions.invoke('getGraceDaysByIds', { ids: [userId] });
      const map = {};
      (res.data?.graceDays ?? []).forEach(g => {
        if (!map[g.userId]) map[g.userId] = [];
        map[g.userId].push(g);
      });
      return map;
    },
    enabled: !!userId,
  });

  const { data: ownerGroup } = useQuery({
    queryKey: ['groupOwnerCheck', groupId, currentUser?.id],
    queryFn: async () => {
      const groups = await base44.entities.Group.filter({ ownerId: currentUser?.id });
      return groups.find(g => g.id === groupId) ?? null;
    },
    enabled: !!groupId && !!currentUser?.id,
    staleTime: 60000,
  });

  const isGroupOwner = ownerGroup?.ownerId === currentUser?.id;

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await base44.functions.invoke('removeFromGroup', { groupId, memberIdToRemove: userId });
      toast.success(`${name} removed from group`);
      navigate(-1);
    } catch {
      toast.error('Could not remove member');
      setRemoving(false);
      setConfirmRemove(false);
    }
  };

  const { data: ownerships = [], isLoading: loadingArtifacts } = useQuery({
    queryKey: ['userArtifacts', userId],
    queryFn: () => base44.entities.ArtifactOwnership.filter({ 'data.userId': userId }),
    enabled: !!userId,
  });

  const { data: userWallet } = useQuery({
    queryKey: ['userWallet', userId],
    queryFn: () => base44.entities.UserWallet.filter({ 'data.userId': userId }),
    enabled: !!userId,
  });

  const isLoading = loadingUser || loadingLogs || loadingGrace;

  const totalChapters = readingLogs.length;
  const xp = userWallet?.[0]?.xpBalance ?? userWallet?.[0]?.spendableXp ?? 0;
  const streak = readingLogs.length > 0 ? calcStreakFromLogs(readingLogs, userId, graceDayRecords) : 0;

  const now = new Date();
  const sundayDate = new Date(now);
  sundayDate.setHours(0, 0, 0, 0);
  sundayDate.setDate(now.getDate() - now.getDay());
  const weekKey = sundayDate.toISOString().split('T')[0];
  const todayKey = now.toISOString().split('T')[0];
  const weekChapters = readingLogs.filter(l => l.dateKey >= weekKey && l.dateKey <= todayKey).length;

  const { badges } = computeBadgeState(readingLogs, targetUser);
  const earnedBadges = badges.filter(b => b.achieved);
  const unearnedBadges = badges.filter(b => !b.achieved).slice(0, 6);

  const ownedArtifacts = ownerships
    .map(o => ({ ownership: o, artifact: artifactCatalog.find(a => a.artifactId === o.artifactId) }))
    .filter(({ artifact }) => !!artifact)
    .sort((a, b) => {
      const order = ['legendary', 'epic', 'rare', 'common'];
      return order.indexOf(a.artifact.rarity) - order.indexOf(b.artifact.rarity);
    });

  const name = targetUser?.full_name || targetUser?.email?.split('@')[0] || 'Builder';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isMe = currentUser?.id === userId;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {confirmRemove && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <p className="text-base font-semibold text-foreground mb-1">Remove member?</p>
            <p className="text-sm text-muted-foreground mb-5">
              {name} will be removed from the group.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRemove(false)}
                className="flex-1 h-10 rounded-xl text-sm bg-muted text-muted-foreground font-semibold">
                Cancel
              </button>
              <button onClick={handleRemove} disabled={removing}
                className="flex-1 h-10 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: '#EF4444' }}>
                {removing ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-10 px-5" style={{ paddingTop: 'max(4rem, calc(env(safe-area-inset-top, 0px) + 1rem))' }}>
        <button onClick={() => navigate(-1)}
          style={{ top: 'max(4rem, calc(env(safe-area-inset-top, 0px) + 1rem))' }}
          className="absolute left-4 h-9 w-9 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center pt-4">
          <div className="mb-3 ring-4 ring-white/20 rounded-full">
            <AvatarDisplay initials={initials} avatarData={targetUser} size={96} />
          </div>
          <h1 className="text-2xl font-black text-white">{name}</h1>
          {isMe && <span className="mt-1 text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">That's you!</span>}
          {!isMe && isGroupOwner && (
            <button
              onClick={() => setConfirmRemove(true)}
              className="mt-3 flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-white/10 text-white/70 hover:bg-red-500/30 hover:text-red-300 transition-colors"
            >
              <UserMinus className="w-3.5 h-3.5" /> Remove from group
            </button>
          )}
          <div className="flex gap-6 mt-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">{streak}</span>
              <span className="text-xs text-white/60">day streak</span>
            </div>
            <div className="w-px bg-white/10 self-stretch" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">{totalChapters.toLocaleString()}</span>
              <span className="text-xs text-white/60">chapters</span>
            </div>
            <div className="w-px bg-white/10 self-stretch" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">{earnedBadges.length}</span>
              <span className="text-xs text-white/60">badges</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-5 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Streak" value={streak} unit="days in a row 🔥" icon={Flame} gradient="bg-gradient-to-br from-orange-400 to-red-500" />
          <StatCard label="This Week" value={weekChapters} unit="chapters read 📖" icon={BookOpen} gradient="bg-gradient-to-br from-blue-500 to-violet-600" />
          <StatCard label="Total Chapters" value={totalChapters.toLocaleString()} unit="all time" icon={Star} gradient="bg-gradient-to-br from-emerald-400 to-teal-600" />
          <StatCard label="XP Earned" value={xp.toLocaleString()} unit="experience points ⚡" icon={Zap} gradient="bg-gradient-to-br from-amber-400 to-yellow-500" />
        </div>

        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-amber-500" />
            Badges
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold">
              {earnedBadges.length}/{badges.length}
            </span>
          </h2>
          {earnedBadges.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card py-6 flex flex-col items-center gap-1">
              <Trophy className="w-6 h-6 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No badges earned yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {earnedBadges.map(b => <BadgePill key={b.id} badge={b} />)}
              {unearnedBadges.map(b => <BadgePill key={b.id} badge={b} />)}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
            <Gem className="w-4 h-4 text-teal-500" />
            Treasury
            <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-semibold">
              {ownedArtifacts.length} artifacts
            </span>
          </h2>
          {loadingArtifacts ? (
            <div className="h-16 rounded-2xl bg-muted animate-pulse" />
          ) : ownedArtifacts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card py-6 flex flex-col items-center gap-1">
              <Gem className="w-6 h-6 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No artifacts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {ownedArtifacts.map(({ artifact, ownership }) => (
                <ArtifactChip key={ownership.id} artifact={artifact} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}