import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gem, BookOpen, Shield, Crown, Landmark, Lock } from 'lucide-react';

const ARTIFACTS = [
  { name: 'Ark of the Covenant', icon: Shield, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', desc: "The dwelling place of God's presence" },
  { name: 'Crown of Thorns', icon: Crown, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/30', desc: 'Worn by the King of Kings' },
  { name: 'Scroll of Isaiah', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', desc: 'Ancient prophecies of the Messiah' },
  { name: 'Shepherd\'s Staff', icon: Gem, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', desc: 'Symbol of guidance and provision' },
];

export default function TreasuryPreviewPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold text-foreground">Treasury</h2>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-amber-950/80 via-yellow-950/60 to-background px-5 pt-8 pb-12 text-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-80 w-80 rounded-full bg-yellow-500/8 blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/50 bg-yellow-500/15 px-3 py-1 mb-6">
          <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-xs font-bold text-yellow-200 uppercase tracking-widest">Coming Soon</span>
        </div>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 shadow-2xl backdrop-blur-sm">
          <Landmark className="h-9 w-9 text-yellow-300" />
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Treasury Coming Soon!</h1>
        <p className="text-base text-amber-100/90 leading-relaxed max-w-xs mx-auto mb-2 font-medium">
          Embark on a journey to collect sacred artifacts and uncover their stories.
        </p>
        <p className="text-sm text-amber-200/70 max-w-xs mx-auto font-medium">
          Each artifact you discover will enrich your spiritual path.
        </p>
      </div>

      {/* Artifact preview */}
      <div className="max-w-lg mx-auto px-5 mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">A Glimpse of What Awaits</p>

        <div className="space-y-3">
          {ARTIFACTS.map((artifact) => (
            <div
              key={artifact.name}
              className={`relative rounded-2xl border ${artifact.bg} p-4 flex items-center gap-4 overflow-hidden`}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />
              <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl bg-black/20 border border-white/10 shrink-0`}>
                <artifact.icon className={`h-5 w-5 ${artifact.color}`} />
              </div>
              <div className="relative flex-1 min-w-0">
                <p className="text-sm font-extrabold text-foreground tracking-wide">{artifact.name}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{artifact.desc}</p>
              </div>
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border shrink-0">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/8 px-5 py-5 text-center">
          <p className="text-sm font-semibold text-amber-200/90 leading-relaxed">
            Stay tuned for the grand unveiling and start your collection!
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            Your XP earned today will fuel your first artifact unlock.
          </p>
        </div>

        <button
          onClick={() => navigate('/home')}
          className="mt-6 w-full py-4 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 active:scale-95 transition-all shadow-lg"
        >
          Keep Building
        </button>
      </div>
    </div>
  );
}