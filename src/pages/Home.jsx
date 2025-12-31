import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trophy, Flame, ChevronRight, RotateCcw, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import ProgressRing from '@/components/bible/ProgressRing';
import BookCard from '@/components/bible/BookCard';
import StatsCard from '@/components/bible/StatsCard';
import ThemeToggle from '@/components/ThemeToggle';
import { useBookProgress } from '@/components/bible/useBookProgress';
import { BIBLE_BOOKS, ACHIEVEMENTS } from '@/components/bible/bibleData';

export default function Home() {
  const [testament, setTestament] = useState('all');
  const { progressData, achievements, isLoading, getProgressForBook, calculateStats } = useBookProgress();

  const stats = calculateStats();
  const unlockedAchievements = achievements.map(a => a.achievement_id);

  const filteredBooks = testament === 'all' 
    ? BIBLE_BOOKS 
    : BIBLE_BOOKS.filter(b => b.testament === testament);

  const recentlyRead = progressData
    .filter(p => p.last_read_date)
    .sort((a, b) => new Date(b.last_read_date) - new Date(a.last_read_date))
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-3xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <ThemeToggle />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Built by the Word</h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm">A life grounded in Scripture</p>
        </motion.div>

        {/* Main Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700/50 mb-6"
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1">Overall Progress</h2>
              <p className="text-3xl font-bold text-gray-900 dark:text-slate-50">{stats.overallProgress}%</p>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                {stats.totalChaptersRead} of 1,189 chapters
              </p>
              {stats.fullBibleComplete > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-500/20 dark:to-yellow-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-300 dark:border-amber-500/40 shadow-sm">
                  <Flame className="w-3 h-3" />
                  {stats.fullBibleComplete}x Bible Complete!
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <ProgressRing progress={stats.overallProgress} size={100} strokeWidth={8}>
                <div className="text-center">
                  <BookOpen className="w-6 h-6 text-gray-900 dark:text-slate-100 mx-auto" />
                </div>
              </ProgressRing>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <Link to={createPageUrl('ReadingCalendar')} className="block mb-6">
          <StatsCard 
            icon={CalendarDays}
            label="Reading Calendar"
            value="View"
            delay={0.2}
          />
        </Link>

        {/* Recently Read */}
        {recentlyRead.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">Continue Reading</h3>
              <RotateCcw className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            </div>
            <div className="space-y-3">
              {recentlyRead.map((progress, i) => {
                const book = BIBLE_BOOKS.find(b => b.name === progress.book_name);
                if (!book) return null;
                return (
                  <Link 
                    key={progress.id} 
                    to={createPageUrl(`BookDetail?book=${encodeURIComponent(book.name)}`)}
                    className="flex items-center justify-between bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-3 border border-slate-200 dark:border-slate-700/50 hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-slate-100">{book.name}</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">
                        {progress.chapters_read?.length || 0}/{book.chapters} chapters
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
          )}

        {/* Books List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">Books of the Bible</h3>
          </div>

          <Tabs value={testament} onValueChange={setTestament} className="mb-4">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-slate-800/80 dark:backdrop-blur-sm dark:border dark:border-slate-700/50">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="old" className="text-xs">Old Testament</TabsTrigger>
              <TabsTrigger value="new" className="text-xs">New Testament</TabsTrigger>
            </TabsList>
          </Tabs>

          <AnimatePresence mode="wait">
            <motion.div
              key={testament}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-4"
            >
              {filteredBooks.map((book, i) => (
                <BookCard
                  key={book.name}
                  book={book}
                  progress={getProgressForBook(book.name)}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}