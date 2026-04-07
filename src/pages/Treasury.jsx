import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { artifacts, ARTIFACT_RARITY_COLORS } from '../data/artifactCatalog.js';
import ArtifactCard from '@/components/treasury/ArtifactCard';
import ArtifactDetailModal from '@/components/treasury/ArtifactDetailModal';
import CollectionTracker from '@/components/treasury/CollectionTracker';
import { toast } from 'sonner';

const CATEGORIES = ['all', 'weapon', 'temple', 'prophetic', 'royal', 'testament'];
const RARITIES = ['all', 'common', 'rare', 'epic', 'legendary', 'mythic'];

export default function Treasury() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ownedMap, setOwnedMap] = useState({}); // artifactId -> ownership record
  const [equippedSet, setEquippedSet] = useState(new Set());
  const [collectionStats, setCollectionStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [rarity, setRarity] = useState('all');
  const [selected, setSelected] = useState(null);

  const userXP = user?.xp ?? 0;

  const loadCollection = useCallback(async () => {
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
    setLoading(false);
  }, []);

  useEffect(() => { loadCollection(); }, [loadCollection]);

  // Filter artifacts
  const filtered = artifacts.filter(a => {
    if (category !== 'all' && a.category !== category) return false;
    if (rarity !== 'all' && a.rarity !== rarity) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!a.name.toLowerCase().includes(q) && !a.lore.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Sort: owned first, then by rarity
  const RARITY_ORDER = { mythic: 0, legendary: 1, epic: 2, rare: 3, common: 4 };
  filtered.sort((a, b) => {
    const aOwned = !!ownedMap[a.artifactId];
    const bOwned = !!ownedMap[b.artifactId];
    if (aOwned !== bOwned) return bOwned ? 1 : -1;
    return RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
  });

  const handlePurchaseSuccess = (data) => {
    toast.success(`✨ ${selected.name} acquired!`);
    loadCollection();
    setSelected(null);
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
      <div className="max-w-lg mx-auto px-4 pt-14">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Artifact Treasury</h1>
            <p className="text-xs text-slate-400">{userXP.toLocaleString()} XP available</p>
          </div>
          {boostPct > 0 && (
            <div className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/40 rounded-xl px-3 py-1.5">
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-bold text-orange-300">+{boostPct}%</span>
            </div>
          )}
        </div>

        {/* Collection tracker */}
        {!loading && <CollectionTracker stats={collectionStats} />}

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search artifacts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${category === cat ? 'bg-white text-black' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Rarity filter */}
        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
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
          <div className="grid grid-cols-3 gap-3 mt-4">
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
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-16 text-slate-500">
            <p className="text-4xl mb-3">🏛️</p>
            <p className="text-sm">No artifacts match your search</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <ArtifactDetailModal
          artifact={selected}
          isOwned={!!ownedMap[selected.artifactId]}
          isEquipped={equippedSet.has(selected.artifactId)}
          userXP={userXP}
          onClose={() => setSelected(null)}
          onPurchaseSuccess={handlePurchaseSuccess}
          onEquipSuccess={handleEquipSuccess}
        />
      )}
    </div>
  );
}