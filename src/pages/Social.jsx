import React, { useState, useEffect, useCallback, useRef } from 'react';
import WeeklyRecapCard from '@/components/social/WeeklyRecapCard';
import NotificationsBell from '@/components/notifications/NotificationsBell';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFriendStreak } from '@/components/bible/hooks/useFriendStreak';
import { Users, UserPlus, Search, Plus, X, Check, ChevronRight, RefreshCw, Sparkles, Copy, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { AvatarDisplay } from '@/components/profile/AvatarPicker';
import { useAuth } from '@/lib/AuthContext';
import { triggerHaptic } from '@/components/utils/haptics';
import { toast } from 'sonner';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import CommunityFeed from '@/components/community/CommunityFeed';
import CheerButton from '@/components/community/CheerButton';
import { readOnDay, latestBookByUser } from '@/components/community/buildFeed';

// ── Friend Card with Dynamic Streak ────────────────────────────
function FriendCard({ friend, index, readToday, book }) {
  const navigate = useNavigate();
  const streak = useFriendStreak(friend.id);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-2 pr-3 rounded-2xl border border-border bg-card"
    >
      <button
        onClick={() => navigate(`/user-detail?id=${friend.id}`)}
        className="flex-1 min-w-0 flex items-center gap-3 pl-4 py-3 text-left"
      >
        <div className="relative shrink-0">
          <AvatarDisplay initials={(friend.displayName || friend.full_name || friend.email || '?')[0].toUpperCase()} avatarData={friend} size={40} />
          {readToday && (
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-card">✓</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{friend.displayName || friend.full_name || 'Member'}</p>
            {streak > 0 && (
              <span className="text-xs text-orange-500 font-semibold shrink-0">🔥 {streak}d</span>
            )}
          </div>
          <p className={`text-xs mt-0.5 truncate ${readToday ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-muted-foreground'}`}>
            {readToday ? `Read today${book ? ` · ${book}` : ''}` : 'Not yet today'}
          </p>
        </div>
      </button>
      <CheerButton toUser={friend} />
    </motion.div>
  );
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
  const [copiedGroupId, setCopiedGroupId] = useState(null);

  // Feed state
  const [feedLogs, setFeedLogs] = useState([]);
  const [feedUsers, setFeedUsers] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const location = useLocation();
  const openNotifications = new URLSearchParams(location.search).get('notifications') === '1';

  // Recap
  const [recapNotif, setRecapNotif] = useState(null);

  // ── Data loading ───────────────────────────────────────────
  const loadRecap = useCallback(async () => {
    if (!user?.id) return;
    const [legacy, recaps] = await Promise.all([
      base44.entities.Notification.filter({ userId: user.id, type: 'league_promotion', isRead: false }),
      base44.entities.Notification.filter({ userId: user.id, type: 'weekly_recap', isRead: false }),
    ]);
    const notifs = [...recaps, ...legacy];
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
    const all = await base44.entities.Group.filter({}, '-created_date', 1000);
    const myGroups = all.filter(g =>
      (g.memberIds ?? []).includes(user.id) || g.ownerId === user.id
    );
    setGroups(myGroups);
  }, [user?.id]);

  // Friends and Activity tabs share this data; reuse it for a minute unless refreshed.
  const feedLoadedAt = useRef(0);
  const feedLoadSeq = useRef(0); // newest load wins if two overlap
  const loadFeed = useCallback(async ({ force = false } = {}) => {
    if (!user?.id) return;
    if (!force && Date.now() - feedLoadedAt.current < 60000) return;
    feedLoadedAt.current = Date.now();
    const seq = ++feedLoadSeq.current;
    const isLatest = () => seq === feedLoadSeq.current;
    try {
      // Collect friend IDs
      const [sent, received] = await Promise.all([
        base44.entities.Friendship.filter({ user1Id: user.id, status: 'accepted' }),
        base44.entities.Friendship.filter({ user2Id: user.id, status: 'accepted' }),
      ]);
      const friendIds = [...sent, ...received].map(f => f.user1Id === user.id ? f.user2Id : f.user1Id);

      // Also collect group member IDs. Membership comes from the group itself (same check as the
      // Groups tab and the server), not user.groupIds, which isn't cleared when someone is removed.
      const allGroups = await base44.entities.Group.filter({}, '-created_date', 1000);
      const myGroups = allGroups.filter(g => (g.memberIds ?? []).includes(user.id) || g.ownerId === user.id);
      const groupMemberIds = myGroups.flatMap(g => [g.ownerId, ...(g.memberIds ?? [])]);

      // Union of friends + group members, excluding self
      const allSocialIds = [...new Set([...friendIds, ...groupMemberIds])].filter(id => id && id !== user.id);
      if (allSocialIds.length === 0) { if (isLatest()) { setFeedLogs([]); setFeedUsers({}); } return; }

      // Fetch recent logs for everyone (you included, so you can see cheers on your reading)
      const [logsRes, res] = await Promise.all([
        base44.functions.invoke('getGroupReadingLogs', { memberIds: [user.id, ...allSocialIds] }),
        base44.functions.invoke('getUsersByIds', { ids: [user.id, ...allSocialIds] }),
      ]);
      if (!isLatest()) return;
      const map = {};
      (res.data?.users ?? []).forEach(u => { map[u.id] = u; });
      setFeedLogs(logsRes.data?.logs ?? []);
      setFeedUsers(map);
    } catch (err) {
      if (isLatest()) feedLoadedAt.current = 0; // let the next visit retry
      throw err;
    }
  }, [user?.id]);

  useEffect(() => { loadRecap(); }, [loadRecap]);

  useEffect(() => {
    // A failed feed load just leaves the last data on screen; the next visit or refresh retries.
    if (tab === 'friends') { loadFriends(); loadPending(); loadFeed().catch(() => {}); }
    if (tab === 'groups') loadGroups();
    if (tab === 'feed') loadFeed().catch(() => {});
  }, [tab, loadFriends, loadPending, loadGroups, loadFeed]);

  // ── Search ─────────────────────────────────────────────────
  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
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
    loadFeed({ force: true }).catch(() => {});
  };

  const declineRequest = async (friendship) => {
    // Re-check first: if it was already accepted (e.g. from the bell), don't delete the friendship.
    try {
      const [current] = await base44.entities.Friendship.filter({ id: friendship.id });
      if (current?.status === 'pending') await base44.entities.Friendship.delete(friendship.id);
      toast(current?.status === 'accepted' ? "You're already friends" : 'Request declined');
    } catch {
      toast.error('Could not decline. Try again.');
    }
    loadPending();
    loadFriends();
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setCreatingGroup(true);
    try {
      const res = await base44.functions.invoke('createGroup', { name: newGroupName.trim() });
      const newGroup = res.data?.group;
      if (newGroup) {
        updateUser({ groupIds: [...(user.groupIds ?? []), newGroup.id] });
        toast.success('Group created!');
        setShowCreateGroup(false);
        setNewGroupName('');
        loadGroups();
        loadFeed({ force: true }).catch(() => {});
      }
    } catch {
      toast.error('Could not create the group. Try again.');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinGroupId.trim()) return;
    setJoiningGroup(true);
    const code = joinGroupId.trim().toUpperCase();
    try {
      const res = await base44.functions.invoke('joinGroup', { joinCode: code });
      const joinedId = res.data?.group?.id ?? code;
      updateUser({ groupIds: [...(user.groupIds ?? []), joinedId] });
      toast.success('Joined group!');
      setJoinGroupId('');
      loadGroups();
      loadFeed({ force: true }).catch(() => {});
    } catch (err) {
      const status = err?.response?.status ?? err?.status;
      toast.error(status === 404 ? 'No group found with that code' : 'Could not join the group. Try again.');
    } finally {
      setJoiningGroup(false);
    }
  };

  // ── Tab content ────────────────────────────────────────────
  const todayKey = getDateKey();
  const readToday = readOnDay(feedLogs, todayKey);
  const todaysBooks = latestBookByUser(feedLogs.filter(l => l.dateKey === todayKey));

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
            placeholder="Search by name…"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-muted text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 rounded-xl border border-border bg-card overflow-hidden">
            {searchResults.map(u => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
                <AvatarDisplay initials={(u.displayName || u.full_name || u.email || '?')[0].toUpperCase()} avatarData={u} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{u.displayName || u.full_name || 'Member'}</p>
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
                  initials={(pendingUsers[fr.requestedById]?.displayName || pendingUsers[fr.requestedById]?.full_name || pendingUsers[fr.requestedById]?.email || '?')[0].toUpperCase()}
                  avatarData={pendingUsers[fr.requestedById]}
                  size={32}
                />
                <p className="flex-1 text-sm font-medium text-foreground truncate">{pendingUsers[fr.requestedById]?.displayName || pendingUsers[fr.requestedById]?.full_name || pendingUsers[fr.requestedById]?.email || 'Someone'}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequest(fr)}
                    aria-label="Accept friend request"
                    className="h-8 w-8 flex items-center justify-center rounded-lg"
                    style={{ background: 'rgba(34,197,94,0.12)' }}
                  >
                    <Check className="w-4 h-4" style={{ color: '#16A34A' }} />
                  </button>
                  <button
                    onClick={() => declineRequest(fr)}
                    aria-label="Decline friend request"
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
            {[...friends]
              .sort((a, b) => readToday.has(b.id) - readToday.has(a.id))
              .map((f, i) => (
                <FriendCard key={f.id} friend={f} index={i} readToday={readToday.has(f.id)} book={todaysBooks.get(f.id)} />
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
            {groups.map((g, i) => {
              const isOwner = g.ownerId === user?.id;
              const isCopied = copiedGroupId === g.id;
              const copyGroupId = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(g.joinCode ?? g.id);
                setCopiedGroupId(g.id);
                toast.success('Group ID copied!');
                setTimeout(() => setCopiedGroupId(null), 2000);
              };
              return (
                <motion.div key={g.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <button
                      onClick={() => navigate(`/group-detail?id=${g.id}&name=${encodeURIComponent(g.name)}`)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors text-left"
                    >
                      {g.avatarUrl ? (
                        <img src={g.avatarUrl} alt={g.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-white">{g.name[0].toUpperCase()}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{g.name}</p>
                        <p className="text-xs text-muted-foreground">👥 {(g.memberIds ?? []).length} members</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                    {isOwner && (
                      <div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-muted/30">
                        {g.joinCode ? (
                          <>
                            <p className="text-[11px] text-muted-foreground flex-1">
                              <span className="font-semibold text-foreground">Join Code:</span>{' '}
                              <span className="font-mono font-bold text-foreground tracking-widest">{g.joinCode}</span>
                            </p>
                            <button
                              onClick={copyGroupId}
                              className="flex items-center gap-1 h-6 px-2 rounded-lg text-[11px] font-semibold transition-colors"
                              style={isCopied ? { color: '#16A34A' } : { color: 'hsl(var(--muted-foreground))' }}
                            >
                              {isCopied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              {isCopied ? 'Copied!' : 'Copy'}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                              const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                              await base44.entities.Group.update(g.id, { joinCode: code });
                              loadGroups();
                              toast.success('Join code generated!');
                            }}
                            className="text-[11px] font-semibold text-primary underline"
                          >
                            Generate join code
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
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
            placeholder="Enter 6-letter join code…"
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
    try {
      await loadFeed({ force: true });
    } catch {
      toast.error("Couldn't refresh right now. Try again in a moment.");
    } finally {
      setRefreshing(false);
    }
  };

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
          aria-label="Refresh activity"
          className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <CommunityFeed
        logs={feedLogs}
        usersById={feedUsers}
        people={Object.values(feedUsers)}
        meId={user?.id}
        emptyTitle="No activity yet"
        emptyText="Add friends or join a group to see their reading here"
      />
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
          <NotificationsBell
            defaultOpen={openNotifications}
            onChange={() => { loadPending(); loadFriends(); loadGroups(); loadFeed({ force: true }).catch(() => {}); }}
          />
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
            payload={recapNotif.payload}
            onDismiss={async () => {
              // Dismissed everywhere (Friends tab and the group page), on every device.
              await base44.entities.Notification.update(recapNotif.id, { isRead: true, payload: { ...(recapNotif.payload ?? {}), dismissed: true } }).catch(() => {});
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