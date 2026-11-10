import React, { useState, useEffect, useCallback } from 'react';
import WeeklyRecapCard from '@/components/social/WeeklyRecapCard';
import NotificationsBell from '@/components/notifications/NotificationsBell';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFriendsPage, streakFromDays } from '@/components/social/useFriendsPage';
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
import { boardHasNew } from '@/components/group/boardSeen';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchGroupData } from '@/components/group/useGroupData';

// ── Friend Card with Dynamic Streak ────────────────────────────
function FriendCard({ friend, index, readToday, book, streak }) {
  const navigate = useNavigate();

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
// Shown while the page loads for the first time, shaped like the real rows.
function RowPlaceholders({ count = 3, label }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card flex items-center gap-3 px-4 py-3.5">
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
            <div className="h-2.5 w-20 rounded bg-muted/70 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadError({ onRetry }) {
  return (
    <div className="rounded-2xl border border-border bg-card py-8 px-6 flex flex-col items-center gap-3 text-center">
      <p className="text-sm font-semibold text-foreground">Couldn't load this right now</p>
      <p className="text-xs text-muted-foreground">Check your connection and try again.</p>
      <button onClick={onRetry} className="h-9 px-5 rounded-xl text-sm font-semibold bg-muted text-foreground">Try again</button>
    </div>
  );
}

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
  const queryClient = useQueryClient();

  // 'friends' | 'groups' | 'feed'. Remembered while the app is open, so coming back from a group lands on Groups.
  const [tab, setTabState] = useState(() => {
    try { const saved = sessionStorage.getItem('bb.socialTab'); return ['friends', 'groups', 'feed'].includes(saved) ? saved : 'friends'; } catch { return 'friends'; }
  });
  const setTab = useCallback((next) => {
    setTabState(next);
    try { sessionStorage.setItem('bb.socialTab', next); } catch { /* storage unavailable */ }
  }, []);

  // Friends, requests, groups and activity all come from one remembered request.
  const page = useFriendsPage(user?.id);
  const pageData = page.data;
  const hasData = !!pageData;
  const showingSaved = !!pageData?.saved; // the device's saved copy, while fresh data loads
  const loadFailed = page.isError && !page.isFetching;
  const friends = pageData?.friends ?? [];
  const pendingRequests = pageData?.pending ?? [];
  const pendingUsers = pageData?.pendingUsers ?? {};
  const feedLogs = pageData?.logs ?? [];
  const feedPeople = pageData?.people ?? [];
  const feedUsers = Object.fromEntries(feedPeople.map((u) => [u.id, u]));
  const readDays = pageData?.readDays ?? {};
  const refetchPage = page.refetch;
  const refresh = useCallback(() => refetchPage(), [refetchPage]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Groups state (null until the first load)
  const groups = pageData?.groups ?? null;
  const groupList = groups ?? [];
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [joiningGroup, setJoiningGroup] = useState(false);
  const [copiedGroupId, setCopiedGroupId] = useState(null);

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

  // Once fresh data is in, get a head start on every group, one at a time, so opening any of them is quick.
  useEffect(() => {
    if (!pageData || page.isPlaceholderData || !groups?.length) return undefined;
    let cancelled = false;
    (async () => {
      for (const g of groups.slice(0, 12)) {
        if (cancelled) return;
        await prefetchGroupData(queryClient, g.id);
        await new Promise((r) => setTimeout(r, 250));
      }
    })();
    return () => { cancelled = true; };
  }, [pageData, page.isPlaceholderData, groups, queryClient]);

  useEffect(() => { loadRecap(); }, [loadRecap]);


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
    refresh();
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
    refresh();
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
        refresh();
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
      refresh();
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
        {!hasData ? (
          loadFailed ? <LoadError onRetry={refresh} /> : <RowPlaceholders count={3} label="Loading friends" />
        ) : friends.length === 0 ? (
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
                <FriendCard key={f.id} friend={f} index={i} readToday={readToday.has(f.id)} book={todaysBooks.get(f.id)} streak={streakFromDays(readDays[f.id], todayKey)} />
              ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderGroups = () => (
    <div className="space-y-5">
      {groups !== null && groupList.length === 0 && !showCreateGroup && (
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

        {groups === null && loadFailed ? (
          <LoadError onRetry={refresh} />
        ) : groups === null ? (
          <div className="space-y-2" aria-busy="true" aria-label="Loading groups">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card flex items-center gap-3 px-4 py-3.5">
                <div className="w-10 h-10 rounded-xl bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
                  <div className="h-2.5 w-20 rounded bg-muted/70 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : groupList.length === 0 ? (
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
            {groupList.map((g, i) => {
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
                      onPointerDown={() => prefetchGroupData(queryClient, g.id)}
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
                        <p className="text-sm font-bold text-foreground truncate flex items-center gap-1.5">
                          <span className="truncate">{g.name}</span>
                          {boardHasNew(user?.id, g) && <span aria-label="New posts" className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                        </p>
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
                              refresh();
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
    const result = await refetchPage();
    setRefreshing(false);
    if (result.isError) toast.error("Couldn't refresh right now. Try again in a moment.");
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

      {(!hasData || showingSaved) ? (
        loadFailed ? <LoadError onRetry={refresh} /> : <RowPlaceholders count={4} label="Loading activity" />
      ) : (
      <CommunityFeed
        logs={feedLogs}
        usersById={feedUsers}
        people={feedPeople}
        meId={user?.id}
        emptyTitle="No activity yet"
        emptyText="Add friends or join a group to see their reading here"
      />
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
          <NotificationsBell
            defaultOpen={openNotifications}
            onChange={refresh}
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

        {loadFailed && hasData && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-muted px-3.5 py-2.5">
            <p className="text-xs text-muted-foreground">Couldn't refresh. Showing what was loaded before.</p>
            <button onClick={refresh} className="text-xs font-semibold text-foreground shrink-0">Try again</button>
          </div>
        )}

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