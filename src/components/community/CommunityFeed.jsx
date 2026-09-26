import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import FeedCard from './FeedCard';
import ReadTodayStrip from './ReadTodayStrip';
import { buildFeed, readOnDay, latestBookByUser } from './buildFeed';
import { useCheersFor, useSendCheer } from './useCheers';

const PAGE = 15;

/**
 * Friends/group activity: who read today, reading sessions, milestones, and reactions.
 * `people` are the users to show in the "Read today" row (include yourself).
 */
export default function CommunityFeed({ logs, usersById, people, meId, historyCap = 500, emptyTitle = 'No activity yet', emptyText }) {
  const navigate = useNavigate();
  const [shown, setShown] = useState(PAGE);
  const items = useMemo(() => buildFeed(logs, { historyCap }), [logs, historyCap]);
  const ownerIds = useMemo(() => [...new Set(items.map((i) => i.userId))], [items]);
  const { byTarget } = useCheersFor(ownerIds);
  const sendCheer = useSendCheer();

  const todayKey = getDateKey();
  const strip = useMemo(() => {
    const readers = readOnDay(logs, todayKey);
    const books = latestBookByUser(logs.filter((l) => l.dateKey === todayKey));
    return people.filter(Boolean).map((user) => ({ user, readToday: readers.has(user.id), book: books.get(user.id) }));
  }, [people, logs, todayKey]);

  return (
    <div>
      <ReadTodayStrip people={strip} meId={meId} />
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-12 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <div className="text-center px-6">
            <p className="text-sm font-semibold text-foreground">{emptyTitle}</p>
            {emptyText && <p className="text-xs text-muted-foreground mt-1">{emptyText}</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, shown).map((item, i) => (
            <FeedCard
              key={item.key}
              index={i}
              item={item}
              user={usersById[item.userId]}
              isMine={item.userId === meId}
              meId={meId}
              cheers={byTarget[item.key] ?? []}
              onOpenProfile={() => navigate(`/user-detail?id=${item.userId}`)}
              onCheer={(kind) => sendCheer({
                toUserId: item.userId,
                kind,
                targetType: item.type,
                targetKey: item.key,
                label: item.label,
              })}
            />
          ))}
          {items.length > shown && (
            <button
              onClick={() => setShown((n) => n + PAGE)}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-muted text-muted-foreground"
            >
              Show more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
