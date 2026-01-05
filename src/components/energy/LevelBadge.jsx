import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function LevelBadge({ level, title }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full energy-border energy-card"
      style={{ background: 'var(--energy-gradient)' }}
    >
      <Star className="w-4 h-4 text-white fill-white" />
      <span className="text-sm font-bold text-white">
        Level {level}
      </span>
      {title && (
        <span className="text-xs text-white/80 font-medium">
          {title}
        </span>
      )}
    </motion.div>
  );
}