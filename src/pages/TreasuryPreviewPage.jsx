import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';

const previewArtifacts = [
  {
    name: "Peter's Fishing Rod",
    desc: "The humble rod of a fisherman called to catch men. A reminder that God uses ordinary things.",
    image: '/cards/rod-of-peter-common.png',
    glow: 'shadow-amber-500/20',
    tier: 'Common',
    tierColor: 'text-slate-400',
  },
  {
    name: "David's Harp",
    desc: "The harp of the shepherd-king whose music drove away evil spirits and pleased God.",
    image: '/cards/davids-harp-rare.png',
    glow: 'shadow-blue-500/30',
    tier: 'Rare',
    tierColor: 'text-blue-400',
  },
  {
    name: 'Coat of Many Colors',
    desc: "Joseph's cherished coat, a symbol of divine favor and the promise of restoration.",
    image: '/cards/coat-of-many-colors-epic.png',
    glow: 'shadow-purple-500/30',
    tier: 'Epic',
    tierColor: 'text-purple-400',
  },
  {
    name: 'Ark of the Covenant',
    desc: "The sacred chest containing the Ten Commandments. The holiest relic of Israel.",
    image: '/cards/ark-legendary.png',
    glow: 'shadow-yellow-500/30',
    tier: 'Legendary',
    tierColor: 'text-yellow-400',
  },
  {
    name: 'Sword of Goliath',
    desc: "The massive iron sword of the giant Goliath, defeated by David's faith. An endgame collectible.",
    image: '/cards/sword-of-goliath-legendary.png',
    glow: 'shadow-yellow-500/30',
    tier: 'Legendary',
    tierColor: 'text-yellow-400',
  },
];

export default function TreasuryPreviewPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-x-hidden pb-28" style={{ background: 'linear-gradient(160deg, #1a0533 0%, #120825 40%, #0d0618 100%)' }}>
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-25" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-0 w-[200px] h-[200px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
      </div>



      <div className="relative z-10 flex flex-col items-center px-5" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 4rem)' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center mb-10"
        >
          <motion.div
            animate={{ boxShadow: ['0 0 30px 8px rgba(124,58,237,0.3)', '0 0 50px 16px rgba(124,58,237,0.5)', '0 0 30px 8px rgba(124,58,237,0.3)'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-3xl bg-violet-900/30 border border-violet-500/30 flex items-center justify-center mb-7"
          >
            <Landmark className="w-12 h-12 text-violet-300" />
          </motion.div>

          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
            Treasury Is Coming
          </h1>
          <p className="text-base text-violet-200/80 max-w-xs leading-relaxed">
            Unearth ancient power. Collect divine relics.<br />Forge your spiritual legacy.
          </p>
        </motion.div>

        {/* Artifact List */}
        <div className="w-full max-w-md space-y-3">
          {previewArtifacts.map((art, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
              className="flex items-center gap-4 p-4 rounded-2xl border border-white/10"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div className={`w-14 h-20 rounded-xl shrink-0 overflow-hidden shadow-lg ${art.glow} bg-white/5 flex items-center justify-center`}>
                <img src={art.image} alt={art.name} className="w-full h-full object-contain grayscale" />
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-white">{art.name}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${art.tierColor}`}>{art.tier}</span>
                </div>
                <p className="text-xs text-slate-300 leading-tight">{art.desc}</p>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-0.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-yellow-500/30 bg-yellow-500/10">
                  <Lock className="w-3.5 h-3.5 text-yellow-400" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-yellow-500/70">Locked</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-10 w-full max-w-md text-center"
        >
          <p className="text-xs text-violet-300/60 italic leading-relaxed mb-6 px-4">
            "Your journey to greatness continues. Every chapter read, every challenge overcome, brings you closer to unlocking the Treasury's secrets."
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/home')}
              className="flex-1 py-4 rounded-2xl font-bold text-white text-sm bg-violet-600 hover:bg-violet-500 active:scale-95 transition-all shadow-lg shadow-violet-900/40">
              Back to Home
            </button>
            <button
              onClick={() => navigate('/social')}
              className="flex-1 py-4 rounded-2xl font-bold text-sm text-amber-900 active:scale-95 transition-all bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-900/20">
              Back to Friends
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}