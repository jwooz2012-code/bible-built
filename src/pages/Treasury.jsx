import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { artifacts, ARTIFACT_RARITY_COLORS } from '../data/artifactCatalog.js';
import ArtifactCard from '@/components/treasury/ArtifactCard';
import ArtifactDetailModal from '@/components/treasury/ArtifactDetailModal';
import CollectionTracker from '@/components/treasury/CollectionTracker';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const RARITIES = ['all', 'common', 'rare', 'epic', 'legendary'];

export default function Treasury() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { wallet, isLoading: walletLoading } = useWallet();
  const queryClient = useQueryClient();


  const [ownedMap, setOwnedMap] = useState({}); // artifactId -> ownership record
  const [equippedSet, setEquippedSet] = useState(new Set());
  const [collectionStats, setCollectionStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rarity, setRarity] = useState('all');
  const [selected, setSelected] = useState(null);

  const progressXp = wallet?.progressXpTotal ?? 0;
  const spendableXp = wallet?.spendableXp ?? 0;

  const loadCollection = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('getOwnedCollection', {});
      if (res.data?.success) {
        const map = {};
        const equipped = new Set();
        res.data.ownedArtifacts.forEach(a => {
          map[a.artifactId] = a.ownership;
          if (a.ownership?.isEquipped) equipped.add(a.artifactId);
        });
        setOwnedMap(map);
        setEquippedSet(equipped);
        setCollectionStats(res.data.stats);
      }
    } catch (e) {
      console.warn('[Treasury] loadCollection failed:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCollection(); }, [loadCollection]);

  // Filter artifacts by rarity
  const filtered = artifacts.filter(a => {
    if (rarity !== 'all' && a.rarity !== rarity) return false;
    return true;
  });

  // Sort: owned first, then by rarity
  const RARITY_ORDER = { legendary: 0, epic: 1, rare: 2, common: 3 };
  filtered.sort((a, b) => {
    const aOwned = !!ownedMap[a.artifactId];
    const bOwned = !!ownedMap[b.artifactId];
    if (aOwned !== bOwned) return bOwned ? 1 : -1;
    return RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
  });

  const handlePurchaseSuccess = (data) => {
    toast.success(`✨ ${selected.name} acquired!`);
    queryClient.invalidateQueries({ queryKey: ['userWallet', user?.id] });
    loadCollection();
  };

  const handleEquipSuccess = (data) => {
    const isNowEquipped = data.equippedArtifacts?.includes(selected.artifactId);
    toast.success(isNowEquipped ? `⚡ ${selected.name} equipped!` : 'Unequipped');
    loadCollection();
    setSelected(null);
  };

  // Calculate active XP multiplier
  const activeMultiplier = Array.from(equippedSet).reduce((mult, id) => {
    const art = artifacts.find(a => a.artifactId === id);
    return art?.xpBoost ? mult * art.xpBoost : mult;
  }, 1.0);
  const boostPct = Math.round((activeMultiplier - 1) * 100);

  return (
    <div className="min-h-screen bg-slate-950 pb-28">
      <div className="max-w-lg mx-auto px-4" style={{ paddingTop: 'calc(max(4rem, env(safe-area-inset-top, 0px)) + 0rem)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Artifact Treasury</h1>
        </div>

        {/* Wallet Hero Card */}
        <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800 to-slate-900 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-0.5 uppercase tracking-widest font-semibold">Spendable XP</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold text-white">{spendableXp.toLocaleString()}</span>
                <span className="text-lg font-bold text-blue-400 mb-1">XP</span>
              </div>
              {boostPct > 0 && (
                <div className="flex items-center gap-1 mt-1.5">
                  <Zap className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs font-bold text-orange-300">+{boostPct}% XP Boost Active</span>
                </div>
              )}

            </div>
            {!loading && collectionStats && (
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-widest font-semibold">Collection</p>
                <p className="text-2xl font-bold text-white">{collectionStats.totalOwned}<span className="text-sm text-slate-400 font-normal"> / {collectionStats.totalAvailable}</span></p>
                <div className="w-24 bg-slate-700 rounded-full h-1.5 mt-1.5 ml-auto">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${collectionStats.completionPercentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{collectionStats.completionPercentage}% complete</p>
              </div>
            )}
          </div>
        </div>

        {/* Rarity filter */}
        <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 scrollbar-none">
          {RARITIES.map(r => (
            <button
              key={r}
              onClick={() => setRarity(r)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${rarity === r ? 'bg-white text-black' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              style={rarity === r && r !== 'all' ? { backgroundColor: ARTIFACT_RARITY_COLORS[r], color: '#000' } : {}}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-4 border-slate-700 border-t-slate-300 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {filtered.map(artifact => (
                <ArtifactCard
                  key={artifact.artifactId}
                  artifact={artifact}
                  isOwned={!!ownedMap[artifact.artifactId]}
                  isEquipped={equippedSet.has(artifact.artifactId)}
                  onClick={() => setSelected(artifact)}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <p className="text-4xl mb-3">🏛️</p>
                <p className="text-sm">No artifacts found</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <ArtifactDetailModal
          artifact={selected}
          isOwned={!!ownedMap[selected.artifactId]}
          isEquipped={equippedSet.has(selected.artifactId)}
          hasOtherEquipped={equippedSet.size > 0 && !equippedSet.has(selected.artifactId)}
          userXP={progressXp}
          spendableXp={spendableXp}
          onClose={() => setSelected(null)}
          onPurchaseSuccess={handlePurchaseSuccess}
          onEquipSuccess={handleEquipSuccess}
        />
      )}
    </div>
  );
}