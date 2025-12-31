import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BookCard({ book, progress, index }) {
  const chaptersRead = progress?.chapters_read?.length || 0;
  const totalChapters = book.chapters;
  const completionCount = progress?.completion_count || 0;
  const percentComplete = Math.round((chaptersRead / totalChapters) * 100);
  const isComplete = chaptersRead === totalChapters;
  const hasStarted = chaptersRead > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      className="overflow-visible"
    >
      <Link to={createPageUrl(`BookDetail?book=${encodeURIComponent(book.name)}`)}>
        <div className={`
          relative p-5 rounded-2xl transition-all duration-300
          ${isComplete 
            ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-500/15 dark:to-amber-600/15 border-2 border-amber-400 dark:border-amber-500/40 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/20' 
            : hasStarted 
              ? 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 shadow-md hover:shadow-lg hover:scale-[1.02]' 
              : 'bg-slate-50/80 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700/40 hover:bg-white/95 dark:hover:bg-slate-800/95 hover:border-slate-300 dark:hover:border-slate-600/50 hover:shadow-md'
          }
        `}>
          {completionCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-extrabold rounded-full w-8 h-8 flex items-center justify-center shadow-lg shadow-amber-500/50 border-2 border-white dark:border-slate-900 z-10">
              {completionCount}
            </div>
          )}
          
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm truncate ${isComplete ? 'text-amber-900 dark:text-amber-300' : 'text-gray-900 dark:text-slate-100'}`}>
                {book.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">
                {chaptersRead}/{totalChapters} chapters
              </p>
            </div>
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            ) : hasStarted ? (
              <BookOpen className="w-5 h-5 text-gray-400 dark:text-slate-500 flex-shrink-0" />
            ) : null}
          </div>

          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isComplete ? 'bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-400' : 'bg-emerald-600 dark:bg-emerald-600'}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 0.5, delay: index * 0.02 }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}