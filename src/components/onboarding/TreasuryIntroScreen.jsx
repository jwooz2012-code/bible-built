import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/components/utils/haptics';
import { Zap } from 'lucide-react';

const PREVIEW_ARTIFACTS = [
  { emoji: '📖', name: 'Scroll of the Word', rarity: 'common',    border: 'border-amber-700/50',   glow: 'shadow-[0_0_16px_rgba(180,120,50,0.22)]', badge: 'text-amber-400', bg: 'from-amber-950/80 to-black' },
  { emoji: '🗡️', name: "David's Sling",      rarity: 'rare',      border: 'border-sky-400/50',     glow: 'shadow-[0_0_18px_rgba(125,211,252,0.26)]', badge: 'text-sky-300',   bg: 'from-slate-900 to-sky-950/80' },
  { emoji: '⚡', name: 'Rod of Moses',        rarity: 'epic',      border: 'border-violet-400/50',  glow: 'shadow-[0_0_20px_rgba(167,139,250,0.28)]', badge: 'text-violet-300', bg: 'from-slate-950 to-violet-950/70' },
  { emoji: '🏺', name: 'Ark of the Covenant', rarity: 'legendary', border: 'border-yellow-300/60',  glow: 'shadow-[0_0_24px_rgba(250,204,21,0.34)]', badge: 'text-yellow-300', bg: 'from-yellow-950/40 to-black' },
];

export default function TreasuryIntroScreen({ onContinue }) {
  const [xpDisplayed, setXpDisplayed] = useState(0);
  const [activating, setActivating] = useState(false);
  const TARGET_XP = 3700;

  useEffect(() => {
    const start = Date.now();
    const duration = 1100;
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setXpDisplayed(Math.floor(eased * TARGET_XP));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const timeout = setTimeout(() => requestAnimationFrame(tick), 500);
    return () => clearTimeout(timeout);
  }, []);

  const handleContinue = () => {
    if (activating) return;
    setActivating(true);
    triggerHaptic();
    setTimeout(() => onContinue(), 280);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 pb-24 pt-6"
    >
      <motion.div
        initial={{ y: 22, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full max-w-sm flex flex-col items-center space-y-6"
      >
        {/* NEW badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 18 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold tracking-wide"
        >
          <span>🏆</span> NEW
        </motion.div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-foreground">Your Treasury is Open</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every chapter you've read has been earning XP. Your collection of faith artifacts is waiting.
          </p>
        </div>

        {/* XP counter */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="w-full bg-card border border-border rounded-2xl px-5 py-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total XP Earned</span>
          </div>
          <div className="text-4xl font-black text-foreground font-mono">
            {xpDisplayed.toLocaleString()} <span className="text-xl text-amber-400">XP</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-border overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
              initial={{ width: 0 }}
              animate={{ width: '74%' }}
              transition={{ delay: 0.6, duration: 1.0, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Level 4 · 1,300 XP to next level</p>
        </motion.div>

        {/* Artifact cards preview */}
        <div className="w-full">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 text-center">
            Collectible Artifacts
          </p>
          <div className="grid grid-cols-4 gap-2">
            {PREVIEW_ARTIFACTS.map((a, idx) => (
              <motion.div
                key={a.artifactId}
                initial={{ opacity: 0, y: 14, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
                className={`aspect-[2/3] rounded-xl border ${a.border} ${a.glow} bg-gradient-to-b ${a.bg} flex flex-col items-center justify-center gap-1 p-1`}
              >
                <span className="text-2xl">{a.emoji}</span>
                <span className={`text-[8px] font-bold uppercase tracking-wider ${a.badge}`}>{a.rarity}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.4 }}
        className="mt-10 w-full max-w-sm"
      >
        <motion.div whileTap={{ scale: 0.96 }}>
          <Button onClick={handleContinue} disabled={activating} size="lg" className="w-full h-14 rounded-full text-base font-bold">
            {activating ? 'Opening…' : 'Open My Treasury 🏆'}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
