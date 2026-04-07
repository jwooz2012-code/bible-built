import React from 'react';

const RARITY_CONFIG = {
  common:    { label: 'Common',    color: '#A0826D', bg: 'bg-amber-900/20',  bar: 'bg-amber-600' },
  rare:      { label: 'Rare',      color: '#C0C0C0', bg: 'bg-slate-500/20',  bar: 'bg-slate-400' },
  epic:      { label: 'Epic',      color: '#FFD700', bg: 'bg-yellow-500/20', bar: 'bg-yellow-400' },
  legendary: { label: 'Legendary', color: '#9D4EDD', bg: 'bg-purple-600/20', bar: 'bg-purple-500' },
  mythic:    { label: 'Mythic',    color: '#F0F0F0', bg: 'bg-white/10',      bar: 'bg-white' },
};

export default function CollectionTracker({ stats }) {
  if (!stats) return null;

  return (
    <div className="space-y-3">
      {/* Overall */}
      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-white">Collection</span>
          <span className="text-sm font-bold text-yellow-400">{stats.totalOwned} / {stats.totalAvailable}</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-500 rounded-full"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">{stats.completionPercentage}% complete</p>
      </div>

      {/* By rarity */}
      <div className="grid grid-cols-5 gap-1.5">
        {Object.entries(RARITY_CONFIG).map(([rarity, cfg]) => {
          const data = stats.byRarity?.[rarity] ?? { owned: 0, total: 0 };
          const pct = data.total > 0 ? (data.owned / data.total) * 100 : 0;
          return (
            <div key={rarity} className={`${cfg.bg} rounded-lg p-2 text-center border border-white/5`}>
              <div className="text-xs font-bold mb-1" style={{ color: cfg.color }}>{cfg.label}</div>
              <div className="text-xs text-white font-semibold">{data.owned}/{data.total}</div>
              <div className="w-full bg-black/30 rounded-full h-1 mt-1 overflow-hidden">
                <div className={`h-full ${cfg.bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}