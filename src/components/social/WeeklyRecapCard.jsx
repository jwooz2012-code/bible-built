import React from 'react';
import { Trophy } from 'lucide-react';
import { formatDateRange } from '@/components/bible/utils/dateUtils';

function Stat({ value, label }) {
  return (
    <div className="flex-1 rounded-xl px-2 py-2 text-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
      <p className="text-xl font-black text-foreground tabular-nums leading-none">{value}</p>
      <p className="text-[10px] font-semibold text-muted-foreground mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function Shoutout({ emoji, title, text }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-lg leading-none mt-0.5">{emoji}</span>
      <p className="text-[13px] text-foreground leading-snug">
        <span className="font-bold">{title}</span> {text}
      </p>
    </div>
  );
}

// Rich recap when the notification carries stats; older recaps only have a message.
export default function WeeklyRecapCard({ message, payload, onDismiss }) {
  const p = payload?.totalChapters ? payload : null;
  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 overflow-hidden mb-5"
      style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.06))' }}
      data-testid="weekly-recap">
      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(245,158,11,0.2)' }}>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-0.5">
              Weekly Recap 🏆{p?.weekStart && p?.weekEnd ? ` · ${formatDateRange(p.weekStart, p.weekEnd)}` : ''}
            </p>
            <p className="text-sm text-foreground leading-snug font-semibold">
              {p ? `${p.groupName} read ${p.totalChapters} chapters together!` : message}
            </p>
          </div>
          <button onClick={onDismiss} aria-label="Dismiss recap" className="text-muted-foreground text-xs shrink-0 mt-0.5">✕</button>
        </div>

        {p && (
          <>
            <div className="flex gap-2 mt-3">
              <Stat value={p.totalChapters} label="Chapters" />
              <Stat value={`${p.readers}/${p.memberCount}`} label="Readers" />
              <Stat value={p.booksFinished?.length ?? 0} label="Books done" />
            </div>
            <div className="mt-3 space-y-2">
              {p.topReader && <Shoutout emoji="📖" title={p.topReader.name} text={`led the way with ${p.topReader.count} chapters.`} />}
              {p.topEncourager && <Shoutout emoji="🙌" title={p.topEncourager.name} text={`was the top encourager with ${p.topEncourager.count} cheers.`} />}
              {p.booksFinished?.map((b, i) => (
                <Shoutout key={`${b.id}-${b.book}-${i}`} emoji="🎉" title={b.name} text={`finished ${b.book}.`} />
              ))}
              {p.everyDay?.length > 0 && (
                <Shoutout emoji="🔥" title={p.everyDay.map((m) => m.name).join(', ')} text="read every day this week." />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
