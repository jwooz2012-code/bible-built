import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarDisplay } from '@/components/profile/AvatarPicker';
import { CHEER_KINDS, firstName, profileCheerKey } from './cheers';
import { useCheersFor, useSendCheer } from './useCheers';
import { useAuth } from '@/lib/AuthContext';

/** Big reaction tiles for cheering a person (not a specific reading). */
export function CheerTiles({ toUser, onSent, compact }) {
  const { user } = useAuth();
  const sendCheer = useSendCheer();
  const key = profileCheerKey(toUser.id);
  const { byTarget } = useCheersFor([toUser.id]);
  const mine = (byTarget[key] ?? []).find((c) => c.fromUserId === user?.id);

  return (
    <div className={`grid grid-cols-4 ${compact ? 'gap-2' : 'gap-2.5'}`}>
      {CHEER_KINDS.map((k) => {
        const active = mine?.kind === k.id;
        return (
          <motion.button
            key={k.id}
            whileTap={{ scale: 0.88 }}
            aria-pressed={active}
            onClick={async () => {
              const res = await sendCheer({ toUserId: toUser.id, kind: k.id, targetType: 'profile', targetKey: key, label: '' });
              if (res) onSent?.(k);
            }}
            className="rounded-2xl flex flex-col items-center justify-center gap-1 py-3 px-1 transition-colors"
            style={active
              ? { background: 'rgba(245,158,11,0.18)', boxShadow: 'inset 0 0 0 2px rgba(245,158,11,0.6)' }
              : { background: 'hsl(var(--muted))' }}
          >
            <span className={compact ? 'text-2xl' : 'text-3xl'}>{k.emoji}</span>
            <span className="text-[11px] font-semibold text-foreground leading-tight text-center">{k.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

/** "Cheer" pill that opens a sheet to encourage someone. */
export default function CheerButton({ toUser, className = '', label = 'Cheer' }) {
  const [open, setOpen] = useState(false);
  if (!toUser?.id) return null;
  const name = firstName(toUser, 'them');

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        aria-label={`Cheer on ${name}`}
        className={`flex items-center gap-1 h-8 px-2.5 min-[360px]:px-3 rounded-full text-xs font-bold shrink-0 ${className}`}
        style={{ background: 'rgba(245,158,11,0.15)', color: '#B45309' }}
      >
        <span className="text-sm leading-none">🙌</span>
        {/* Just the emoji on the smallest phones so names have room */}
        <span className="hidden min-[360px]:inline">{label}</span>
      </motion.button>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div className="fixed inset-0 z-[70] flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
              <motion.div
                role="dialog"
                aria-label={`Cheer on ${name}`}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                className="relative bg-card rounded-t-3xl px-5 pt-3 pb-8 max-w-lg w-full mx-auto"
                style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
              >
                <div className="flex justify-center mb-4"><div className="w-10 h-1 rounded-full bg-muted-foreground/25" /></div>
                <div className="flex items-center gap-3 mb-4">
                  <AvatarDisplay initials={name[0]?.toUpperCase()} avatarData={toUser} size={44} />
                  <div>
                    <p className="text-lg font-bold text-foreground leading-tight">Cheer on {name}</p>
                    <p className="text-xs text-muted-foreground">They'll get a notification from you</p>
                  </div>
                </div>
                <CheerTiles toUser={toUser} onSent={() => setTimeout(() => setOpen(false), 350)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
