import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Trophy, Flame, Target, Book, ScrollText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import ProgressRing from '@/components/bible/ProgressRing';
import StatsCard from '@/components/bible/StatsCard';
import { useBookProgress } from '@/components/bible/useBookProgress';
import { BIBLE_BOOKS, ACHIEVEMENTS, TOTAL_CHAPTERS, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from '@/components/bible/bibleData';

export default function Stats() {
  const { progressData, achievements, isLoading, calculateStats, getProgressForBook } = useBookProgress();
  
  const stats = calculateStats();
  const unlockedAchievements = achievements.length;

  // Calculate testament progress
  const oldTestamentBooks = BIBLE_BOOKS.filter(b => b.testament === 'old');
  const newTestamentBooks = BIBLE_BOOKS.filter(b => b.testament === 'new');
  
  const oldTestamentChaptersRead = oldTestamentBooks.reduce((sum, book) => {
    const progress = getProgressForBook(book.name);
    return sum + (progress?.chapters_read?.length || 0);
  }, 0);
  
  const newTestamentChaptersRead = newTestamentBooks.reduce((sum, book) => {
    const progress = getProgressForBook(book.name);
    return sum + (progress?.chapters_read?.length || 0);
  }, 0);

  const oldTestamentTotalChapters = oldTestamentBooks.reduce((sum, b) => sum + b.chapters, 0);
  const newTestamentTotalChapters = newTestamentBooks.reduce((sum, b) => sum + b.chapters, 0);

  const oldTestamentPercent = Math.round((oldTestamentChaptersRead / oldTestamentTotalChapters) * 100);
  const newTestamentPercent = Math.round((newTestamentChaptersRead / newTestamentTotalChapters) * 100);

  // Books currently in progress
  const booksInProgress = BIBLE_BOOKS.filter(book => {
    const progress = getProgressForBook(book.name);
    return progress?.chapters_read?.length > 0 && progress.chapters_read.length < book.chapters;
  }).length;

  // Books with at least one completion
  const booksCompleted = BIBLE_BOOKS.filter(book => {
    const progress = getProgressForBook(book.name);
    return progress?.completion_count > 0;
  }).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 p-4">
        <div className="max-w-lg mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full rounded-3xl" />
          <div className="grid grid-cols-2 gap-3">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
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
            <h1 className="text-xl font-bold text-stone-800">Statistics</h1>
            <p className="text-sm text-stone-500">Your reading journey</p>
          </div>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-3xl p-6 shadow-lg border border-amber-100 mb-6"
        >
          <div className="text-center">
            <ProgressRing progress={stats.overallProgress} size={140} strokeWidth={10}>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-700">{stats.overallProgress}%</p>
                <p className="text-xs text-stone-500">Complete</p>
              </div>
            </ProgressRing>
            <p className="mt-4 text-stone-600">
              {stats.totalChaptersRead} of {TOTAL_CHAPTERS.toLocaleString()} chapters read
            </p>
            {stats.fullBibleComplete > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-sm font-medium px-4 py-2 rounded-full">
                <Flame className="w-4 h-4" />
                Bible Completed {stats.fullBibleComplete}x!
              </div>
            )}
          </div>
        </motion.div>

        {/* Testament Progress */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100"
          >
            <div className="flex items-center gap-2 mb-3">
              <ScrollText className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-stone-600">Old Testament</span>
            </div>
            <ProgressRing progress={oldTestamentPercent} size={70} strokeWidth={6}>
              <span className="text-sm font-bold text-stone-700">{oldTestamentPercent}%</span>
            </ProgressRing>
            <p className="text-xs text-stone-500 mt-2">
              {oldTestamentChaptersRead}/{oldTestamentTotalChapters} chapters
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100"
          >
            <div className="flex items-center gap-2 mb-3">
              <Book className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-stone-600">New Testament</span>
            </div>
            <ProgressRing progress={newTestamentPercent} size={70} strokeWidth={6}>
              <span className="text-sm font-bold text-stone-700">{newTestamentPercent}%</span>
            </ProgressRing>
            <p className="text-xs text-stone-500 mt-2">
              {newTestamentChaptersRead}/{newTestamentTotalChapters} chapters
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatsCard 
            icon={BookOpen}
            label="Total Completions"
            value={stats.totalBooksCompleted}
            subtext="books finished"
            delay={0.3}
          />
          <StatsCard 
            icon={Target}
            label="In Progress"
            value={booksInProgress}
            subtext="books started"
            delay={0.35}
          />
          <StatsCard 
            icon={Flame}
            label="Books Mastered"
            value={booksCompleted}
            subtext={`of 66 books`}
            delay={0.4}
          />
          <StatsCard 
            icon={Trophy}
            label="Achievements"
            value={unlockedAchievements}
            subtext={`of ${ACHIEVEMENTS.length} unlocked`}
            delay={0.45}
          />
        </div>

        {/* Fun Fact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-amber-50 rounded-2xl p-4 border border-amber-100"
        >
          <p className="text-sm text-amber-800 text-center">
            📖 The Bible contains {TOTAL_CHAPTERS.toLocaleString()} chapters across 66 books
          </p>
        </motion.div>
      </div>
    </div>
  );
}