import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { AvatarDisplay } from '@/components/profile/AvatarPicker';
import { useReadingPlan } from '@/components/bible/hooks/useReadingPlan';
import { useNotifications } from '@/components/notifications/useNotifications';
import { useBuddies, MAX_BUDDIES } from './useBuddies';
import BuddyCard from './BuddyCard';
import BuddyInviteActions from './BuddyInviteActions';
import { displayName, firstName } from './cheers';

/** Pick a friend to invite, optionally sharing your current plan. */
export function BuddyInviteSheet({ open, onClose, friends, preselectId }) {
  const { user } = useAuth();
  const { buddies, invite } = useBuddies(user?.id);
  const { data: myPlan } = useReadingPlan(user?.id);
  const [selected, setSelected] = useState(preselectId ?? null);
  const [sharePlan, setSharePlan] = useState(true);
  const [busy, setBusy] = useState(false);
  const taken = new Set(buddies.map((b) => b.other.id));
  const choices = friends.filter((f) => !taken.has(f.id));
  const hasPlan = myPlan && myPlan.scope !== 'NONE';

  const send = async () => {
    const friend = friends.find((f) => f.id === selected);
    if (!friend) return;
    setBusy(true);
    try {
      await invite(friend.id, hasPlan && sharePlan);
      toast.success(`Buddy invite sent to ${firstName(friend)}! 🤝`);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not send the invite');
    }
    setBusy(false);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div role="dialog" aria-label="Invite a reading buddy"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="relative bg-card rounded-t-3xl px-5 pt-3 max-w-lg w-full mx-auto max-h-[85vh] flex flex-col"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
            <div className="flex justify-center mb-3"><div className="w-10 h-1 rounded-full bg-muted-foreground/25" /></div>
            <h2 className="text-lg font-bold text-foreground">Invite a reading buddy 🤝</h2>
            <p className="text-sm text-muted-foreground mt-1">See each other's daily reading side by side and keep a streak together.</p>

            <div className="mt-4 space-y-1.5 overflow-y-auto">
              {choices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">All your friends are already your buddies.</p>
              ) : choices.map((f) => (
                <button key={f.id} onClick={() => setSelected(f.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
                  style={selected === f.id ? { background: 'rgba(34,197,94,0.12)', boxShadow: 'inset 0 0 0 2px rgba(34,197,94,0.5)' } : { background: 'hsl(var(--muted))' }}>
                  <AvatarDisplay initials={firstName(f, '?')[0]} avatarData={f} size={36} />
                  <span className="flex-1 text-sm font-semibold text-foreground truncate">{displayName(f)}</span>
                  {selected === f.id && <span className="text-green-600 font-bold">✓</span>}
                </button>
              ))}
            </div>

            {hasPlan && (
              <label className="mt-4 flex items-start gap-3 rounded-xl bg-muted px-3 py-3 cursor-pointer">
                <input type="checkbox" checked={sharePlan} onChange={(e) => setSharePlan(e.target.checked)} className="mt-0.5 w-4 h-4 accent-green-600" />
                <span className="text-sm text-foreground">
                  Invite them to read <span className="font-semibold">"{myPlan.name || 'my plan'}"</span> with me
                  <span className="block text-xs text-muted-foreground mt-0.5">They can choose to join it or keep their own plan.</span>
                </span>
              </label>
            )}

            <button onClick={send} disabled={!selected || busy}
              className="mt-4 w-full h-12 rounded-full text-base font-bold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
              {busy ? 'Sending…' : 'Send invite'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Reading Buddies block at the top of the Friends tab. */
export default function BuddiesSection({ friends }) {
  const { user } = useAuth();
  const { buddies, end } = useBuddies(user?.id);
  const { notifications, markRead } = useNotifications(user?.id);
  const [inviting, setInviting] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(null);

  const accepted = buddies.filter((b) => b.status === 'accepted');
  const incoming = buddies.filter((b) => b.status === 'pending' && b.direction === 'incoming');
  const outgoing = buddies.filter((b) => b.status === 'pending' && b.direction === 'outgoing');
  const canInvite = buddies.length < MAX_BUDDIES && friends.length > 0;

  const clearInviteNotification = (buddyId) => markRead(notifications.filter((n) => n.type === 'buddy_invite' && n.relatedId === buddyId).map((n) => n.id));

  const doEnd = async () => {
    const b = confirmEnd;
    setConfirmEnd(null);
    try { await end(b.id); toast(b.status === 'pending' ? 'Invite canceled' : 'Buddy pairing ended'); }
    catch { toast.error('Could not update. Try again.'); }
  };

  return (
    <div data-testid="buddies-section">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-foreground">Reading Buddies</h2>
        {buddies.length > 0 && canInvite && (
          <button onClick={() => setInviting(true)} className="h-8 px-3 rounded-xl text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.12)', color: '#16A34A' }}>
            + Invite
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {incoming.map((b) => (
          <div key={b.id} className="rounded-2xl border-2 p-4 bg-card" style={{ borderColor: 'rgba(34,197,94,0.4)' }}>
            <div className="flex items-center gap-3">
              <AvatarDisplay initials={firstName(b.other, '?')[0]} avatarData={b.other} size={40} />
              <p className="flex-1 text-sm text-foreground">
                <span className="font-bold">{firstName(b.other)}</span> wants to be your reading buddy{b.planName ? <> for <span className="font-semibold">"{b.planName}"</span></> : ''} 📖
              </p>
            </div>
            <BuddyInviteActions buddyId={b.id} planName={b.planName} onDone={() => clearInviteNotification(b.id)} />
          </div>
        ))}

        {accepted.map((b) => <BuddyCard key={b.id} buddy={b} onEnd={setConfirmEnd} />)}

        {outgoing.map((b) => (
          <div key={b.id} className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-4 py-3">
            <AvatarDisplay initials={firstName(b.other, '?')[0]} avatarData={b.other} size={32} />
            <p className="flex-1 text-sm text-muted-foreground">Waiting for <span className="font-semibold text-foreground">{firstName(b.other)}</span> to accept…</p>
            <button onClick={() => setConfirmEnd(b)} className="text-xs font-semibold text-muted-foreground">Cancel</button>
          </div>
        ))}

        {buddies.length === 0 && (
          <div className="rounded-2xl p-4 border border-border" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.10), rgba(59,130,246,0.08))' }}>
            <div className="flex items-start gap-3">
              <span className="text-3xl">🤝</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">Read together with a buddy</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pair up with a friend to see each other's reading side by side, keep a streak together, and even share a plan.</p>
                <button onClick={() => setInviting(true)} disabled={!canInvite}
                  className="mt-3 h-9 px-4 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                  {friends.length ? 'Pick a buddy' : 'Add a friend first'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BuddyInviteSheet open={inviting} onClose={() => setInviting(false)} friends={friends} />

      {confirmEnd && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl" role="alertdialog">
            <p className="text-base font-semibold text-foreground mb-1">{confirmEnd.status === 'pending' ? 'Cancel this invite?' : `End your pairing with ${firstName(confirmEnd.other)}?`}</p>
            <p className="text-sm text-muted-foreground mb-5">You'll stay friends. Your reading and plans aren't affected.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmEnd(null)} className="flex-1 h-10 rounded-xl text-sm bg-muted text-muted-foreground font-semibold">Keep</button>
              <button onClick={doEnd} className="flex-1 h-10 rounded-xl text-sm font-semibold text-white" style={{ background: '#EF4444' }}>
                {confirmEnd.status === 'pending' ? 'Cancel invite' : 'End pairing'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
