import React from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ icon: Icon, label, value, subtext, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-stone-100 dark:border-gray-700"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
          <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-stone-800 dark:text-gray-100">{value}</p>
          <p className="text-xs text-stone-500 dark:text-gray-400">{label}</p>
          {subtext && <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{subtext}</p>}
        </div>
      </div>
    </motion.div>
  );
}