import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, UserPlus, Star, Landmark, Lock } from 'lucide-react';

const PREVIEW_CARDS = [
{
  icon: Users,
  title: 'Groups',
  description: 'Form a circle. Read together. Hold each other accountable.',
  color: 'from-blue-900/70 to-blue-950/90',
  border: 'border-blue-600/50',
  iconColor: 'text-blue-300'
},
{
  icon: UserPlus,
  title: 'Friends',
  description: 'Add friends, see their progress, and cheer each other on.',
  color: 'from-emerald-900/70 to-emerald-950/90',
  border: 'border-emerald-600/50',
  iconColor: 'text-emerald-300'
},
{
  icon: Star,
  title: 'Community',
  description: 'Compete, celebrate milestones, and rise in the standings.',
  color: 'from-violet-900/70 to-violet-950/90',
  border: 'border-violet-600/50',
  iconColor: 'text-violet-300'
}];


export default function BuildersLocked() {
  const navigate = useNavigate();
  const treasuryRef = useRef(null);

  return (
    <div className="min-h-screen bg-background pb-28" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Hero */}
      <div className="relative overflow-hidden px-5 pt-8 pb-12 text-center" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(33, 150, 243, 0.08))' }}>
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, #22C55E 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, #FF9500 0%, transparent 70%)' }} />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 mb-6 relative z-10" style={{ borderColor: '#22C55E', backgroundColor: 'rgba(34, 197, 94, 0.15)' }}>
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Coming Soon</span>
        </div>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 relative z-10" style={{ borderColor: '#22C55E', backgroundColor: 'rgba(34, 197, 94, 0.12)' }}>
          <Shield className="h-9 w-9" style={{ color: '#22C55E' }} />
        </div>

        <h1 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight relative z-10">It's Almost Ready!</h1>
        <p className="text-base text-foreground/80 leading-relaxed max-w-xs mx-auto mb-2 font-medium relative z-10">
          A new way to build, connect, compete, and collect is being forged right now.
        </p>
        <p className="text-sm text-foreground/60 max-w-xs mx-auto relative z-10">
          Keep tracking what matters. Your progress now will matter when Builders opens.
        </p>

        <div className="mt-8 inline-flex flex-col items-start gap-2.5 rounded-2xl border-2 px-5 py-4 text-left relative z-10" style={{ borderColor: 'rgba(34, 197, 94, 0.5)', backgroundColor: 'rgba(34, 197, 94, 0.08)' }}>
          {[
          'Add friends',
          'Join groups',
          'Unlock exclusive rewards',
          'Grow your artifact collection'].
          map((item) =>
          <div key={item} className="flex items-center gap-2.5 text-sm text-foreground font-semibold">
              <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: '#22C55E' }} />
              {item}
            </div>
          )}
        </div>
      </div>

      {/* Preview cards */}
      <div className="max-w-lg mx-auto px-5 mt-6 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">What's Coming</p>

        {PREVIEW_CARDS.map((card) =>
        <div
          key={card.title}
          className="relative rounded-2xl border-2 p-4 flex items-center gap-4 overflow-hidden" style={{ borderColor: card.border.split('border-')[1].split('/')[0] === 'blue' ? '#2196F3' : card.border.split('border-')[1].split('/')[0] === 'emerald' ? '#22C55E' : '#A78BFA', background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' }}>
          
            {/* Subtle overlay for text clarity */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />

            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-black/30 border border-white/15 shrink-0">
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>

            <div className="relative flex-1 min-w-0">
              <p className="text-sm font-extrabold text-white tracking-wide">{card.title}</p>
              <p className="text-xs text-white/85 leading-relaxed mt-0.5 font-medium">{card.description}</p>
            </div>

            {/* Lock badge */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 shrink-0" style={{ borderColor: 'rgba(255, 255, 255, 0.3)', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
              <Lock className="h-4 w-4 text-foreground/60" />
            </div>
          </div>
        )}

        {/* Treasury preview card */}
        <div
          ref={treasuryRef}
          onClick={() => navigate('/treasury')}
          className="relative rounded-2xl border-2 cursor-pointer active:scale-95 transition-transform p-4 overflow-hidden" style={{ borderColor: '#FF9500', background: 'linear-gradient(135deg, rgba(255, 149, 0, 0.12), rgba(255, 149, 0, 0.06))' }}>
          
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.10),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 shrink-0" style={{ borderColor: '#FF9500', backgroundColor: 'rgba(255, 149, 0, 0.12)' }}>
              <Landmark className="h-5 w-5" style={{ color: '#FF9500' }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-extrabold text-foreground tracking-wide">Treasury</p>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ borderColor: '#FF9500', color: '#FF9500', backgroundColor: 'rgba(255, 149, 0, 0.15)' }}>Builders</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2" style={{ borderColor: '#FF9500', backgroundColor: 'rgba(255, 149, 0, 0.15)' }}>
                    <Lock className="h-4 w-4" style={{ color: '#FF9500' }} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-foreground/85 font-semibold leading-relaxed">
                Spend XP. Unlock artifacts. Build your collection.
              </p>
              <p className="text-xs text-foreground/65 mt-1.5 font-medium leading-relaxed">
                Your XP is accumulating now. Every chapter read gets you closer to your first artifact.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="max-w-lg mx-auto px-5 mt-8 flex gap-3">
        <button
          onClick={() => navigate('/home')}
          className="flex-1 py-4 rounded-2xl font-bold text-white text-sm active:scale-95 transition-all shadow-lg" style={{ backgroundColor: '#22C55E', boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)' }}>
          Back to Home
        </button>
        <button
          onClick={() => navigate('/treasury')}
          className="flex-1 py-4 rounded-2xl font-bold text-sm text-white active:scale-95 transition-all shadow-lg" style={{ backgroundColor: '#FF9500', boxShadow: '0 10px 25px rgba(255, 149, 0, 0.3)' }}>
          Preview Treasury
        </button>
      </div>
    </div>);
}