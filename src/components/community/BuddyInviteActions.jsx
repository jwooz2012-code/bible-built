import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useReadingPlan } from '@/components/bible/hooks/useReadingPlan';
import { useBuddies, joinBuddyPlan } from './useBuddies';

/** Asks whether to switch to the buddy's plan after accepting an invite that shares one. */
export function JoinPlanDialog({ open, buddyId, planName, onClose }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: myPlan } = useReadingPlan(user?.id);
  const [busy, setBusy] = useState(false);
  const hasOwnPlan = myPlan && myPlan.scope !== 'NONE';

  const join = async () => {
    setBusy(true);
    try {
      await joinBuddyPlan({ buddyId, userId: user.id, existingPlan: myPlan, queryClient });
      toast.success(`You're reading "${planName}" together! 📖`);
      onClose(true);
    } catch (err) {
      toast.error(err?.message || 'Could not join the plan');
      setBusy(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50" />
          <motion.div role="dialog" aria-label="Read the plan together" initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="relative w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-2xl">
            <div className="text-4xl">📖🤝</div>
            <h2 className="text-lg font-black text-foreground mt-2">Read "{planName}" together?</h2>
            <p className="text-sm text-muted-foreground mt-2">
              You'll read the same chapters on the same days, starting today.
            </p>
            {hasOwnPlan && (
              <p className="text-sm font-semibold mt-3 rounded-xl px-3 py-2" style={{ background: 'rgba(245,158,11,0.12)', color: '#B45309' }}>
                This replaces your current plan, "{myPlan.name || 'your plan'}".
              </p>
            )}
            <button onClick={join} disabled={busy}
              className="mt-5 w-full h-12 rounded-full text-base font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
              {busy ? 'Setting up…' : 'Join the plan'}
            </button>
            <button onClick={() => onClose(false)} disabled={busy} className="mt-2 w-full h-10 rounded-full text-sm font-semibold text-muted-foreground">
              Keep my own plan
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Accept / Decline for a buddy invite (in notifications or on the Friends tab). */
export default function BuddyInviteActions({ notif, buddyId: buddyIdProp, planName: planNameProp, onDone }) {
  const { user } = useAuth();
  const { respond, refresh } = useBuddies(user?.id);
  const buddyId = buddyIdProp ?? notif?.relatedId;
  const planName = planNameProp ?? notif?.payload?.planName;
  const [busy, setBusy] = useState(false);
  const [askPlan, setAskPlan] = useState(false);

  const answer = async (accept) => {
    setBusy(true);
    try {
      await respond(buddyId, accept, { refresh: !(accept && planName) });
      if (accept) {
        toast.success('You have a new reading buddy! 🤝');
        if (planName) { setAskPlan(true); return; }
      } else {
        toast('Invite declined');
      }
      onDone?.();
    } catch {
      toast.error('This invite is no longer available');
      onDone?.();
    }
    setBusy(false);
  };

  return (
    <>
      <div className="flex gap-2 mt-2">
        <button onClick={(e) => { e.stopPropagation(); answer(true); }} disabled={busy}
          className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold disabled:opacity-50"
          style={{ background: 'rgba(34,197,94,0.15)', color: '#16A34A' }}>
          <Check className="w-3 h-3" /> Accept
        </button>
        <button onClick={(e) => { e.stopPropagation(); answer(false); }} disabled={busy}
          className="h-8 px-3 rounded-lg text-xs font-semibold bg-muted text-muted-foreground disabled:opacity-50">
          Decline
        </button>
      </div>
      <JoinPlanDialog open={askPlan} buddyId={buddyId} planName={planName} onClose={() => { setAskPlan(false); setBusy(false); refresh(); onDone?.(); }} />
    </>
  );
}
