import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Copy, Check, Flame, BookOpen, Zap, HandHeart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { triggerHaptic } from '@/components/utils/haptics';
import { toast } from 'sonner';

// ── helpers ──────────────────────────────────────────────────────────────────
function timeAgo(isoString) {
  const diff = (Date.now() - new Date(isoString)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getThisWeekStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d;
}

function calcStreak(logs, userId) {
  const userLogs = logs.filter(l => l.userId === userId);
  const days = [...new Set(userLogs.map(l => l.dateKey))].sort().reverse();
  if (days.length === 0) return 0;
  const today = new Date();
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  let streak = 0;
  let cursor = new Date(today);
  for (let i = 0; i < days.length; i++) {
    const expected = fmt(cursor);
    if (days[i] === expected) { streak++; cursor.setDate(cursor.getDate() - 1); }
    else if (days[i] === fmt(new Date(cursor.getTime() - 86400000))) { cursor.setDate(cursor.getDate() - 1); continue; }
    else break;
  }
  return streak;
}

// ── Medal badge ───────────────────────────────────────────────────────────────
function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="w-7 text-center text-sm font-bold text-muted-foreground">{rank}</span>;
}

// ── Leaderboard row ───────────────────────────────────────────────────────────
function LeaderRow({ rank, member, stat, unit, isMe, onEncourage, encouraged }) {
  const name = member.full_name ?? member.displayName ?? 'Unknown';
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors ${isMe ? 'bg-primary/5' : ''}`}
    >
      <div className="w-7 flex items-center justify-center shrink-0">
        <RankBadge rank={rank} />
      </div>
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{ background: isMe ? 'rgba(34,197,94,0.15)' : 'hsl(var(--muted))', color: isMe ? '#16A34A' : 'hsl(var(--muted-foreground))' }}
      >
        {name[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isMe ? 'text-primary' : 'text-foreground'}`}>
          {name} {isMe && <span className="text-xs font-normal text-muted-foreground">(you)</span>}
        </p>
        <p className="text-xs text-muted-foreground">{stat} {unit}</p>
      </div>
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GroupDetail() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const groupId = params.get('id');
  const groupName = params.get('name') ?? 'Group';

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [feedLogs, setFeedLogs] = useState([]);
  const [feedUsers, setFeedUsers] = useState({});
  const [tab, setTab] = useState('xp'); // 'xp' | 'streak' | 'chapters'
  const [copied, setCopied] = useState(false);
  const [encouraged, setEncouraged] = useState({}); // memberId -> bool
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    const groups = await base44.entities.Group.filter({ id: groupId });
    const grp = groups[0];
    if (!grp) { setLoading(false); return; }
    setGroup(grp);

    const memberIds = grp.memberIds ?? [];
    if (memberIds.length === 0) { setLoading(false); return; }

    // Fetch members + their logs
    const allUsers = await base44.entities.User.list();
    const grpMembers = allUsers.filter(u => memberIds.includes(u.id));
    setMembers(grpMembers);
    const uMap = {};
    grpMembers.forEach(u => { uMap[u.id] = u; });

    // Fetch recent logs for all members (for streaks + week chapters)
    const logsAll = await base44.entities.ReadingLog.list('-created_date', 500);
    const memberLogs = logsAll.filter(l => memberIds.includes(l.userId));
    setAllLogs(memberLogs);

    // Feed: last 30 logs for these members
    setFeedLogs(memberLogs.slice(0, 30));
    setFeedUsers(uMap);
    setLoading(false);
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const weekStart = getThisWeekStart();

  // Build leaderboard data
  const withStats = members.map(m => {
    const weekLogs = allLogs.filter(l => l.userId === m.id && new Date(l.created_date ?? l.timestamp) >= weekStart);
    const uniqueWeekChapters = new Set(weekLogs.map(l => l.chapterId)).size;
    const streak = calcStreak(allLogs, m.id);
    const xp = m.xp ?? 0;
    return { member: m, weekChapters: uniqueWeekChapters, streak, xp };
  });

  const leaderboards = {
    xp: [...withStats].sort((a, b) => b.xp - a.xp),
    streak: [...withStats].sort((a, b) => b.streak - a.streak),
    chapters: [...withStats].sort((a, b) => b.weekChapters - a.weekChapters),
  };

  const tabConfig = {
    xp: { label: 'XP', icon: Zap, stat: r => r.xp.toLocaleString(), unit: 'XP' },
    streak: { label: 'Streak', icon: Flame, stat: r => r.streak, unit: 'days' },
    chapters: { label: 'Chapters', icon: BookOpen, stat: r => r.weekChapters, unit: 'this week' },
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(groupId);
    setCopied(true);
    toast.success('Group ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEncourage = async (member) => {
    triggerHaptic();
    setEncouraged(prev => ({ ...prev, [member.id]: true }));
    await base44.functions.invoke('sendEncouragement', { recipientId: member.id });
    toast('🙏 Encouragement sent!', { duration: 1500 });
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
      <div className="max-w-lg mx-auto px-5 pt-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate(-1)} className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{group?.name ?? groupName}</h1>
            <p className="text-xs text-muted-foreground">{members.length} members</p>
          </div>
          <button
            onClick={copyInvite}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Invite'}
          </button>
        </div>

        {/* Leaderboard section */}
        <div className="mt-5 mb-2">
          <h2 className="text-base font-semibold text-foreground mb-3">Leaderboard</h2>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-muted rounded-xl p-1">
            {Object.entries(tabConfig).map(([key, { label, icon: Icon }]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold transition-all"
                style={tab === key
                  ? { background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                  : { color: 'hsl(var(--muted-foreground))' }
                }
              >
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
                <LeaderRow
                  key={row.member.id}
                  rank={idx + 1}
                  member={row.member}
                  stat={cfg.stat(row)}
                  unit={cfg.unit}
                  isMe={row.member.id === user?.id}
                  onEncourage={handleEncourage}
                  encouraged={!!encouraged[row.member.id]}
                />
              ))}
            </div>
          )}
        </div>

        {/* Group Activity Feed */}
        <div className="mt-6">
          <h2 className="text-base font-semibold text-foreground mb-3">Group Activity</h2>
          {feedLogs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card py-8 flex flex-col items-center gap-2">
              <BookOpen className="w-6 h-6 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No reading activity yet</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {feedLogs.map(log => {
                const fu = feedUsers[log.userId];
                const name = fu?.full_name ?? fu?.displayName ?? 'A member';
                const isMe = log.userId === user?.id;
                return (
                  <div key={log.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: isMe ? 'rgba(34,197,94,0.15)' : 'hsl(var(--muted))', color: isMe ? '#16A34A' : 'hsl(var(--muted-foreground))' }}
                    >
                      {name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{isMe ? 'You' : name}</span>
                        {' finished '}
                        <span className="font-medium">{log.book} {log.chapter}</span>
                        {' 🔥'}
                      </p>
                      <p className="text-xs text-muted-foreground">{timeAgo(log.created_date ?? log.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}