import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Check, Flame, BookOpen, Zap, HandHeart, Target, UserPlus, Share2, Hand, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { triggerHaptic } from '@/components/utils/haptics';
import { toast } from 'sonner';
import { AvatarDisplay } from '@/components/profile/AvatarPicker';

function timeAgo(isoString) {
  const diff = (Date.now() - new Date(isoString)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function calcStreakWithGrace(logs, userId, graceDayRecords) {
  const userLogs = logs.filter(l => l.userId === userId);
  const daySet = new Set(userLogs.map(l => l.dateKey));
  if (daySet.size === 0) return 0;
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const monthKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const graceUsed = {};
  (graceDayRecords[userId] ?? []).forEach(r => { graceUsed[r.monthKey] = r.graceDaysUsed ?? 0; });
  const graceConsumed = {};
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let streak = 0;
  const cursor = new Date(today);
  for (let i = 0; i < 730; i++) {
    const key = fmt(cursor);
    if (daySet.has(key)) {
      streak++;
    } else {
      const mk = monthKey(cursor);
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

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="w-7 text-center text-sm font-bold text-muted-foreground">{rank}</span>;
}

function LeaderRow({ rank, member, stat, unit, isMe, onEncourage, encouraged, onViewProfile }) {
  const name = member.full_name ?? member.displayName ?? 'Unknown';
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors ${isMe ? 'bg-primary/5' : ''}`}>
      <div className="w-7 flex items-center justify-center shrink-0">
        <RankBadge rank={rank} />
      </div>
      <button onClick={onViewProfile} className="flex items-center gap-2 flex-1 min-w-0 text-left">
        <AvatarDisplay initials={name[0].toUpperCase()} avatarData={member} size={36} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isMe ? 'text-primary' : 'text-foreground'}`}>
            {name} {isMe && <span className="text-xs font-normal text-muted-foreground">(you)</span>}
          </p>
          <p className="text-xs text-muted-foreground">{stat} {unit}</p>
        </div>
      </button>
      {!isMe && (
        <button
          onClick={() => onEncourage(member)}
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${encouraged ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted hover:bg-muted/80'}`}
          title={`Encourage ${name}`}
        >
          <HandHeart className={`w-4 h-4 ${encouraged ? 'text-green-600' : 'text-muted-foreground'}`} />
        </button>
      )}
    </div>
  );
}

export default function GroupDetail() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const groupId = params.get('id');
  const groupName = params.get('name') ?? 'Group';
  const shouldAutoJoin = params.get('join') === 'true';

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [feedLogs, setFeedLogs] = useState([]);
  const [feedUsers, setFeedUsers] = useState({});
  const [tab, setTab] = useState('xp');
  const [copied, setCopied] = useState(false);
  const [encouraged, setEncouraged] = useState({});
  const [loading, setLoading] = useState(true);
  const [graceDayRecords, setGraceDayRecords] = useState({});
  const [friends, setFriends] = useState([]);
  const [showInviteFriends, setShowInviteFriends] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');
  const [invitedFriends, setInvitedFriends] = useState({});
  const [confirmRemove, setConfirmRemove] = useState(null); // member object to remove
  const [highFivedLogs, setHighFivedLogs] = useState({});

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    const groups = await base44.entities.Group.filter({ id: groupId });
    const grp = groups[0];
    if (!grp) { setLoading(false); return; }
    setGroup(grp);
    const memberIds = grp.memberIds ?? [];
    if (memberIds.length === 0) { setLoading(false); return; }
    const usersRes = await base44.functions.invoke('getUsersByIds', { ids: memberIds });
    const grpMembers = usersRes.data?.users ?? [];
    setMembers(grpMembers);
    const uMap = {};
    grpMembers.forEach(u => { uMap[u.id] = u; });
    const logsByMember = await Promise.all(
      memberIds.map(id => base44.entities.ReadingLog.filter({ userId: id }, '-created_date', 1000))
    );
    const memberLogs = logsByMember.flat();
    setAllLogs(memberLogs);
    const graceRes = await base44.functions.invoke('getGraceDaysByIds', { ids: memberIds });
    const graceMap = {};
    (graceRes.data?.graceDays ?? []).forEach(g => {
      if (!graceMap[g.userId]) graceMap[g.userId] = [];
      graceMap[g.userId].push(g);
    });
    setGraceDayRecords(graceMap);
    // Sort ALL member logs by date descending so we see everyone's activity
    const sortedLogs = [...memberLogs].sort((a, b) =>
      new Date(b.created_date ?? b.timestamp) - new Date(a.created_date ?? a.timestamp)
    );
    setFeedLogs(sortedLogs.slice(0, 40));
    setFeedUsers(uMap);
    setLoading(false);
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!shouldAutoJoin || !groupId || !user?.id || !group) return;
    const alreadyMember = (group.memberIds ?? []).includes(user.id);
    if (alreadyMember) return;
    base44.functions.invoke('joinGroup', { groupId }).then(() => {
      updateUser({ groupIds: [...(user.groupIds ?? []), groupId] });
      toast.success('You joined the group!');
      load();
    });
  }, [shouldAutoJoin, groupId, user?.id, group]);

  const loadFriends = useCallback(async () => {
    if (!user?.id) return;
    const [sent, received] = await Promise.all([
      base44.entities.Friendship.filter({ user1Id: user.id, status: 'accepted' }),
      base44.entities.Friendship.filter({ user2Id: user.id, status: 'accepted' }),
    ]);
    const friendIds = [...sent, ...received].map(f => f.user1Id === user.id ? f.user2Id : f.user1Id);
    if (friendIds.length === 0) { setFriends([]); return; }
    const res = await base44.functions.invoke('getUsersByIds', { ids: friendIds });
    setFriends(res.data?.users ?? []);
  }, [user?.id]);

  const withStats = members.map(m => {
    const now = new Date(); now.setHours(0,0,0,0); now.setDate(now.getDate() - now.getDay());
    const weekKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const t = new Date();
    const todayKey = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
    const weekLogs = allLogs.filter(l => l.userId === m.id && l.dateKey >= weekKey && l.dateKey <= todayKey);
    const streak = m.streak ?? calcStreakWithGrace(allLogs, m.id, graceDayRecords);
    const xp = m.xp ?? 0;
    return { member: m, weekChapters: weekLogs.length, streak, xp };
  });

  const leaderboards = {
    xp: [...withStats].sort((a, b) => b.xp - a.xp),
    streak: [...withStats].sort((a, b) => b.streak - a.streak),
    chapters: [...withStats].sort((a, b) => b.weekChapters - a.weekChapters),
  };

  const tabConfig = {
    xp: { label: 'XP', icon: Zap, stat: r => r.xp.toLocaleString(), unit: () => 'XP' },
    streak: { label: 'Streak', icon: Flame, stat: r => r.streak, unit: r => r.streak === 1 ? 'day' : 'days' },
    chapters: { label: 'Chapters', icon: BookOpen, stat: r => r.weekChapters, unit: () => 'this week' },
  };

  const inviteLink = `${window.location.origin}/group-detail?id=${groupId}&join=true`;

  const shareInvite = async () => {
    const shareData = {
      title: `Join "${group?.name ?? groupName}" on BibleBuilt`,
      text: `Come read the Bible with me in our group "${group?.name ?? groupName}"!`,
      url: inviteLink,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Invite link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInviteFriend = async (friend) => {
    const senderName = user?.full_name ?? user?.displayName ?? 'Someone';
    const groupLabel = group?.name ?? groupName;
    await base44.entities.Notification.create({
      userId: friend.id, type: 'group_invite',
      message: `${senderName} invited you to join the group "${groupLabel}"!`,
      relatedId: groupId, isRead: false, createdAt: new Date().toISOString(),
    });
    setInvitedFriends(prev => ({ ...prev, [friend.id]: true }));
    toast.success(`Invite sent to ${friend.full_name ?? friend.displayName ?? 'friend'}!`);
  };

  const handleRemoveMember = async (member) => {
    try {
      await base44.functions.invoke('removeFromGroup', { groupId, memberIdToRemove: member.id });
      toast.success(`${member.full_name ?? member.displayName ?? 'Member'} removed`);
      setConfirmRemove(null);
      load();
    } catch (err) {
      toast.error('Could not remove member');
    }
  };

  const isOwner = group?.ownerId === user?.id;

  const handleEncourage = async (member) => {
    triggerHaptic();
    setEncouraged(prev => ({ ...prev, [member.id]: true }));
    await base44.functions.invoke('sendNudge', { receiverId: member.id });
    toast('🙏 Encouragement sent!', { duration: 1500 });
  };

  const handleHighFive = async (log) => {
    if (highFivedLogs[log.id] || log.userId === user?.id) return;
    triggerHaptic();
    setHighFivedLogs(prev => ({ ...prev, [log.id]: true }));
    try {
      await base44.functions.invoke('sendHighFive', {
        receiverId: log.userId,
        book: log.book,
        chapter: log.chapter,
      });
      toast('🙌 High five sent!', { duration: 1200 });
    } catch {
      setHighFivedLogs(prev => ({ ...prev, [log.id]: false }));
      toast.error('Could not send high five');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-7 h-7 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  const rows = leaderboards[tab];
  const cfg = tabConfig[tab];

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Remove member confirm dialog */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <p className="text-base font-semibold text-foreground mb-1">Remove member?</p>
            <p className="text-sm text-muted-foreground mb-5">
              {confirmRemove.full_name ?? confirmRemove.displayName ?? 'This member'} will be removed from the group.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRemove(null)}
                className="flex-1 h-10 rounded-xl text-sm bg-muted text-muted-foreground font-semibold">
                Cancel
              </button>
              <button onClick={() => handleRemoveMember(confirmRemove)}
                className="flex-1 h-10 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#EF4444' }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-lg mx-auto px-5 pt-[max(4rem,env(safe-area-inset-top))]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{group?.name ?? groupName}</h1>
            <p className="text-xs text-muted-foreground">👥 {members.length} members</p>
          </div>
          <button
            onClick={() => { if (!showInviteFriends) loadFriends(); setShowInviteFriends(p => !p); }}
            className="h-8 w-8 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-colors shrink-0"
            title="Add Friends"
          >
            <UserPlus className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={shareInvite}
            className="h-8 w-8 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-colors shrink-0"
            title="Share Invite"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>

        {/* Invite Friends Panel */}
        {showInviteFriends && (
          <div className="mt-3 rounded-2xl border border-border bg-card p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Invite a Friend</p>
            <input type="text" value={friendSearch} onChange={e => setFriendSearch(e.target.value)}
              placeholder="Search friends…"
              className="w-full h-9 px-3 rounded-xl border border-border bg-muted text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-3" />
            {friends.filter(f => !friendSearch.trim() || (f.full_name ?? f.displayName ?? f.email ?? '').toLowerCase().includes(friendSearch.toLowerCase())).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">No friends found</p>
            ) : (
              <div className="space-y-1">
                {friends.filter(f => !friendSearch.trim() || (f.full_name ?? f.displayName ?? f.email ?? '').toLowerCase().includes(friendSearch.toLowerCase()))
                  .map(f => {
                    const alreadyMember = (group?.memberIds ?? []).includes(f.id);
                    return (
                      <div key={f.id} className="flex items-center gap-3 py-2">
                        <AvatarDisplay initials={(f.full_name ?? f.displayName ?? '?')[0].toUpperCase()} avatarData={f} size={32} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{f.full_name ?? f.displayName}</p>
                        </div>
                        {alreadyMember ? (
                          <span className="text-xs text-muted-foreground">In group</span>
                        ) : invitedFriends[f.id] ? (
                          <span className="text-xs font-semibold text-green-600">✓ Invited</span>
                        ) : (
                          <button onClick={() => handleInviteFriend(f)}
                            className="h-8 px-3 rounded-lg text-xs font-semibold"
                            style={{ background: 'rgba(34,197,94,0.12)', color: '#16A34A' }}>
                            Invite
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Community Goal */}
        {group?.communityGoalTarget > 0 && (() => {
          const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
          const monthLogs = allLogs.filter(l => new Date(l.created_date ?? l.timestamp) >= monthStart);
          const uniqueMonthChapters = new Set(monthLogs.map(l => l.chapterId)).size;
          const pct = Math.min(100, Math.round((uniqueMonthChapters / group.communityGoalTarget) * 100));
          const hit = pct >= 100;
          return (
            <div className={`mt-4 rounded-2xl border p-4 ${hit ? 'border-amber-300 dark:border-amber-700' : 'border-border'} bg-card`}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Community Goal</p>
                {hit && <span className="text-xs font-bold text-amber-500">🏆 Goal hit!</span>}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{group.communityGoal ?? `Read ${group.communityGoalTarget} chapters together`}</p>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: hit ? '#F59E0B' : '#22C55E' }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">{uniqueMonthChapters} chapters</span>
                <span className="text-xs text-muted-foreground">{pct}%</span>
              </div>
            </div>
          );
        })()}

        {/* Leaderboard */}
        <div className="mt-5 mb-2">
          <h2 className="text-base font-semibold text-foreground mb-3">Leaderboard</h2>
          <div className="flex gap-1 mb-4 bg-muted rounded-xl p-1">
            {Object.entries(tabConfig).map(([key, { label, icon: Icon }]) => (
              <button key={key} onClick={() => setTab(key)}
                className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold transition-all"
                style={tab === key
                  ? { background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                  : { color: 'hsl(var(--muted-foreground))' }}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card py-8 flex flex-col items-center gap-2">
              <Users className="w-6 h-6 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No members yet</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {rows.map((row, idx) => (
                <LeaderRow key={row.member.id} rank={idx + 1} member={row.member}
                  stat={cfg.stat(row)} unit={cfg.unit(row)}
                  isMe={row.member.id === user?.id}
                  onEncourage={handleEncourage}
                  encouraged={!!encouraged[row.member.id]}
                  onViewProfile={() => navigate(`/user-detail?id=${row.member.id}&groupId=${groupId}`)} />
              ))}
            </div>
          )}
        </div>

        {/* Group Activity Feed */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Group Activity
            </h2>
          </div>
          {feedLogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card py-10 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start reading to see activity here</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {feedLogs.map((log, i) => {
                  const fu = feedUsers[log.userId];
                  const name = fu?.full_name ?? fu?.displayName ?? 'A member';
                  const isMe = log.userId === user?.id;
                  const hifived = highFivedLogs[log.id];
                  const testament = log.testament;
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="rounded-2xl border border-border bg-card overflow-hidden"
                    >
                      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2">
                        <AvatarDisplay initials={name[0].toUpperCase()} avatarData={fu} size={38} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                            {isMe ? 'You' : name}
                            {isMe && <span className="text-xs font-normal text-muted-foreground ml-1">(you)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{timeAgo(log.created_date ?? log.timestamp)}</p>
                        </div>
                        {testament && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            testament === 'NT'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}>
                            {testament}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between px-4 pb-3.5">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                          <p className="text-sm text-foreground">
                            <span className="font-semibold">{log.book}</span>
                            <span className="text-muted-foreground"> · Ch. {log.chapter}</span>
                            {'  🔥'}
                          </p>
                        </div>
                        {!isMe && (
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => handleHighFive(log)}
                            disabled={hifived}
                            className={`flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
                              hifived
                                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-muted hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 text-muted-foreground'
                            }`}
                          >
                            <Hand className="w-3.5 h-3.5" />
                            {hifived ? 'High-fived! 🙌' : 'High Five'}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}