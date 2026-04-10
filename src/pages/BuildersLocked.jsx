import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, UserPlus, Star, Landmark, ChevronRight, Lock } from 'lucide-react';
import TreasuryEntryCard from '@/components/home/TreasuryEntryCard';

const PREVIEW_CARDS = [
  {
    icon: Users,
    title: 'Groups',
    description: 'Form a circle. Read together. Hold each other accountable.',
    color: 'from-blue-900/60 to-blue-950/80',
    border: 'border-blue-700/40',
    iconColor: 'text-blue-400',
  },
  {
    icon: UserPlus,
    title: 'Friends',
    description: 'Add friends, see their progress, and cheer each other on.',
    color: 'from-emerald-900/60 to-emerald-950/80',
    border: 'border-emerald-700/40',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Star,
    title: 'Community',
    description: 'Compete, celebrate milestones, and rise in the standings.',
    color: 'from-violet-900/60 to-violet-950/80',
    border: 'border-violet-700/40',
    iconColor: 'text-violet-400',
  },
];

export default function BuildersLocked() {
  const navigate = useNavigate();
  const treasuryRef = useRef(null);
  const [activeTab, setActiveTab] = useState('builders');

  const scrollToTreasury = () => {
    treasuryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Tab bar */}
      <div className="sticky z-10 bg-background border-b border-border px-5 pt-4 pb-0" style={{ top: 'env(safe-area-inset-top)' }}>
        <div className="flex gap-1 max-w-lg mx-auto">
          {[{ id: 'builders', label: 'Friends' }, { id: 'treasury', label: 'Treasury' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${
                activeTab === tab.id
                  ? 'text-foreground border-b-2 border-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {activeTab === 'treasury' && (
        <div className="max-w-lg mx-auto px-5 pt-6">
          <TreasuryEntryCard />
          <p className="text-xs text-muted-foreground text-center mt-2">Full Treasury launches with the Builders ecosystem.</p>
        </div>
      )}

      {activeTab === 'builders' && <>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-background px-5 pt-16 pb-12 text-center">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />
        </div>

        {/* Coming Soon badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 mb-6">
          <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs font-semibold text-violet-300 uppercase tracking-widest">Coming Soon</span>
        </div>

        {/* Lock icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm">
          <Shield className="h-9 w-9 text-white/80" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Builders Is Coming</h1>
        <p className="text-base text-slate-300 leading-relaxed max-w-xs mx-auto mb-2">
          A new way to build, connect, compete, and collect is being forged right now.
        </p>
        <p className="text-sm text-slate-400 max-w-xs mx-auto">
          Keep tracking what matters. Your progress now will matter when Builders opens.
        </p>

        {/* Teaser bullets */}
        <div className="mt-8 inline-flex flex-col items-start gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left backdrop-blur-sm mx-auto">
          {[
            'Build your standing',
            'Add friends',
            'Join groups',
            'Unlock exclusive rewards',
            'Grow your artifact collection',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Preview cards */}
      <div className="max-w-lg mx-auto px-5 mt-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">What's Coming</p>

        {PREVIEW_CARDS.map((card) => (
          <div
            key={card.title}
            className={`relative rounded-2xl border ${card.border} bg-gradient-to-br ${card.color} p-4 flex items-center gap-4 overflow-hidden`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-black/20 shrink-0`}>
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{card.title}</p>
              <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{card.description}</p>
            </div>
            <Lock className="h-4 w-4 text-slate-500 shrink-0" />
          </div>
        ))}

        {/* Treasury preview card */}
        <div
          ref={treasuryRef}
          className="relative rounded-2xl border border-yellow-700/50 bg-gradient-to-br from-yellow-950/70 via-amber-950/60 to-black p-4 overflow-hidden"
        >
          {/* Gold shimmer */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_60%)]" />

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/20 shrink-0">
              <Landmark className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-yellow-100">Treasury</p>
                <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-300 uppercase tracking-wider">Part of Builders</span>
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Spend XP. Unlock artifacts. Build your collection.
              </p>
              <p className="text-xs text-slate-400 mt-1.5">
                Your XP is accumulating now. Every chapter read gets you closer to your first artifact.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="max-w-lg mx-auto px-5 mt-8 space-y-3">
        <button
          onClick={() => navigate('/home')}
          className="w-full py-4 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 active:scale-95 transition-all shadow-lg"
        >
          Keep Building
        </button>
        <button
          onClick={() => setActiveTab('treasury')}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm text-slate-300 border border-white/10 bg-white/5 hover:bg-white/8 active:scale-95 transition-all"
        >
          Preview Treasury
        </button>
      </div>
      </>
      }
    </div>
  );
}