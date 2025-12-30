import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function AchievementCard({ achievement, unlocked, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`
        relative p-4 rounded-2xl text-center transition-all duration-300
        ${unlocked 
          ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 shadow-lg' 
          : 'bg-stone-100 border border-stone-200 opacity-60'
        }
      `}
    >
      <div className={`text-4xl mb-2 ${!unlocked && 'grayscale opacity-50'}`}>
        {unlocked ? achievement.icon : <Lock className="w-8 h-8 mx-auto text-stone-400" />}
      </div>
      <h3 className={`font-semibold text-sm ${unlocked ? 'text-amber-900' : 'text-stone-500'}`}>
        {achievement.name}
      </h3>
      <p className="text-xs text-stone-500 mt-1">{achievement.description}</p>
      
      {unlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}