import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AvatarDisplay } from '@/components/profile/AvatarPicker';
import { firstName } from './cheers';

/** Story-style row: who has read today (green ring) and who hasn't yet. */
export default function ReadTodayStrip({ people, meId }) {
  const navigate = useNavigate();
  if (people.length === 0) return null;
  const sorted = [...people].sort((a, b) => (b.user.id === meId) - (a.user.id === meId) || b.readToday - a.readToday);
  const readCount = people.filter((p) => p.readToday).length;

  return (
    <div className="mb-5" data-testid="read-today">
      <div className="flex items-baseline justify-between mb-2.5">
        <h3 className="text-sm font-bold text-foreground">Read today</h3>
        <span className="text-xs font-semibold text-muted-foreground tabular-nums">{readCount} of {people.length}</span>
      </div>
      <div className="flex gap-3.5 overflow-x-auto pb-1 -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
        {sorted.map(({ user, readToday, book }) => {
          const isMe = user.id === meId;
          return (
            <button
              key={user.id}
              onClick={() => navigate(`/user-detail?id=${user.id}`)}
              className="flex flex-col items-center gap-1 w-16 shrink-0"
              aria-label={`${isMe ? 'You' : firstName(user)}${readToday ? ', read today' : ", hasn't read yet"}`}
            >
              <div className="relative rounded-full p-[3px]" style={{ background: readToday ? 'linear-gradient(135deg,#22C55E,#16A34A)' : 'hsl(var(--muted))' }}>
                <div className="rounded-full p-[2px] bg-background" style={{ opacity: readToday ? 1 : 0.6 }}>
                  <AvatarDisplay initials={firstName(user, '?')[0]?.toUpperCase()} avatarData={user} size={48} />
                </div>
                {readToday && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-green-500 text-white text-[11px] font-black flex items-center justify-center ring-2 ring-background">✓</span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-foreground truncate w-full text-center">{isMe ? 'You' : firstName(user)}</span>
              <span className="text-[10px] text-muted-foreground truncate w-full text-center -mt-1">{readToday ? (book ?? 'Read') : 'Not yet'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
