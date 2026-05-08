import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/components/utils/haptics';
import { Hand } from 'lucide-react';

const MOCK_FRIENDS = [
  { initials: 'M', name: 'Marcus R.', streak: 14, level: 7, color: 'from-orange-500 to-orange-700' },
  { initials: 'J', name: 'Jordan H.', streak: 5,  level: 3, color: 'from-blue-500 to-blue-700' },
  { initials: 'S', name: 'Sarah K.', streak: 22, level: 9, color: 'from-violet-500 to-violet-700' },
];

export default function FriendsIntroScreen({ onContinue }) {
  const [fived, setFived] = useState(null);
  const [activating, setActivating] = useState(false);

  const handleHighFive = (name) => {
    triggerHaptic();
    setFived(name);
    setTimeout(() => setFived(null), 1400);
  };

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
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-500 text-xs font-bold tracking-wide"
        >
          <span>✨</span> NEW
        </motion.div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-foreground">Your Crew is Here</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            See your friends' streaks, cheer them on, and send a high five when they show up.
          </p>
        </div>

        {/* Friend cards */}
        <div className="w-full space-y-3">
          {MOCK_FRIENDS.map((f, idx) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + idx * 0.08 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-card"
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-black text-sm">{f.initials}</span>
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{f.name}</p>
                <p className="text-xs text-orange-500 font-semibold">🔥 {f.streak}d · Lvl {f.level}</p>
              </div>
              {/* High Five button */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => handleHighFive(f.name)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-600 text-xs font-bold transition-colors hover:bg-amber-500/25"
              >
                <AnimatePresence mode="wait">
                  {fived === f.name ? (
                    <motion.span
                      key="sent"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs"
                    >
                      🎉 Sent!
                    </motion.span>
                  ) : (
                    <motion.span key="hand" className="flex items-center gap-1">
                      <Hand className="w-3 h-3" /> 🙌
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground/60 text-center italic">
          Tap 🙌 to try it — your friends will get a notification
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.4 }}
        className="mt-10 w-full max-w-sm"
      >
        <motion.div whileTap={{ scale: 0.96 }}>
          <Button onClick={handleContinue} disabled={activating} size="lg" className="w-full h-14 rounded-full text-base font-bold">
            Next →
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
