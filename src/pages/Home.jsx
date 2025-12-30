import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trophy, Flame, ChevronRight, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import ProgressRing from '@/components/bible/ProgressRing';
import BookCard from '@/components/bible/BookCard';
import StatsCard from '@/components/bible/StatsCard';
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
    .slice(0, 3);

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
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-black">Scripture Journey</h1>
          <p className="text-gray-500 text-sm">Track your Bible reading progress</p>
        </motion.div>

        {/* Main Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-black mb-1">Overall Progress</h2>
              <p className="text-3xl font-bold text-black">{stats.overallProgress}%</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.totalChaptersRead} of 1,189 chapters
              </p>
              {stats.fullBibleComplete > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  <Flame className="w-3 h-3" />
                  {stats.fullBibleComplete}x Bible Complete!
                </div>
              )}
            </div>
            <ProgressRing progress={stats.overallProgress} size={100} strokeWidth={8}>
              <div className="text-center">
                <BookOpen className="w-6 h-6 text-gray-900 mx-auto" />
              </div>
            </ProgressRing>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatsCard 
            icon={BookOpen}
            label="Books Completed"
            value={stats.totalBooksCompleted}
            delay={0.2}
          />
          <StatsCard 
            icon={Trophy}
            label="Achievements"
            value={`${unlockedAchievements.length}/${ACHIEVEMENTS.length}`}
            delay={0.3}
          />
        </div>

        {/* Recently Read */}
        {recentlyRead.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-black">Continue Reading</h3>
              <RotateCcw className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-2">
              {recentlyRead.map((progress, i) => {
                const book = BIBLE_BOOKS.find(b => b.name === progress.book_name);
                if (!book) return null;
                return (
                  <Link 
                    key={progress.id} 
                    to={createPageUrl(`BookDetail?book=${encodeURIComponent(book.name)}`)}
                    className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-200 hover:border-blue-500 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-black">{book.name}</p>
                      <p className="text-xs text-gray-500">
                        {progress.chapters_read?.length || 0}/{book.chapters} chapters
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
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
            <h3 className="font-semibold text-black">Books of the Bible</h3>
          </div>

          <Tabs value={testament} onValueChange={setTestament} className="mb-4">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100">
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
              className="grid grid-cols-2 gap-3"
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