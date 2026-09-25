import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { AvatarDisplay } from '@/components/profile/AvatarPicker';
import CheerButton from './CheerButton';
import { firstName } from './cheers';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function PlanRow({ label, plan, you }) {
  if (!plan) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-foreground w-12 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${plan.percent}%`, background: you ? '#22C55E' : '#3B82F6' }} />
      </div>
      <span className="text-xs font-bold text-muted-foreground tabular-nums w-9 text-right">{plan.percent}%</span>
      <span className="text-sm w-5 text-center" aria-label={plan.todayDone ? "Today's reading done" : "Today's reading not done"}>{plan.todayDone ? '✅' : '⏳'}</span>
    </div>
  );
}

/** You and a buddy side by side: this week, days in a row together, and plan progress. */
export default function BuddyCard({ buddy, onEnd }) {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const { other, stats, planName } = buddy;
  const name = firstName(other, 'Buddy');
  if (!stats) return null;
  const plans = stats.plans;
  const samePlan = plans?.me && plans?.them && plans.me.name === plans.them.name;

  let nudge;
  if (stats.meToday && stats.themToday) nudge = 'You both read today! 🙌';
  else if (stats.themToday) nudge = `${name} read today. Your turn! 📖`;
  else if (stats.meToday) nudge = `You read today. Cheer ${name} on!`;
  else nudge = 'Neither of you has read yet today';

  return (
    <div className="rounded-2xl border border-border bg-card p-4" data-testid="buddy-card">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/user-detail?id=${other.id}`)} className="flex -space-x-2 shrink-0" aria-label={`Open ${name}'s profile`}>
          <AvatarDisplay initials={name[0]} avatarData={other} size={40} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-foreground truncate">You & {name}</p>
        </div>
        <CheerButton toUser={other} />
        <div className="relative">
          <button onClick={() => setMenu((m) => !m)} aria-label="Buddy options" className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
          {menu && (
            <div className="absolute right-0 top-9 z-10 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              <button onClick={() => { setMenu(false); onEnd(buddy); }} className="px-4 py-2.5 text-sm font-semibold text-red-600 whitespace-nowrap">
                End buddy pairing
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-foreground mt-2.5">{nudge}</p>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-xl px-3 py-2" style={{ background: 'rgba(249,115,22,0.12)' }}>
          <span className="text-lg leading-none">🔥</span>
          <div>
            <p className="text-base font-black text-foreground leading-none tabular-nums">{stats.streak}</p>
            <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">{stats.streak === 1 ? 'day' : 'days'} together</p>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-7 gap-1">
          {stats.week.map((d) => {
            const day = new Date(`${d.dateKey}T12:00:00`).getDay();
            return (
              <div key={d.dateKey} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground">{DAY_LETTERS[day]}</span>
                <span className="w-3 h-3 rounded-full" title="You" style={{ background: d.me ? '#22C55E' : 'hsl(var(--muted))' }} />
                <span className="w-3 h-3 rounded-full" title={name} style={{ background: d.them ? '#3B82F6' : 'hsl(var(--muted))' }} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-[10px] font-semibold text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> You</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> {name}</span>
      </div>

      {plans && (plans.me || plans.them) && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">
            {samePlan ? `Reading "${plans.me.name}" together` : `Shared plan: "${planName}"`}
            {samePlan && plans.me.todayLabel ? ` · Today: ${plans.me.todayLabel}` : ''}
          </p>
          <PlanRow label="You" plan={plans.me} you />
          <PlanRow label={name} plan={plans.them} />
        </div>
      )}
    </div>
  );
}
