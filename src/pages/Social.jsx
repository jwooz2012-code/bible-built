import React, { useState, useEffect, useCallback } from 'react';
import WeeklyRecapCard from '@/components/social/WeeklyRecapCard';
import NotificationsBell from '@/components/notifications/NotificationsBell';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Search, Plus, X, Check, ChevronRight, Flame, Hand, RefreshCw, Sparkles, BookOpen, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { AvatarDisplay } from '@/components/profile/AvatarPicker';
import { useAuth } from '@/lib/AuthContext';
import { triggerHaptic } from '@/components/utils/haptics';
import { toast } from 'sonner';

// ── helpers ────────────────────────────────────────────────────
function timeAgo(isoString) {
  const diff = (Date.now() - new Date(isoString)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Sub-components ─────────────────────────────────────────────
function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {action}
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <Icon className="w-6 h-6 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function Social() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('friends'); // 'friends' | 'groups' | 'feed'

  // Friends state
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingUsers, setPendingUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Groups state
  const [groups, setGroups] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [joiningGroup, setJoiningGroup] = useState(false);

  // Feed state
  const [feedItems, setFeedItems] = useState([]);
  const [feedUsers, setFeedUsers] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [highFivedLogs, setHighFivedLogs] = useState({});

  // Recap
  const [recapNotif, setRecapNotif] = useState(null);

  // ── Data loading ───────────────────────────────────────────
  const loadRecap = useCallback(async () => {
    if (!user?.id) return;
    const notifs = await base44.entities.Notification.filter({ userId: user.id, type: 'league_promotion', isRead: false });
    if (notifs.length > 0) {
      notifs.sort((a, b) => new Date(b.createdAt ?? b.created_date) - new Date(a.createdAt ?? a.created_date));
      setRecapNotif(notifs[0]);
    }
  }, [user?.id]);

  const loadFriends = useCallback(async () => {
    if (!user?.id) return;
    const [sent, received] = await Promise.all([
      base44.entities.Friendship.filter({ user1Id: user.id, status: 'accepted' }),
      base44.entities.Friendship.filter({ user2Id: user.id, status: 'accepted' }),
    ]);
    const all = [...sent, ...received];
    const friendUserIds = all.map(f => f.user1Id === user.id ? f.user2Id : f.user1Id);
    if (friendUserIds.length === 0) { setFriends([]); return; }
    const res = await base44.functions.invoke('getUsersByIds', { ids: friendUserIds });
    setFriends(res.data?.users ?? []);
  }, [user?.id]);

  const loadPending = useCallback(async () => {
    if (!user?.id) return;
    const requests = await base44.entities.Friendship.filter({ user2Id: user.id, status: 'pending' });
    setPendingRequests(requests);
    if (requests.length > 0) {
      const requesterIds = requests.map(r => r.requestedById).filter(Boolean);
      const res = await base44.functions.invoke('getUsersByIds', { ids: requesterIds });
      const map = {};
      (res.data?.users ?? []).forEach(u => { map[u.id] = u; });
      setPendingUsers(map);
    }
  }, [user?.id]);

  const loadGroups = useCallback(async () => {
    if (!user?.id) return;
    const groupIds = user.groupIds ?? [];
    if (groupIds.length === 0) { setGroups([]); return; }
    const all = await base44.entities.Group.filter({});
    setGroups(all.filter(g => groupIds.includes(g.id)));
  }, [user?.id, user?.groupIds]);

  const loadFeed = useCallback(async () => {
    if (!user?.id) return;
    // Collect friend IDs
    const [sent, received] = await Promise.all([
      base44.entities.Friendship.filter({ user1Id: user.id, status: 'accepted' }),
      base44.entities.Friendship.filter({ user2Id: user.id, status: 'accepted' }),
    ]);
    const friendIds = [...sent, ...received].map(f => f.user1Id === user.id ? f.user2Id : f.user1Id);

    // Also collect group member IDs
    const groupIds = user.groupIds ?? [];
    let groupMemberIds = [];
    if (groupIds.length > 0) {
      const allGroups = await base44.entities.Group.filter({});
      const myGroups = allGroups.filter(g => groupIds.includes(g.id));
      myGroups.forEach(g => { groupMemberIds.push(...(g.memberIds ?? [])); });
    }

    // Union of friends + group members, excluding self
    const allSocialIds = [...new Set([...friendIds, ...groupMemberIds])].filter(id => id !== user.id);
    if (allSocialIds.length === 0) { setFeedItems([]); return; }

    // Fetch recent logs per person in social circle (more reliable than global list)
    const logsByPerson = await Promise.all(
      allSocialIds.map(id => base44.entities.ReadingLog.filter({ userId: id }, '-created_date', 20))
    );
    const allLogs = logsByPerson.flat();
    allLogs.sort((a, b) => new Date(b.created_date ?? b.timestamp) - new Date(a.created_date ?? a.timestamp));
    setFeedItems(allLogs.slice(0, 40));

    const res = await base44.functions.invoke('getUsersByIds', { ids: allSocialIds });
    const map = {};
    (res.data?.users ?? []).forEach(u => { map[u.id] = u; });
    setFeedUsers(map);
  }, [user?.id, user?.groupIds]);

  useEffect(() => { loadRecap(); }, [loadRecap]);

  useEffect(() => {
    if (tab === 'friends') { loadFriends(); loadPending(); }
    if (tab === 'groups') loadGroups();
    if (tab === 'feed') loadFeed();
  }, [tab, loadFriends, loadPending, loadGroups, loadFeed]);

  // ── Search ─────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const res = await base44.functions.invoke('searchUsers', { query: searchQuery });
      setSearchResults(res.data?.users ?? []);
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // ── Actions ────────────────────────────────────────────────
  const sendRequest = async (targetUserId) => {
    try {
      await base44.functions.invoke('sendFriendRequest', { targetUserId });
      toast.success('Friend request sent!');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        toast('Already friends or request pending');
      } else {
        toast.error('Could not send request. Try again.');
      }
    }
    setSearchResults(prev => prev.filter(u => u.id !== targetUserId));
  };

  const acceptRequest = async (friendship) => {
    await base44.functions.invoke('acceptFriendRequest', { friendshipId: friendship.id });
    triggerHaptic();
    toast.success('Friend accepted!');
    loadPending();
    loadFriends();
  };

  const declineRequest = async (friendship) => {
    await base44.entities.Friendship.delete(friendship.id);
    toast('Request declined');
    loadPending();
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setCreatingGroup(true);
    const res = await base44.functions.invoke('createGroup', { name: newGroupName.trim() });
    const newGroup = res.data?.group;
    if (newGroup) {
      updateUser({ groupIds: [...(user.groupIds ?? []), newGroup.id] });
      toast.success('Group created!');
      setShowCreateGroup(false);
      setNewGroupName('');
      loadGroups();
    }
    setCreatingGroup(false);
  };

  const handleJoinGroup = async () => {
    if (!joinGroupId.trim()) return;
    setJoiningGroup(true);
    await base44.functions.invoke('joinGroup', { groupId: joinGroupId.trim() });
    updateUser({ groupIds: [...(user.groupIds ?? []), joinGroupId.trim()] });
    toast.success('Joined group!');
    setJoinGroupId('');
    loadGroups();
    setJoiningGroup(false);
  };

  const sendHighFive = async (log) => {
    if (highFivedLogs[log.id]) return;
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

  // ── Tab content ────────────────────────────────────────────
  const renderFriends = () => (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <SectionHeader title="Find Friends" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-muted text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 rounded-xl border border-border bg-card overflow-hidden">
            {searchResults.map(u => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
                <AvatarDisplay initials={(u.full_name || u.displayName || u.email || '?')[0].toUpperCase()} avatarData={u} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{u.full_name ?? u.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <button
                  onClick={() => sendRequest(u.id)}
                  className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1"
                  style={{ background: 'rgba(34,197,94,0.12)', color: '#16A34A' }}
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            ))}
          </div>
        )}
        {searching && <p className="text-xs text-muted-foreground mt-2 text-center">Searching…</p>}
      </div>

      {/* Pending */}
      {pendingRequests.length > 0 && (
        <div>
          <SectionHeader title={`Pending Requests (${pendingRequests.length})`} />
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {pendingRequests.map(fr => (
              <div key={fr.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
                <AvatarDisplay
                  initials={(pendingUsers[fr.requestedById]?.full_name || pendingUsers[fr.requestedById]?.displayName || pendingUsers[fr.requestedById]?.email || '?')[0].toUpperCase()}
                  avatarData={pendingUsers[fr.requestedById]}
                  size={32}
                />
                <p className="flex-1 text-sm font-medium text-foreground truncate">{pendingUsers[fr.requestedById]?.full_name || pendingUsers[fr.requestedById]?.displayName || pendingUsers[fr.requestedById]?.email || 'Someone'}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequest(fr)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg"
                    style={{ background: 'rgba(34,197,94,0.12)' }}
                  >
                    <Check className="w-4 h-4" style={{ color: '#16A34A' }} />
                  </button>
                  <button
                    onClick={() => declineRequest(fr)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div>
        <SectionHeader title={`Friends${friends.length ? ` (${friends.length})` : ''}`} />
        {friends.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-10 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">No friends yet</p>
              <p className="text-xs text-muted-foreground mt-1">Search above to find and add friends</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => navigate(`/user-detail?id=${f.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-colors text-left"
                >
                  <AvatarDisplay initials={(f.full_name || f.displayName || f.email || '?')[0].toUpperCase()} avatarData={f} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{f.full_name ?? f.displayName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {(f.streak ?? f.streakDays) > 0 && (
                        <span className="text-xs text-orange-500 font-semibold flex items-center gap-0.5">
                          🔥 {f.streak ?? f.streakDays}d
                        </span>
                      )}
                      {f.level > 0 && (
                        <span className="text-xs text-muted-foreground">Lvl {f.level}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderGroups = () => (
    <div className="space-y-5">
      {groups.length === 0 && !showCreateGroup && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 flex flex-col items-center gap-2 mb-1">
          <span className="text-3xl">✨</span>
          <p className="text-sm font-semibold text-foreground">Create a Spiritual Circle</p>
          <p className="text-xs text-muted-foreground text-center">Start a group and invite your community to read together</p>
          <button onClick={() => setShowCreateGroup(true)}
            className="mt-1 h-9 px-5 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', color: '#fff' }}>
            Create a Group
          </button>
        </div>
      )}
      {/* Create */}
      <div>
        <SectionHeader
          title="My Groups"
          action={
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(34,197,94,0.12)', color: '#16A34A' }}
            >
              <Plus className="w-3.5 h-3.5" /> Create
            </button>
          }
        />

        {showCreateGroup && (
          <div className="rounded-2xl border border-border bg-card p-4 mb-3">
            <p className="text-sm font-semibold text-foreground mb-2">New Group</p>
            <input
              type="text"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              placeholder="Group name…"
              className="w-full h-10 px-3 rounded-xl border border-border bg-muted text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateGroup}
                disabled={creatingGroup || !newGroupName.trim()}
                className="flex-1 h-9 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', color: '#fff' }}
              >
                {creatingGroup ? 'Creating…' : 'Create'}
              </button>
              <button
                onClick={() => { setShowCreateGroup(false); setNewGroupName(''); }}
                className="h-9 px-4 rounded-xl text-sm bg-muted text-muted-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-10 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">No groups yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create a group or join with an ID below</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((g, i) => (
              <motion.div key={g.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <button
                  onClick={() => navigate(`/group-detail?id=${g.id}&name=${encodeURIComponent(g.name)}`)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-white">{g.name[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{g.name}</p>
                    <p className="text-xs text-muted-foreground">👥 {(g.memberIds ?? []).length} members</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Join */}
      <div>
        <SectionHeader title="Join a Group" />
        <div className="flex gap-2">
          <input
            type="text"
            value={joinGroupId}
            onChange={e => setJoinGroupId(e.target.value)}
            placeholder="Enter Group ID…"
            className="flex-1 h-10 px-3 rounded-xl border border-border bg-muted text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleJoinGroup}
            disabled={joiningGroup || !joinGroupId.trim()}
            className="h-10 px-4 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#16A34A' }}
          >
            {joiningGroup ? '…' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );

  const handleRefreshFeed = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const testament_color = (t) => t === 'NT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';

  const renderFeed = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Community Activity
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Friends & group members</p>
        </div>
        <button
          onClick={handleRefreshFeed}
          disabled={refreshing}
          className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {feedItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-12 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add friends or join a group to see their reading here</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {feedItems.map((log, i) => {
              const friendUser = feedUsers[log.userId];
              const name = friendUser?.full_name ?? friendUser?.displayName ?? 'A friend';
              const hifived = highFivedLogs[log.id];
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-4 pt-3.5 pb-2">
                    <AvatarDisplay initials={name[0].toUpperCase()} avatarData={friendUser} size={38} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{name}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(log.created_date ?? log.timestamp)}</p>
                    </div>
                    {log.testament && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${testament_color(log.testament)}`}>
                        {log.testament}
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
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => sendHighFive(log)}
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
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-5 pt-[max(4rem,env(safe-area-inset-top))]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Builder Community
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Friends, groups &amp; activity</p>
          </div>
          <NotificationsBell />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-muted rounded-2xl p-1">
          {[
            { key: 'friends', label: '👥 Friends' },
            { key: 'groups', label: '✨ Groups' },
            { key: 'feed', label: '🔥 Activity' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 h-9 rounded-xl text-xs font-bold transition-all"
              style={tab === t.key
                ? { background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }
                : { color: 'hsl(var(--muted-foreground))' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {recapNotif && (
          <WeeklyRecapCard
            message={recapNotif.message}
            onDismiss={async () => {
              await base44.entities.Notification.update(recapNotif.id, { isRead: true });
              setRecapNotif(null);
            }}
          />
        )}
        {tab === 'friends' && renderFriends()}
        {tab === 'groups' && renderGroups()}
        {tab === 'feed' && renderFeed()}
      </div>
    </div>
  );
}