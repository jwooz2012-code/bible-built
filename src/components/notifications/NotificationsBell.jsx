import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Check, UserPlus, HandHeart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

const TYPE_ICON = {
  friend_request: UserPlus,
  nudge: HandHeart,
  group_invite: Star,
  league_promotion: Star,
};

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsBell() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const list = await base44.entities.Notification.filter({ userId: user.id });
    list.sort((a, b) => new Date(b.createdAt ?? b.created_date) - new Date(a.createdAt ?? a.created_date));
    setNotifications(list);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // Poll every 30s for new notifications
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markRead = async (notif) => {
    if (notif.isRead) return;
    await base44.entities.Notification.update(notif.id, { isRead: true });
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { isRead: true })));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const acceptFriendRequest = async (notif) => {
    try {
      await base44.functions.invoke('acceptFriendRequest', { friendshipId: notif.relatedId });
      toast.success('Friend accepted!');
    } catch {
      toast('Request no longer available');
    }
    await markRead(notif);
    load();
  };

  const joinGroup = async (notif) => {
    try {
      await base44.functions.invoke('joinGroup', { groupId: notif.relatedId });
      updateUser({ groupIds: [...(user.groupIds ?? []), notif.relatedId] });
      toast.success('Joined the group!');
      await markRead(notif);
      setOpen(false);
      navigate(`/group-detail?id=${notif.relatedId}`);
    } catch {
      toast.error('Could not join group');
    }
  };

  const declineGroupInvite = async (notif) => {
    await base44.entities.Notification.delete(notif.id);
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    toast('Invite declined');
  };

  const declineFriendRequest = async (notif) => {
    try {
      if (notif.relatedId) await base44.entities.Friendship.delete(notif.relatedId);
    } catch { /* already gone */ }
    try {
      await base44.entities.Notification.delete(notif.id);
    } catch { /* ignore */ }
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    toast('Request declined');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(o => !o); if (!open) load(); }}
        className="relative h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-muted-foreground hover:text-foreground">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-2">
              <Bell className="w-6 h-6 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map(notif => {
              const Icon = TYPE_ICON[notif.type] ?? Bell;
              return (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif)}
                  className={`px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-muted/40 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(notif.createdAt ?? notif.created_date)}</p>

                      {notif.type === 'friend_request' && !notif.isRead && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={e => { e.stopPropagation(); acceptFriendRequest(notif); }}
                            className="flex items-center gap-1 h-7 px-3 rounded-lg text-xs font-semibold"
                            style={{ background: 'rgba(34,197,94,0.15)', color: '#16A34A' }}
                          >
                            <Check className="w-3 h-3" /> Accept
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); declineFriendRequest(notif); }}
                            className="h-7 px-3 rounded-lg text-xs bg-muted text-muted-foreground"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {notif.type === 'group_invite' && !notif.isRead && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={e => { e.stopPropagation(); joinGroup(notif); }}
                            className="flex items-center gap-1 h-7 px-3 rounded-lg text-xs font-semibold"
                            style={{ background: 'rgba(34,197,94,0.15)', color: '#16A34A' }}
                          >
                            <Check className="w-3 h-3" /> Join Group
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); declineGroupInvite(notif); }}
                            className="h-7 px-3 rounded-lg text-xs bg-muted text-muted-foreground"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                    {!notif.isRead && <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}