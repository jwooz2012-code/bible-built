import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function ComboPill({ streak }) {
  if (!streak || streak < 2) return null;
  
  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full energy-shimmer"
      style={{ background: 'var(--energy-gradient)' }}
    >
      <Flame className="w-4 h-4 text-white" />
      <span className="text-xs font-bold text-white">
        {streak}x COMBO
      </span>
    </motion.div>
  );
}