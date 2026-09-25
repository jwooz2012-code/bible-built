import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { AvatarDisplay } from '@/components/profile/AvatarPicker';
import ReactionBar from './ReactionBar';
import { displayName, timeAgo } from './cheers';

const MILESTONE_STYLE = {
  book: { emoji: '🎉', bg: 'linear-gradient(135deg, rgba(34,197,94,0.16), rgba(16,185,129,0.06))', border: 'rgba(34,197,94,0.35)' },
  streak: { emoji: '🔥', bg: 'linear-gradient(135deg, rgba(249,115,22,0.16), rgba(245,158,11,0.06))', border: 'rgba(249,115,22,0.35)' },
};

export default function FeedCard({ item, user, isMine, cheers, meId, onCheer, onOpenProfile, index = 0 }) {
  const name = isMine ? 'You' : displayName(user, 'A friend');
  const milestone = item.type === 'milestone' ? MILESTONE_STYLE[item.kind] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.03 }}
      className="rounded-2xl border bg-card px-4 py-3.5"
      style={milestone ? { background: milestone.bg, borderColor: milestone.border } : { borderColor: 'hsl(var(--border))' }}
      data-feed-key={item.key}
    >
      <div className="flex items-center gap-3">
        <button onClick={onOpenProfile} className="shrink-0" aria-label={`Open ${name}'s profile`}>
          <AvatarDisplay initials={name[0]?.toUpperCase() ?? '?'} avatarData={user} size={milestone ? 44 : 38} />
        </button>
        <div className="flex-1 min-w-0">
          {milestone ? (
            <p className="text-[15px] leading-snug text-foreground">
              <span className="font-bold">{name}</span>{' '}
              {item.kind === 'book'
                ? <>finished <span className="font-bold">{item.book}</span>!</>
                : <>hit a <span className="font-bold">{item.days}-day streak</span>!</>}
            </p>
          ) : (
            <p className="text-sm font-bold text-foreground truncate">{name}</p>
          )}
          <p className="text-xs text-muted-foreground">{timeAgo(item.time)}</p>
        </div>
        {milestone ? (
          <span className="text-3xl shrink-0">{milestone.emoji}</span>
        ) : item.testament && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.testament === 'NT'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
            {item.testament}
          </span>
        )}
      </div>

      {!milestone && (
        <div className="flex items-center gap-2 mt-2">
          <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-sm text-foreground">
            Read <span className="font-semibold">{item.label}</span>
            {item.count > 1 && <span className="text-muted-foreground"> · {item.count} chapters</span>}
          </p>
        </div>
      )}

      <ReactionBar cheers={cheers} meId={meId} isMine={isMine} onCheer={onCheer} />
    </motion.div>
  );
}
