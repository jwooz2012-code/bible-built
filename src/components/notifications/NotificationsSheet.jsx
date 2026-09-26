import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Check, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { cheerKind, ENCOURAGEMENT_TYPES, timeAgo } from '@/components/community/cheers';
import { useSendCheer } from '@/components/community/useCheers';

const TYPE_EMOJI = {
  high_five: '🙌',
  nudge: '🙏',
  friend_request: '👋',
  group_invite: '✨',
  league_promotion: '🏆',
  weekly_recap: '🏆',
};

const emojiFor = (n) => (n.type === 'cheer' ? cheerKind(n.payload?.kind).emoji : TYPE_EMOJI[n.type] ?? '🔔');

function ActionButton({ onClick, primary, children }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold"
      style={primary ? { background: 'rgba(34,197,94,0.15)', color: '#16A34A' } : { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
    >
      {children}
    </button>
  );
}

function NotificationRow({ notif, onOpen, onAction, sentBack, onSendBack }) {
  const unread = !notif.isRead;
  // Replies ("X gave you a high five back") don't get their own reply button.
  const canSendBack = ENCOURAGEMENT_TYPES.includes(notif.type) && notif.relatedId && !notif.payload?.reply;
  return (
    <div
      onClick={() => onOpen(notif)}
      className="px-4 py-3.5 flex items-start gap-3 cursor-pointer active:bg-muted/60 transition-colors"
      style={unread ? { background: 'color-mix(in srgb, rgb(34,197,94) 7%, transparent)' } : undefined}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg"
        style={{ background: unread ? 'rgba(34,197,94,0.15)' : 'hsl(var(--muted))' }}>
        {emojiFor(notif)}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${unread ? 'font-semibold text-foreground' : 'text-foreground/85'}`}>{notif.message}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(notif.createdAt ?? notif.created_date)}</p>

        {notif.type === 'friend_request' && unread && (
          <div className="flex gap-2 mt-2">
            <ActionButton primary onClick={() => onAction('acceptFriend', notif)}><Check className="w-3 h-3" /> Accept</ActionButton>
            <ActionButton onClick={() => onAction('declineFriend', notif)}>Decline</ActionButton>
          </div>
        )}
        {notif.type === 'group_invite' && unread && (
          <div className="flex gap-2 mt-2">
            <ActionButton primary onClick={() => onAction('joinGroup', notif)}><Check className="w-3 h-3" /> Join Group</ActionButton>
            <ActionButton onClick={() => onAction('declineGroup', notif)}>Decline</ActionButton>
          </div>
        )}
        {canSendBack && (
          <div className="mt-2">
            {sentBack ? (
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">🙌 High five sent back</span>
            ) : (
              <ActionButton onClick={() => onSendBack(notif)}>🙌 High five back</ActionButton>
            )}
          </div>
        )}
      </div>
      {unread && <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-1.5" />}
    </div>
  );
}

export default function NotificationsSheet({ open, onClose, notifications, markRead, markAllRead, remove, patch, onChange }) {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const sendCheer = useSendCheer();
  const [sentBack, setSentBack] = useState({});

  const todayKey = getDateKey();
  const isToday = (n) => getDateKey(new Date(n.createdAt ?? n.created_date)) === todayKey;
  const today = notifications.filter(isToday);
  const earlier = notifications.filter((n) => !isToday(n));
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const openNotif = (n) => {
    markRead(n.id);
    const target = {
      cheer: `/user-detail?id=${n.relatedId}`,
      high_five: `/user-detail?id=${n.relatedId}`,
      nudge: `/user-detail?id=${n.relatedId}`,
      weekly_recap: `/group-detail?id=${n.relatedId}`,
      league_promotion: `/group-detail?id=${n.relatedId}`,
    }[n.type];
    if (target && n.relatedId) { onClose(); navigate(target); }
  };

  const sendBack = async (n) => {
    setSentBack((prev) => ({ ...prev, [n.id]: true }));
    markRead(n.id);
    // Keyed to this notification, so every cheer you got can be answered with its own high five.
    const ok = await sendCheer({ toUserId: n.relatedId, kind: 'high_five', targetType: 'profile', targetKey: `hb:${n.id}`, silent: true });
    if (!ok) { setSentBack((prev) => ({ ...prev, [n.id]: false })); return; }
    toast('🙌 High five sent back!', { duration: 1400 });
    // Remember it on the notification itself, so it shows as sent on every device, forever.
    const payload = { ...(n.payload ?? {}), sentBack: true };
    patch?.(n.id, { payload });
    base44.entities.Notification.update(n.id, { payload }).catch(() => {});
  };

  const onAction = async (action, n) => {
    if (action === 'acceptFriend') {
      try { await base44.functions.invoke('acceptFriendRequest', { friendshipId: n.relatedId }); toast.success('Friend accepted!'); }
      catch { toast('Request no longer available'); }
      markRead(n.id);
      onChange?.();
    }
    if (action === 'declineFriend') {
      // Only a still-pending request is deleted, never a friendship that was already accepted.
      let alreadyFriends = false;
      try {
        const [friendship] = n.relatedId ? await base44.entities.Friendship.filter({ id: n.relatedId }) : [];
        if (friendship?.status === 'pending') await base44.entities.Friendship.delete(friendship.id);
        alreadyFriends = friendship?.status === 'accepted';
      } catch { /* already gone */ }
      remove(n.id);
      toast(alreadyFriends ? "You're already friends" : 'Request declined');
      onChange?.();
    }
    if (action === 'joinGroup') {
      try {
        await base44.functions.invoke('joinGroup', { groupId: n.relatedId });
        updateUser({ groupIds: [...(user.groupIds ?? []), n.relatedId] });
        toast.success('Joined the group!');
        markRead(n.id);
        onChange?.();
        onClose();
        navigate(`/group-detail?id=${n.relatedId}`);
      } catch { toast.error('Could not join group'); }
    }
    if (action === 'declineGroup') {
      remove(n.id);
      toast('Invite declined');
    }
  };

  const section = (title, list) => list.length > 0 && (
    <div>
      <p className="px-4 pt-4 pb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
      <div className="divide-y divide-border">
        {list.map((n) => (
          <NotificationRow key={n.id} notif={n} onOpen={openNotif} onAction={onAction} sentBack={sentBack[n.id] || n.payload?.sentBack} onSendBack={sendBack} />
        ))}
      </div>
    </div>
  );

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="relative bg-card rounded-t-3xl max-h-[85vh] flex flex-col max-w-lg w-full mx-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex justify-center pt-2.5"><div className="w-10 h-1 rounded-full bg-muted-foreground/25" /></div>
            <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Notifications</h2>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs font-semibold text-muted-foreground">Mark all read</button>
                )}
                <button onClick={onClose} aria-label="Close" className="h-8 w-8 flex items-center justify-center rounded-full bg-muted">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto pb-6">
              {notifications.length === 0 ? (
                <div className="py-14 flex flex-col items-center gap-2">
                  <Bell className="w-7 h-7 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground/70">Cheers from friends will show up here</p>
                </div>
              ) : (
                <>
                  {section('Today', today)}
                  {section('Earlier', earlier)}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
