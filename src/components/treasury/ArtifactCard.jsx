import React from 'react';
import { ARTIFACT_RARITY_COLORS } from '../../data/artifactCatalog.js';

const RARITY_BG = {
  common: 'bg-amber-900/20 border-amber-700/60',
  rare: 'bg-slate-500/20 border-slate-400/60',
  epic: 'bg-yellow-500/20 border-yellow-400/60',
  legendary: 'bg-purple-600/20 border-purple-500/60',
  mythic: 'bg-white/10 border-white/40',
};

const EMOJI_MAP = {
  'davids-sling': '🏹', 'samsons-jawbone': '💀', 'sauls-spear': '🗡️',
  'jonathans-bow': '🏹', 'goliaths-sword': '⚔️', 'moses-staff': '🔱',
  'elijah-staff': '🔱', 'peter-keys': '🔑', 'shield-of-faith': '🛡️',
  'sword-of-spirit': '✨', 'ark-covenant': '📦', 'golden-lampstand': '🕯️',
  'altar-incense': '🔥', 'stone-tablets': '📜', 'temple-veil': '🧵',
  'priestly-breastplate': '👑', 'bronze-serpent': '🐍', 'urim-thummim': '💎',
  'table-shewbread': '🍞', 'golden-calf': '🐄', 'isaiah-scroll': '📜',
  'jeremiahs-clay': '🫙', 'elijahs-mantle': '👔', 'ezekiels-wheel': '⚙️',
  'daniels-lions': '🦁', 'jonahs-fish': '🐋', 'burning-bush': '🌿',
  'hoseas-scroll': '📜', 'amos-plumb-line': '📏', 'zechariahs-lamp': '🔦',
  'solomons-crown': '👑', 'davids-harp': '🎵', 'queens-scepter': '🔱',
  'solomons-ring': '💍', 'davidic-throne': '🪨', 'josephs-coat': '🌈',
  'cyrus-decree': '📋', 'nehemiahs-cup': '🏺', 'absalom-hair': '💇',
  'jeroboam-altar': '🪨', 'crown-of-thorns': '🌿', 'lords-cup': '🍷',
  'five-loaves': '🍞', 'emmaus-bread': '🥖', 'widows-mite': '🪙',
  'alabaster-jar': '🫙', 'fishing-net': '🎣', 'prodigal-ring': '💍',
  'mustard-seed': '🌱', 'revelation-scroll': '📜',
};

export default function ArtifactCard({ artifact, isOwned, isEquipped, onClick }) {
  const rarityColor = ARTIFACT_RARITY_COLORS[artifact.rarity];
  const emoji = EMOJI_MAP[artifact.artifactId] || '🏛️';
  const boostPct = artifact.xpBoost ? Math.round((artifact.xpBoost - 1) * 100) : null;

  return (
    <div
      onClick={onClick}
      className={`relative w-full aspect-square rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 overflow-hidden group ${RARITY_BG[artifact.rarity]}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/50" />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
        <div className={`text-4xl mb-2 ${!isOwned ? 'grayscale opacity-40' : ''}`}>{emoji}</div>
        <h3 className={`font-bold text-xs leading-tight line-clamp-2 ${isOwned ? 'text-white' : 'text-slate-400'}`}>
          {artifact.name}
        </h3>
        <div className="mt-1.5 text-xs font-semibold" style={{ color: rarityColor }}>
          {artifact.rarity.charAt(0).toUpperCase() + artifact.rarity.slice(1)}
        </div>
        <div className="mt-1 text-xs text-yellow-300 font-mono">
          {artifact.xpCost.toLocaleString()} XP
        </div>
      </div>

      {isOwned && (
        <div className="absolute top-1.5 right-1.5 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-bold">✓</div>
      )}
      {isEquipped && (
        <div className="absolute bottom-1.5 left-1.5 bg-blue-500 rounded px-1.5 py-0.5 text-xs font-semibold text-white">⚡</div>
      )}
      {boostPct && (
        <div className="absolute top-1.5 left-1.5 bg-orange-500 rounded px-1.5 py-0.5 text-xs font-semibold text-white">+{boostPct}%</div>
      )}
    </div>
  );
}