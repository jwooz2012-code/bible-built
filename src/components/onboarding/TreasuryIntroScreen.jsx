import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/components/utils/haptics';
import {
  getArtifactById,
  ARTIFACT_RARITY_COLORS,
  ARTIFACT_RARITY_LABELS,
  RARITY_COST,
} from '@/data/artifactCatalog';

// One artifact per rarity, using the real catalog.
const PREVIEW_ARTIFACTS = ['clay-lamp', 'davids-harp', 'sling-of-david', 'ark-of-the-covenant']
  .map(getArtifactById)
  .filter(Boolean);

// Full-size card art is ~3 MB each; the tour uses small WebP thumbnails.
const thumbnailFor = (image) => image.replace('/cards/', '/cards/thumbs/').replace(/\.png$/, '.webp');

// Matches logChapterRead: 2 XP per verse. Genesis 1 has 31 verses.
const EXAMPLE = { chapter: 'Genesis 1', verses: 31, xp: 62 };

export default function TreasuryIntroScreen({ onContinue, ctaLabel = 'Start Reading' }) {
  const [xpDisplayed, setXpDisplayed] = useState(0);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    let frame;
    const start = performance.now() + 450;
    const duration = 800;
    const tick = (t) => {
      const progress = Math.min(Math.max((t - start) / duration, 0), 1);
      setXpDisplayed(Math.round((1 - Math.pow(1 - progress, 3)) * EXAMPLE.xp));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
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
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center px-6 pt-2 pb-10"
    >
      <motion.div
        initial={{ y: 22, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full max-w-sm flex flex-col items-center space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-foreground">Every Chapter Earns XP</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Read to earn XP, level up, and collect artifacts from Scripture.
          </p>
        </div>

        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="w-full bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between"
        >
          <div>
            <p className="text-base font-bold text-foreground">{EXAMPLE.chapter}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{EXAMPLE.verses} verses × 2 XP each</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-3xl font-black text-foreground font-mono tabular-nums">+{xpDisplayed}</span>
            <span className="text-sm font-bold text-amber-500">XP</span>
          </div>
        </motion.div>

        <div className="w-full">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 text-center">
            Collect Artifacts
          </p>
          <div className="grid grid-cols-4 gap-2">
            {PREVIEW_ARTIFACTS.map((artifact, idx) => {
              const color = ARTIFACT_RARITY_COLORS[artifact.rarity];
              return (
                <motion.div
                  key={artifact.artifactId}
                  initial={{ opacity: 0, y: 14, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.45 + idx * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className="w-full aspect-[2/3] rounded-xl overflow-hidden border-2 bg-black"
                    style={{ borderColor: color, boxShadow: `0 0 14px ${color}55` }}
                  >
                    <img
                      src={thumbnailFor(artifact.image)}
                      alt={artifact.name}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider"
                    // The rare silver is too faint as text on a light background.
                    style={{ color: artifact.rarity === 'rare' ? 'hsl(var(--muted-foreground))' : color }}
                  >
                    {ARTIFACT_RARITY_LABELS[artifact.rarity]}
                  </span>
                </motion.div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3 leading-relaxed">
            Artifacts start at {RARITY_COST.common.toLocaleString()} XP and boost the XP you earn.
            Find them in the Treasury tab.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="mt-8 w-full max-w-sm"
      >
        <motion.div whileTap={{ scale: 0.96 }}>
          <Button onClick={handleContinue} disabled={activating} size="lg" className="w-full h-14 rounded-full text-base font-bold">
            {ctaLabel}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
