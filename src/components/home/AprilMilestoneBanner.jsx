import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative mb-5 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a472a 0%, #166534 50%, #15803d 100%)',
            boxShadow: '0 4px 24px rgba(22,101,52,0.35)'
          }}
        >
          {/* Decorative sparkle dots */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {['top-3 left-6', 'top-5 right-10', 'bottom-4 left-1/3', 'top-2 right-1/4', 'bottom-3 right-6'].map((pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-1 h-1 rounded-full bg-white/20`}
              />
            ))}
          </div>

          <div className="relative px-5 py-4 pr-11">
            <div className="text-2xl mb-1">🎉</div>
            <p className="text-white font-bold text-base leading-snug mb-1">
              WOW! Over 10,000 Chapters & Counting!
            </p>
            <p className="text-green-100 text-sm leading-relaxed">
              You and the BibleBuilt community have read over{' '}
              <span className="font-semibold text-white">TEN THOUSAND chapters</span> this April!
              Keep up the amazing work — keep tracking what truly matters. 📖
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}