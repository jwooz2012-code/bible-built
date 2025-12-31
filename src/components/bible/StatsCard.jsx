import React from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ icon: Icon, label, value, subtext, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white dark:bg-slate-800/80 dark:backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.02] transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-50 dark:bg-amber-500/20 rounded-xl border dark:border-amber-500/30">
          <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">{value}</p>
          <p className="text-xs text-gray-600 dark:text-slate-400">{label}</p>
          {subtext && <p className="text-xs text-amber-600 dark:text-amber-300 mt-0.5">{subtext}</p>}
        </div>
      </div>
    </motion.div>
  );
}