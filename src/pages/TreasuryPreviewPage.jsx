import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';

const previewArtifacts = [
  {
    name: 'Ark of the Covenant',
    desc: "The sacred chest containing the Ten Commandments. The holiest relic of Israel.",
    image: '/cards/ark-legendary.png',
  },
  {
    name: 'Sword of Goliath',
    desc: "The massive iron sword of the giant Goliath, defeated by David's faith. An endgame collectible.",
    image: '/cards/sword-of-goliath-legendary.png',
  },
  {
    name: 'Coat of Many Colors',
    desc: "Joseph's cherished coat, a symbol of divine favor and the promise of restoration.",
    image: '/cards/coat-of-many-colors-epic.png',
  },
  {
    name: "David's Harp",
    desc: "The harp of the shepherd-king whose music drove away evil spirits and pleased God.",
    image: '/cards/davids-harp-rare.png',
  },
  {
    name: 'Clay Lamp',
    desc: "A simple oil lamp. Light that cannot be hidden.",
    image: '/cards/lamp-common.png',
  },
];

export default function TreasuryPreviewPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-28 px-4 pt-12 flex flex-col items-center relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute p-2 rounded-xl bg-slate-900/50 border border-slate-800"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)', left: '16px' }}
      >
        <ArrowLeft className="w-5 h-5 text-slate-400" />
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 flex flex-col items-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 shadow-2xl">
          <Landmark className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Treasury Is Coming</h1>
        <p className="text-muted-foreground text-center max-w-xs text-sm">
          A new way to collect, honor, and reflect on sacred history.
        </p>
      </motion.div>

      {/* Artifact List */}
      <div className="w-full max-w-md space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
          A Glimpse of What Awaits
        </p>
        {previewArtifacts.map((art, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.07 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border backdrop-blur-sm"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-muted">
              <img src={art.image} alt={art.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="text-sm font-bold text-foreground">{art.name}</h3>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">{art.desc}</p>
            </div>
            <Lock className="w-4 h-4 text-muted-foreground/40 shrink-0" />
          </motion.div>
        ))}
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-10 text-center px-6"
      >
        <p className="text-xs text-muted-foreground italic">
          "Keep tracking what matters. Your progress now will matter when the Treasury opens."
        </p>
        <button
          onClick={() => navigate('/home')}
          className="mt-6 w-full max-w-xs py-4 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 active:scale-95 transition-all shadow-lg"
        >
          Keep Building
        </button>
      </motion.div>
    </div>
  );
}