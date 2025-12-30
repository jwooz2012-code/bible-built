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
      <div className="min-h-screen bg-stone-50 p-4 pb-24">
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
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-stone-800">Scripture Journey</h1>
          <p className="text-stone-500 text-sm">Track your Bible reading progress</p>
        </motion.div>

        {/* Main Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-3xl p-6 shadow-lg border border-amber-100 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-stone-800 mb-1">Overall Progress</h2>
              <p className="text-3xl font-bold text-amber-700">{stats.overallProgress}%</p>
              <p className="text-sm text-stone-500 mt-1">
                {stats.totalChaptersRead} of 1,189 chapters
              </p>
              {stats.fullBibleComplete > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full">
                  <Flame className="w-3 h-3" />
                  {stats.fullBibleComplete}x Bible Complete!
                </div>
              )}
            </div>
            <ProgressRing progress={stats.overallProgress} size={100} strokeWidth={8}>
              <div className="text-center">
                <BookOpen className="w-6 h-6 text-amber-600 mx-auto" />
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
              <h3 className="font-semibold text-stone-800">Continue Reading</h3>
              <RotateCcw className="w-4 h-4 text-stone-400" />
            </div>
            <div className="space-y-2">
              {recentlyRead.map((progress, i) => {
                const book = BIBLE_BOOKS.find(b => b.name === progress.book_name);
                if (!book) return null;
                return (
                  <Link 
                    key={progress.id} 
                    to={createPageUrl(`BookDetail?book=${encodeURIComponent(book.name)}`)}
                    className="flex items-center justify-between bg-white rounded-xl p-3 border border-stone-100 hover:border-amber-200 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-stone-800">{book.name}</p>
                      <p className="text-xs text-stone-500">
                        {progress.chapters_read?.length || 0}/{book.chapters} chapters
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Achievements Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <Link to={createPageUrl('Achievements')} className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-stone-800">Achievements</h3>
            <span className="text-sm text-amber-600 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {ACHIEVEMENTS.slice(0, 4).map((achievement, i) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`
                    flex-shrink-0 w-20 p-3 rounded-xl text-center
                    ${isUnlocked 
                      ? 'bg-amber-50 border border-amber-200' 
                      : 'bg-stone-100 border border-stone-200 opacity-50'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{isUnlocked ? achievement.icon : '🔒'}</div>
                  <p className="text-xs font-medium text-stone-700 truncate">{achievement.name}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Books List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-800">Books of the Bible</h3>
          </div>
          
          <Tabs value={testament} onValueChange={setTestament} className="mb-4">
            <TabsList className="grid w-full grid-cols-3 bg-stone-100">
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