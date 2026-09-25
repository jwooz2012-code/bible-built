import React from 'react';
import { motion } from 'framer-motion';
import { CHEER_KINDS, joinNames } from './cheers';

/**
 * Four reactions under a feed card. On your own cards it just shows who cheered you.
 */
export default function ReactionBar({ cheers = [], meId, isMine, onCheer }) {
  const myCheer = cheers.find((c) => c.fromUserId === meId);
  const counts = Object.fromEntries(CHEER_KINDS.map((k) => [k.id, cheers.filter((c) => c.kind === k.id).length]));
  const others = [...new Map(cheers.filter((c) => c.fromUserId !== meId).map((c) => [c.fromUserId, c.fromName])).values()];
  const kindsUsed = CHEER_KINDS.filter((k) => counts[k.id] > 0).map((k) => k.emoji).join('');

  const summary = others.length > 0 && (
    <p className="text-xs text-muted-foreground mt-2 truncate">
      <span className="mr-1">{kindsUsed}</span>
      {others.length > 3 ? `${others.slice(0, 2).join(', ')} +${others.length - 2}` : joinNames(others)}
      {isMine ? ' cheered you on' : ''}
    </p>
  );

  if (isMine) {
    return summary || <p className="text-xs text-muted-foreground/60 mt-2">Cheers from friends show up here</p>;
  }

  return (
    <div>
      <div className="flex gap-1.5 mt-2.5">
        {CHEER_KINDS.map((k) => {
          const active = myCheer?.kind === k.id;
          return (
            <motion.button
              key={k.id}
              whileTap={{ scale: 0.8 }}
              onClick={() => onCheer(k.id)}
              aria-label={k.label}
              aria-pressed={active}
              title={k.label}
              className="flex-1 h-9 rounded-xl flex items-center justify-center gap-1 text-[13px] font-bold transition-colors"
              style={active
                ? { background: 'rgba(245,158,11,0.18)', color: '#B45309', boxShadow: 'inset 0 0 0 1.5px rgba(245,158,11,0.55)' }
                : { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
            >
              <motion.span key={active ? 'on' : 'off'} initial={active ? { scale: 1.6 } : false} animate={{ scale: 1 }} className="text-base leading-none">
                {k.emoji}
              </motion.span>
              {counts[k.id] > 0 && <span className="tabular-nums">{counts[k.id]}</span>}
            </motion.button>
          );
        })}
      </div>
      {summary}
    </div>
  );
}
