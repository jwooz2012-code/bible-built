import React, { useState } from 'react';
import { X, Zap, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { ARTIFACT_RARITY_COLORS, RARITY_COST } from '../../data/artifactCatalog.js';

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

export default function ArtifactDetailModal({ artifact, isOwned, isEquipped, hasOtherEquipped, userXP, treasuryBalance, onClose, onPurchaseSuccess, onEquipSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fullCardView, setFullCardView] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [fullImgError, setFullImgError] = useState(false);

  // Use treasury currency cost by rarity; fallback to xpCost for display
  const cost = RARITY_COST[artifact.rarity] ?? artifact.xpCost;
  const displayBalance = treasuryBalance ?? userXP ?? 0;
  const canAfford = displayBalance >= cost;
  const rarityColor = ARTIFACT_RARITY_COLORS[artifact.rarity];
  const emoji = EMOJI_MAP[artifact.artifactId] || '🏛️';
  const boostPct = artifact.xpBoost ? Math.round((artifact.xpBoost - 1) * 100) : null;

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('purchaseArtifact', { artifactId: artifact.artifactId });
      if (res.data?.success) {
        onPurchaseSuccess(res.data);
      } else {
        setError(res.data?.error || 'Purchase failed');
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Purchase failed');
    }
    setLoading(false);
  };

  const handleEquip = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('equipArtifact', { artifactId: artifact.artifactId, equip: !isEquipped });
      if (res.data?.success) {
        onEquipSuccess(res.data);
      } else {
        setError(res.data?.error || 'Failed to update');
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to update');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50" onClick={onClose}>
      <div
        className="bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-700 w-full sm:max-w-md max-h-[92vh] overflow-y-auto shadow-2xl"
        style={{ paddingBottom: 'calc(var(--sab) + 80px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{artifact.name}</h2>
            <p className="text-xs font-semibold capitalize" style={{ color: rarityColor }}>{artifact.rarity}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Artifact visual */}
          <div className="flex flex-col items-center py-4">
            {artifact.image && !imgError ? (
              <button
                onClick={() => setFullCardView(true)}
                className="group relative mb-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                <img
                  src={artifact.image}
                  alt={artifact.name}
                  className={`w-56 object-contain drop-shadow-lg ${!isOwned ? 'grayscale' : ''}`}
                  onError={() => setImgError(true)}
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-all group-hover:bg-black/10">
                  <div className="scale-0 transition-transform group-hover:scale-100">
                    <div className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">Click to expand</div>
                  </div>
                </div>
              </button>
            ) : (
              <div className="text-7xl mb-2">{emoji}</div>
            )}
            <div className="flex gap-3 text-sm">
              <span className="text-amber-400 font-bold">{cost.toLocaleString()} ₡</span>
              {boostPct && <span className="text-orange-400 font-semibold">+{boostPct}% XP Boost</span>}
            </div>
          </div>

          {/* Scripture */}
          <div className="bg-blue-950/50 border border-blue-800/50 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Scripture</p>
            </div>
            <p className="text-sm font-semibold text-blue-200 mb-1">{artifact.scripture.reference}</p>
            <p className="text-xs text-blue-100/80 italic leading-relaxed">"{artifact.scripture.passage}"</p>
          </div>

          {/* Story */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Story</p>
            <p className="text-sm text-slate-200 leading-relaxed">{artifact.story}</p>
          </div>

          {/* Appearance */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Appearance</p>
            <p className="text-sm text-slate-300 leading-relaxed">{artifact.visualDescription}</p>
          </div>

          {/* XP boost */}
          {boostPct && (
            <div className="bg-orange-950/40 border border-orange-800/40 rounded-xl p-4 flex items-center gap-3">
              <Zap className="w-5 h-5 text-orange-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-orange-300">XP Boost Effect</p>
                <p className="text-sm text-orange-200">+{boostPct}% XP on all readings when equipped</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl p-3">{error}</p>}

          {/* Actions */}
          <div className="space-y-2 pb-2">
            {!isOwned ? (
              <button
                onClick={handlePurchase}
                disabled={!canAfford || loading}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition-all active:scale-95 ${canAfford ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400' : 'bg-slate-700 opacity-50 cursor-not-allowed'}`}
              >
                {loading ? 'Purchasing…' : canAfford ? `Purchase · ${cost.toLocaleString()} ₡` : `Need ${(cost - displayBalance).toLocaleString()} more ₡`}
              </button>
            ) : (
              <button
                onClick={handleEquip}
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition-all active:scale-95 ${isEquipped ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400'}`}
              >
                {loading ? 'Updating…' : isEquipped ? 'Unequip' : hasOtherEquipped ? '⚡ Swap & Equip' : '⚡ Equip for XP Boost'}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-slate-500">Your balance: <span className="text-amber-400 font-semibold">{displayBalance.toLocaleString()} ₡</span></p>
        </div>
      </div>

      {fullCardView && artifact.image && !fullImgError && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm overflow-hidden flex flex-col"
          onClick={() => setFullCardView(false)}
        >
          <button
            onClick={() => setFullCardView(false)}
            className="absolute w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 z-[70] transition-all"
            style={{
              top: 'calc(48px + var(--sat))',
              right: 'calc(20px + var(--sar))'
            }}
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="flex-1 flex items-center justify-center overflow-auto p-4"
            style={{
              paddingTop: 'calc(60px + var(--sat))',
              paddingRight: 'calc(16px + var(--sar))',
              paddingBottom: 'calc(120px + var(--sab))',
              paddingLeft: 'calc(16px + var(--sal))'
            }}
          >
            <img
              src={artifact.image}
              alt={artifact.name}
              className={`max-w-full max-h-full object-contain drop-shadow-2xl ${!isOwned ? 'grayscale' : ''}`}
              onError={() => setFullImgError(true)}
              onClick={e => e.stopPropagation()}
            />

          </div>
        </div>
      )}
    </div>
  );
}