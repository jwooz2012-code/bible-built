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
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-blue-900 to-background px-5 pt-8 pb-12 text-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-400/10 px-3 py-1 mb-6">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-300 animate-pulse" />
          <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Coming Soon</span>
        </div>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/15 shadow-2xl backdrop-blur-sm relative">
          <Users className="h-9 w-9 text-blue-200" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-500 border-2 border-blue-950 flex items-center justify-center">
            <Lock className="h-3 w-3 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight">It's Almost Ready!</h1>
        <p className="text-base text-blue-100 leading-relaxed max-w-xs mx-auto mb-2 font-medium">
          A new way to build, connect, compete, and collect is being forged right now.
        </p>
        <p className="text-sm text-blue-200/70 max-w-xs mx-auto">
          Keep tracking what matters. Your progress now will matter when Builders opens.
        </p>

        <div className="mt-8 inline-flex flex-col items-start gap-2.5 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-5 py-4 text-left backdrop-blur-sm mx-auto">
          {[
          'Add friends',
          'Join groups',
          'Unlock exclusive rewards',
          'Grow your artifact collection'].
          map((item) =>
          <div key={item} className="flex items-center gap-2.5 text-sm text-white font-semibold">
              <div className="h-2 w-2 rounded-full bg-blue-300 shrink-0" />
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
          className={`relative rounded-2xl border ${card.border} bg-gradient-to-br ${card.color} p-4 flex items-center gap-4 overflow-hidden`}>
          
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
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-black/50 border border-white/25 shrink-0">
              <Lock className="h-4 w-4 text-white/80" />
            </div>
          </div>
        )}

        {/* Treasury preview card */}
        <div
          ref={treasuryRef}
          onClick={() => navigate('/treasury')}
          className="relative rounded-2xl border border-yellow-600/60 cursor-pointer active:scale-95 transition-transform bg-gradient-to-br from-yellow-950/80 via-amber-950/70 to-black p-4 overflow-hidden">
          
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.10),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/15 border border-yellow-500/35 shrink-0">
              <Landmark className="h-5 w-5 text-yellow-300" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-extrabold text-white tracking-wide">Treasury</p>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-yellow-500/50 bg-yellow-500/15 px-2 py-0.5 text-[10px] font-bold text-yellow-200 uppercase tracking-wider">Builders</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 border border-white/25">
                    <Lock className="h-4 w-4 text-white/80" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-amber-100 font-semibold leading-relaxed">
                Spend XP. Unlock artifacts. Build your collection.
              </p>
              <p className="text-xs text-amber-200/75 mt-1.5 font-medium leading-relaxed">
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
          className="flex-1 py-4 rounded-2xl font-bold text-white text-sm bg-violet-600 hover:bg-violet-500 active:scale-95 transition-all shadow-lg shadow-violet-900/30">
          Back to Home
        </button>
        <button
          onClick={() => navigate('/treasury')}
          className="flex-1 py-4 rounded-2xl font-bold text-sm text-amber-900 active:scale-95 transition-all bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-900/20">
          Preview Treasury
        </button>
      </div>
    </div>);
}