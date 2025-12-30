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
    >
      <Link to={createPageUrl(`BookDetail?book=${encodeURIComponent(book.name)}`)}>
        <div className={`
          relative p-4 rounded-2xl transition-all duration-300
          ${isComplete 
            ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-500/10 dark:to-amber-600/10 border-2 border-amber-300 dark:border-amber-500/30 shadow-md' 
            : hasStarted 
              ? 'bg-white dark:bg-slate-800/80 dark:backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 shadow-sm hover:shadow-md' 
              : 'bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/30 hover:bg-white dark:hover:bg-slate-800/80 hover:border-gray-200 dark:hover:border-slate-700/50'
          }
        `}>
          {completionCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
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
              className={`h-full rounded-full ${isComplete ? 'bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-400' : 'bg-gray-400 dark:bg-slate-500'}`}
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