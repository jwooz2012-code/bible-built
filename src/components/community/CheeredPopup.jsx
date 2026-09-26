import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useCelebration } from '@/components/celebration/CelebrationContext';
import { useNotifications } from '@/components/notifications/useNotifications';
import { AvatarDisplay } from '@/components/profile/AvatarPicker';
import { cheerKind, ENCOURAGEMENT_TYPES, firstName, joinNames } from './cheers';

const SESSION_FLAG = 'bb_cheered_popup_shown';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const emojiFor = (n) => (n.type === 'cheer' ? cheerKind(n.payload?.kind).emoji : n.type === 'nudge' ? '🙏' : '🙌');

/** "Sarah, Jake and 2 others cheered you on" — shown on Home when new encouragement arrived. */
export default function CheeredPopup({ blocked }) {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { current: celebration } = useCelebration();
  const { notifications, markRead } = useNotifications(user?.id);
  const [senders, setSenders] = useState({});
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(() => { try { return sessionStorage.getItem(SESSION_FLAG) === '1'; } catch { return false; } });

  const fresh = useMemo(() => {
    const seenAt = user?.cheersSeenAt ? new Date(user.cheersSeenAt).getTime() : Date.now() - WEEK_MS;
    return notifications.filter((n) => !n.isRead
      && ENCOURAGEMENT_TYPES.includes(n.type)
      && new Date(n.createdAt ?? n.created_date).getTime() > seenAt);
  }, [notifications, user?.cheersSeenAt]);

  const senderIds = useMemo(() => [...new Set(fresh.map((n) => n.relatedId).filter(Boolean))], [fresh]);

  useEffect(() => {
    if (done || open || blocked || celebration || fresh.length === 0) return;
    let cancelled = false;
    base44.functions.invoke('getUsersByIds', { ids: senderIds.slice(0, 8) })
      .then((res) => {
        if (cancelled) return;
        const map = {};
        (res.data?.users ?? []).forEach((u) => { map[u.id] = u; });
        setSenders(map);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setOpen(true); });
    return () => { cancelled = true; };
  }, [done, open, blocked, celebration, fresh.length, senderIds]);

  const close = (goToAll) => {
    setOpen(false);
    setDone(true);
    try { sessionStorage.setItem(SESSION_FLAG, '1'); } catch { /* private mode */ }
    const now = new Date().toISOString();
    updateUser({ cheersSeenAt: now });
    base44.auth.updateMe({ cheersSeenAt: now }).catch(() => {});
    markRead(fresh.map((n) => n.id));
    if (goToAll) navigate('/social?notifications=1');
  };

  const names = senderIds.map((id) => firstName(senders[id], null)).filter(Boolean);
  const headline = names.length ? `${joinNames(names)} cheered you on!` : 'Your friends cheered you on!';

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-center justify-center px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50" onClick={() => close(false)} />
          <motion.div
            role="dialog"
            aria-label="You got cheered"
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="relative w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-2xl"
          >
            <div className="flex justify-center -space-x-3 mb-3">
              {senderIds.slice(0, 4).map((id) => (
                <div key={id} className="rounded-full ring-4 ring-card">
                  <AvatarDisplay initials={firstName(senders[id], '?')[0]?.toUpperCase()} avatarData={senders[id]} size={52} />
                </div>
              ))}
            </div>
            <motion.div initial={{ rotate: -20, scale: 0.5 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.15, type: 'spring' }} className="text-4xl">🙌</motion.div>
            <h2 className="text-xl font-black text-foreground mt-2 leading-tight">{headline}</h2>
            <div className="mt-4 space-y-2 text-left">
              {fresh.slice(0, 4).map((n) => (
                <div key={n.id} className="flex items-start gap-2.5 rounded-xl bg-muted/60 px-3 py-2">
                  <span className="text-lg leading-none mt-0.5">{emojiFor(n)}</span>
                  <p className="text-[13px] text-foreground leading-snug">{n.message}</p>
                </div>
              ))}
              {fresh.length > 4 && <p className="text-xs text-muted-foreground text-center">+{fresh.length - 4} more</p>}
            </div>
            <button
              onClick={() => close(false)}
              className="mt-5 w-full h-12 rounded-full text-base font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}
            >
              Thanks! 🙌
            </button>
            <button onClick={() => close(true)} className="mt-2 w-full h-10 rounded-full text-sm font-semibold text-muted-foreground">
              See all & cheer back
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
