import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'bb_april_10k_dismissed';

export default function AprilMilestoneBanner() {
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(STORAGE_KEY));

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-8"
          style={{ background: 'linear-gradient(160deg, #052e16 0%, #14532d 60%, #166534 100%)' }}
        >
          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #4ade80, transparent)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #86efac, transparent)', filter: 'blur(30px)' }} />

          <div className="relative text-center max-w-xs w-full">

            {/* Big emoji burst */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 180, damping: 10 }}
              className="text-8xl mb-8 select-none"
            >
              🎉
            </motion.div>

            {/* 10,000 hero number */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <p
                className="font-black leading-none mb-2 select-none"
                style={{
                  fontSize: 'clamp(72px, 22vw, 96px)',
                  background: 'linear-gradient(135deg, #bbf7d0 0%, #4ade80 40%, #86efac 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: 'none',
                  letterSpacing: '-0.03em',
                }}
              >
                10K
              </p>
              <p className="text-green-200 font-bold text-xl tracking-widest uppercase mb-1" style={{ letterSpacing: '0.2em' }}>
                chapters
              </p>
              <p className="text-green-300/70 text-sm tracking-wider uppercase mb-10">
                read together this April
              </p>
            </motion.div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-green-100/80 text-base mb-10 leading-relaxed"
            >
              Keep tracking what matters. 📖
            </motion.p>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.4 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDismiss}
              className="w-full py-4 rounded-2xl font-black text-xl tracking-wide transition-all select-none"
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                boxShadow: '0 0 40px rgba(34,197,94,0.45), 0 4px 16px rgba(0,0,0,0.3)',
                color: '#fff',
                letterSpacing: '0.02em',
              }}
            >
              Let's Do It! 🚀
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}