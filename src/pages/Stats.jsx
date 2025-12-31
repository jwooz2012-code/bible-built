import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Trophy, Flame, Target, Book, ScrollText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import ProgressRing from '@/components/bible/ProgressRing';
import StatsCard from '@/components/bible/StatsCard';
import ThemeToggle from '@/components/ThemeToggle';
import { useBookProgress } from '@/components/bible/useBookProgress';
import { BIBLE_BOOKS, ACHIEVEMENTS, TOTAL_CHAPTERS, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from '@/components/bible/bibleData';

export default function Stats() {
  const { progressData, achievements, isLoading, calculateStats, getProgressForBook } = useBookProgress();
  
  const stats = calculateStats();
  const unlockedAchievements = achievements.length;

  // Calculate testament progress from stats
  const oldTestamentPercent = Math.round((stats.oldTestamentChaptersRead / stats.oldTestamentTotalChapters) * 100);
  const newTestamentPercent = Math.round((stats.newTestamentChaptersRead / stats.newTestamentTotalChapters) * 100);

  // Books currently in progress
  const booksInProgress = BIBLE_BOOKS.filter(book => {
    const progress = getProgressForBook(book.name);
    return progress?.chapters_read?.length > 0 && progress.chapters_read.length < book.chapters;
  }).length;

  // Books mastered (30+ completions)
  const booksMastered = BIBLE_BOOKS.filter(book => {
    const progress = getProgressForBook(book.name);
    return progress?.completion_count >= 30;
  }).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 p-4">
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
            <h1 className="text-xl font-bold text-black dark:text-white">Statistics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your reading journey</p>
          </div>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700 mb-6"
        >
          <div className="text-center">
            <ProgressRing progress={stats.overallProgress} size={140} strokeWidth={10}>
              <div className="text-center">
                <p className="text-3xl font-bold text-black dark:text-white">{stats.overallProgress}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Complete</p>
              </div>
            </ProgressRing>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              {stats.totalChaptersRead} of {TOTAL_CHAPTERS.toLocaleString()} chapters read
            </p>
            {stats.fullBibleComplete > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium px-4 py-2 rounded-full">
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
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 mb-3">
              <ScrollText className="w-4 h-4 text-black dark:text-white" />
              <span className="text-sm font-medium text-black dark:text-white">Old Testament</span>
            </div>
            <ProgressRing progress={oldTestamentPercent} size={70} strokeWidth={6}>
              <span className="text-sm font-bold text-black dark:text-white">{oldTestamentPercent}%</span>
            </ProgressRing>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stats.oldTestamentChaptersRead}/{stats.oldTestamentTotalChapters} chapters
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 mb-3">
              <Book className="w-4 h-4 text-black dark:text-white" />
              <span className="text-sm font-medium text-black dark:text-white">New Testament</span>
            </div>
            <ProgressRing progress={newTestamentPercent} size={70} strokeWidth={6}>
              <span className="text-sm font-bold text-black dark:text-white">{newTestamentPercent}%</span>
            </ProgressRing>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stats.newTestamentChaptersRead}/{stats.newTestamentTotalChapters} chapters
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
            value={booksMastered}
            subtext={`read 30+ times`}
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


      </div>
    </div>
  );
}