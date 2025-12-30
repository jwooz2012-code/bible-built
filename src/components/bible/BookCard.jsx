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
            ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 shadow-md' 
            : hasStarted 
              ? 'bg-white border border-stone-200 shadow-sm hover:shadow-md' 
              : 'bg-stone-50 border border-stone-100 hover:bg-white hover:border-stone-200'
          }
        `}>
          {completionCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
              {completionCount}
            </div>
          )}
          
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm truncate ${isComplete ? 'text-amber-900' : 'text-stone-800'}`}>
                {book.name}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {chaptersRead}/{totalChapters} chapters
              </p>
            </div>
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
            ) : hasStarted ? (
              <BookOpen className="w-5 h-5 text-stone-400 flex-shrink-0" />
            ) : null}
          </div>

          <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isComplete ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-stone-400'}`}
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