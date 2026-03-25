import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/components/utils/haptics';

// Initial chapter read counts — some pre-set to show multi-read is possible
const INITIAL_COUNTS = [2, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0];

export default function ReadingTrackingScreen({ onContinue }) {
  const [isActivating, setIsActivating] = useState(false);
  const [counts, setCounts] = useState(INITIAL_COUNTS);
  const [floaters, setFloaters] = useState([]);

  const handleTap = (i) => {
    triggerHaptic();
    setCounts(prev => {
      const next = [...prev];
      next[i] = next[i] + 1;
      return next;
    });
    // Spawn a +1 floater
    const id = Date.now() + i;
    setFloaters(prev => [...prev, { id, i }]);
    setTimeout(() => setFloaters(prev => prev.filter(f => f.id !== id)), 800);
  };

  const handleContinue = () => {
    if (isActivating) return;
    setIsActivating(true);
    triggerHaptic();
    setTimeout(() => onContinue(), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 pb-24"
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="w-full max-w-sm flex flex-col items-center space-y-6"
      >
        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-foreground">Log Your Reading</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tap any chapter to mark it read. Tap again to log it a second time — every read counts!
          </p>
        </div>

        {/* Interactive Book Card mockup */}
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="w-full bg-card border border-border rounded-2xl p-4 shadow-md"
        >
          {/* Book header row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Genesis</h2>
              <p className="text-xs text-muted-foreground">Try tapping the tiles below 👇</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">
                {counts.filter(c => c > 0).length} / {counts.length} chapters
              </span>
            </div>
          </div>

          {/* Chapter tile grid */}
          <div className="grid grid-cols-6 gap-2">
            {counts.map((timesRead, i) => (
              <div key={i} className="relative">
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  transition={{ duration: 0.12 }}
                  onClick={() => handleTap(i)}
                  className="relative aspect-square w-full rounded-xl flex items-center justify-center border shadow-sm transition-all"
                  style={timesRead > 0
                    ? { background: 'hsl(var(--accent))', borderColor: 'hsl(var(--accent))', borderWidth: '1.5px' }
                    : { background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }
                  }
                >
                  {/* timesRead badge */}
                  {timesRead >= 1 && (
                    <div
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #1a1a1a',
                      }}
                    >
                      <span className="text-[9px] font-bold leading-none" style={{ color: '#1a1a1a' }}>
                        {timesRead}
                      </span>
                    </div>
                  )}
                  <span className="text-[13px] font-semibold leading-none text-foreground">
                    {i + 1}
                  </span>
                </motion.button>

                {/* Floating +1 animation */}
                <AnimatePresence>
                  {floaters.filter(f => f.i === i).map(f => (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 1, y: 0, scale: 1 }}
                      animate={{ opacity: 0, y: -28, scale: 1.3 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-black text-emerald-500 pointer-events-none z-20"
                    >
                      +1
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-center text-muted-foreground/70"
        >
          The number badge shows how many times you've read that chapter.
        </motion.p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="mt-8 w-full max-w-sm"
      >
        <motion.div whileTap={{ scale: 0.96 }}>
          <Button
            onClick={handleContinue}
            disabled={isActivating}
            size="lg"
            className="w-full h-14 rounded-full text-base font-bold"
          >
            Got it! 🙌
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}