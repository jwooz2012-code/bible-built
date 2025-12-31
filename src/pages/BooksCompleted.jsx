import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import ThemeToggle from '@/components/ThemeToggle';
import { useBookProgress } from '@/components/bible/useBookProgress';
import { BIBLE_BOOKS } from '@/components/bible/bibleData';

export default function BooksCompleted() {
  const { progressData, isLoading } = useBookProgress();

  // Aggregate books by name to avoid duplicates
  const bookMap = new Map();
  progressData.forEach(p => {
    if (p.completion_count > 0) {
      if (bookMap.has(p.book_name)) {
        const existing = bookMap.get(p.book_name);
        existing.completion_count += p.completion_count;
      } else {
        bookMap.set(p.book_name, { ...p });
      }
    }
  });
  
  const completedBooks = Array.from(bookMap.values())
    .sort((a, b) => b.completion_count - a.completion_count);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 p-4">
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <ThemeToggle />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-black dark:text-white">Books Completed</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{completedBooks.length} books</p>
          </div>
        </motion.div>

        {completedBooks.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No books completed yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Start reading to see your progress here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedBooks.map((progress, index) => {
              const book = BIBLE_BOOKS.find(b => b.name === progress.book_name);
              if (!book) return null;

              return (
                <motion.div
                  key={progress.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={createPageUrl(`BookDetail?book=${encodeURIComponent(book.name)}`)}
                    className="block bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md shadow-sm transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-black dark:text-white">{book.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {book.testament} Testament • {book.chapters} chapters
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full">
                          <Trophy className="w-4 h-4" />
                          <span className="font-semibold">{progress.completion_count}x</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}