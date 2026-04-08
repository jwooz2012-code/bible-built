import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { ARTIFACT_RARITY_COLORS } from '../../data/artifactCatalog.js';

const EMOJI_MAP = {
  'ark-of-the-covenant': '📦',
  'sword-goliath': '⚔️',
  'coat-of-many-colors': '🌈',
  'sling-of-david': '🏹',
  'davids-harp': '🎵',
  'jar-of-manna': '🫙',
  'noahs-hammer': '🔨',
  'clay-lamp': '🕯️',
  'rod-of-peter': '🎣',
  'shepherds-staff': '🪄',
};

const RARITY_STYLES = {
  common: {
    border: 'border-amber-700/50',
    glow: 'shadow-[0_0_18px_rgba(180,120,50,0.18)]',
    badge: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
    frame: 'from-amber-950/80 via-stone-900/95 to-black'
  },
  rare: {
    border: 'border-sky-400/50',
    glow: 'shadow-[0_0_20px_rgba(125,211,252,0.22)]',
    badge: 'bg-sky-400/20 text-sky-200 border-sky-300/30',
    frame: 'from-slate-900 via-slate-800 to-sky-950/80'
  },
  epic: {
    border: 'border-violet-400/50',
    glow: 'shadow-[0_0_22px_rgba(167,139,250,0.24)]',
    badge: 'bg-violet-400/20 text-violet-200 border-violet-300/30',
    frame: 'from-slate-950 via-violet-950/70 to-black'
  },
  legendary: {
    border: 'border-yellow-300/60',
    glow: 'shadow-[0_0_26px_rgba(250,204,21,0.30)]',
    badge: 'bg-yellow-400/20 text-yellow-100 border-yellow-300/40',
    frame: 'from-yellow-950/80 via-stone-950 to-black'
  },
};

export default function ArtifactCard({ artifact, isOwned, isEquipped, onClick }) {
  const [imgError, setImgError] = useState(false);
  const rarityStyle = RARITY_STYLES[artifact.rarity] || RARITY_STYLES.common;
  const rarityColor = ARTIFACT_RARITY_COLORS[artifact.rarity];
  const fallbackEmoji = EMOJI_MAP[artifact.artifactId] || '🏛️';
  const boostPct = artifact.xpBoost ? Math.round((artifact.xpBoost - 1) * 100) : null;

  // If a finished PNG card exists and loaded successfully, display it
  if (artifact.image && !imgError) {
    return (
      <button
        onClick={onClick}
        className={[
          'group relative w-full overflow-hidden rounded-2xl border text-left',
          'aspect-[0.74] transition-all duration-300',
          'hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]',
          rarityStyle.border,
          rarityStyle.glow
        ].join(' ')}
      >
        <img
          src={artifact.image}
          alt={artifact.name}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
        {!isOwned && (
          <>
            <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-950/60 to-slate-950/70 backdrop-blur-sm" />
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="rounded-xl border border-slate-400/30 bg-slate-950/50 px-4 py-2 text-xs font-bold text-slate-300 shadow-lg">
                {artifact.name}
              </div>
            </div>
            <div className="absolute top-2 right-2 z-30 w-6 h-6 flex items-center justify-center rounded-full bg-slate-950/70 border border-slate-400/40">
              <Lock className="w-3.5 h-3.5 text-slate-300" />
            </div>
          </>
        )}
        {isEquipped && (
          <div className="absolute top-2 right-2 z-20 rounded-full bg-blue-500/85 px-2 py-1 text-[10px] font-bold text-white shadow-lg">
            Equipped
          </div>
        )}
      </button>
    );
  }

  // Fallback card for artifacts without a PNG yet
  return (
    <button
      onClick={onClick}
      className={[
        'group relative w-full overflow-hidden rounded-2xl border text-left',
        'aspect-[0.74] transition-all duration-300',
        'hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]',
        'bg-gradient-to-b',
        rarityStyle.border,
        rarityStyle.glow,
        isOwned ? 'opacity-100' : 'opacity-90'
      ].join(' ')}
    >
      {/* Card background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${rarityStyle.frame}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_35%)]" />
      <div className="absolute inset-[1px] rounded-[15px] border border-white/10" />

      {/* Foil shimmer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute inset-y-0 -left-1/2 w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/14 to-transparent transition-transform duration-1000 group-hover:translate-x-[240%]" />
      </div>

      {/* Top badges */}
      <div className="absolute left-2 top-2 right-2 z-20 flex items-start justify-between gap-2">
        <div className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm ${rarityStyle.badge}`}>
          {artifact.rarity}
        </div>
        <div className="flex flex-col items-end gap-1">
          {boostPct ? (
            <div className="rounded-full bg-orange-500/85 px-2 py-1 text-[10px] font-bold text-white shadow-lg">
              +{boostPct}%
            </div>
          ) : null}
          {isEquipped ? (
            <div className="rounded-full bg-blue-500/85 px-2 py-1 text-[10px] font-bold text-white shadow-lg">
              Equipped
            </div>
          ) : null}
        </div>
      </div>

      {/* Art area */}
      <div className="relative z-10 flex h-[68%] items-center justify-center px-3 pt-10">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/25">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_60%)]" />
          <div
            className={[
              'relative z-10 text-6xl transition-all duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.55)]',
              isOwned ? 'opacity-100' : 'opacity-40'
            ].join(' ')}
          >
            {fallbackEmoji}
          </div>
          {!isOwned && (
            <>
              <div className="absolute inset-0 z-15 bg-gradient-to-br from-slate-950/50 to-slate-950/60 backdrop-blur-sm" />
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="rounded-xl border border-slate-400/30 bg-slate-950/50 px-4 py-2 text-xs font-bold text-slate-300 shadow-lg">
                  {artifact.name}
                </div>
              </div>
              <div className="absolute top-2 right-2 z-30 w-6 h-6 flex items-center justify-center rounded-full bg-slate-950/70 border border-slate-400/40">
                <Lock className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom info plate */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-3">
        <div className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-sm">
          <h3 className={`line-clamp-2 text-sm font-bold leading-tight ${isOwned ? 'text-white' : 'text-slate-300'}`}>
            {artifact.name}
          </h3>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: rarityColor }}>
              {artifact.category}
            </span>
            <span className="text-[11px] font-mono text-yellow-300">
              {artifact.xpCost.toLocaleString()} XP
            </span>
          </div>
        </div>
      </div>

      {isOwned && (
        <div className="absolute bottom-16 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-emerald-500 text-xs font-bold text-white shadow-lg">
          ✓
        </div>
      )}
    </button>
  );
}