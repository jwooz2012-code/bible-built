import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function TreasuryEntryCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const owned = user?.totalArtifactsOwned ?? 0;
  const pct = Math.round((owned / 50) * 100);

  return (
    <div
      onClick={() => navigate('/treasury')}
      className="mb-5 rounded-2xl bg-slate-900 border border-slate-700/60 p-4 cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏛️</span>
          <div>
            <p className="text-sm font-bold text-white">Artifact Treasury</p>
            <p className="text-xs text-slate-400">{owned} / 50 artifacts collected</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-yellow-400">Explore →</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}