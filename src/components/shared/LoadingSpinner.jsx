import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KJV_VERSES = [
  { text: "I can do all things through Christ which strengtheneth me.", ref: "Philippians 4:13" },
  { text: "The LORD is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.", ref: "Proverbs 3:5" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD thy God will be with thee.", ref: "Joshua 1:9" },
  { text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", ref: "John 3:16" },
  { text: "The LORD is my light and my salvation; whom shall I fear?", ref: "Psalm 27:1" },
  { text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.", ref: "Isaiah 40:31" },
  { text: "Thy word is a lamp unto my feet, and a light unto my path.", ref: "Psalm 119:105" },
  { text: "And we know that all things work together for good to them that love God.", ref: "Romans 8:28" },
  { text: "Create in me a clean heart, O God; and renew a right spirit within me.", ref: "Psalm 51:10" },
  { text: "The LORD bless thee, and keep thee: The LORD make his face shine upon thee, and be gracious unto thee.", ref: "Numbers 6:24-25" },
  { text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil.", ref: "Jeremiah 29:11" },
];

export default function LoadingSpinner() {
  const [verseIndex, setVerseIndex] = useState(() => Math.floor(Math.random() * KJV_VERSES.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setVerseIndex(i => (i + 1) % KJV_VERSES.length);
        setVisible(true);
      }, 600);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const verse = KJV_VERSES[verseIndex];

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-6">
      {/* Concentric Rings */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: '3px solid transparent',
            borderTopColor: '#4ade80',
            borderRightColor: '#4ade80',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '68%',
            height: '68%',
            border: '2.5px solid transparent',
            borderTopColor: '#166534',
            borderLeftColor: '#166534',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
        {/* Center pulse dot */}
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: '#4ade80' }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Verse */}
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={verseIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-xs"
          >
            <p className="text-sm text-muted-foreground leading-relaxed italic mb-2">
              "{verse.text}"
            </p>
            <p className="text-xs font-semibold text-muted-foreground/70 tracking-wide">
              {verse.ref}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}