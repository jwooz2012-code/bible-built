import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';

const previewArtifacts = [
  {
    name: 'Ark of the Covenant',
    desc: "The sacred chest containing the Ten Commandments. The holiest relic of Israel.",
    image: '/cards/ark-legendary.png',
    glow: 'shadow-yellow-500/30',
  },
  {
    name: 'Sword of Goliath',
    desc: "The massive iron sword of the giant Goliath, defeated by David's faith. An endgame collectible.",
    image: '/cards/sword-of-goliath-legendary.png',
    glow: 'shadow-slate-400/20',
  },
  {
    name: 'Coat of Many Colors',
    desc: "Joseph's cherished coat, a symbol of divine favor and the promise of restoration.",
    image: '/cards/coat-of-many-colors-epic.png',
    glow: 'shadow-purple-500/30',
  },
  {
    name: "David's Harp",
    desc: "The harp of the shepherd-king whose music drove away evil spirits and pleased God.",
    image: '/cards/davids-harp-rare.png',
    glow: 'shadow-blue-500/30',
  },
  {
    name: 'Clay Lamp',
    desc: "A simple oil lamp. Light that cannot be hidden.",
    image: '/cards/lamp-common.png',
    glow: 'shadow-amber-500/20',
  },
];

export default function TreasuryPreviewPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden pb-28" style={{ background: 'linear-gradient(160deg, #0a0a14 0%, #0f0f1e 40%, #12101a 100%)' }}>
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }} />
      </div>



      <div className="relative z-10 flex flex-col items-center px-5 pt-16">
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
          <p className="text-base text-slate-300 max-w-xs leading-relaxed">
            Unearth ancient power. Collect divine relics.<br />Forge your spiritual legacy.
          </p>
        </motion.div>

        {/* Artifact List */}
        <div className="w-full max-w-md space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">
            A Glimpse of What Awaits
          </p>

          {previewArtifacts.map((art, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
              className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 backdrop-blur-md"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <div className={`w-14 h-14 rounded-xl shrink-0 overflow-hidden shadow-lg ${art.glow} bg-white/5 flex items-center justify-center`}>
                <img src={art.image} alt={art.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-grow min-w-0">
                <h3 className="text-sm font-bold text-white">{art.name}</h3>
                <p className="text-xs text-slate-300 leading-tight mt-0.5">{art.desc}</p>
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
          <p className="text-xs text-slate-400 italic leading-relaxed mb-6 px-4">
            "Your journey to greatness continues. Every chapter read, every challenge overcome, brings you closer to unlocking the Treasury's secrets."
          </p>
          <button
            onClick={() => navigate('/home')}
            className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 8px 32px rgba(124,58,237,0.45)' }}
          >
            Can't Wait!
          </button>
        </motion.div>
      </div>
    </div>
  );
}