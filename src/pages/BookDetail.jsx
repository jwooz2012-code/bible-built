import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

import ProgressRing from '@/components/bible/ProgressRing';
import ThemeToggle from '@/components/ThemeToggle';
import { useBookProgress } from '@/components/bible/useBookProgress';
import { BIBLE_BOOKS } from '@/components/bible/bibleData';

export default function BookDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookName = urlParams.get('book');
  const navigate = useNavigate();
  
  const { user, toggleChapter, restartBook, markBookComplete } = useBookProgress();
  const [showCelebration, setShowCelebration] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [celebrationCount, setCelebrationCount] = useState(0);

  const book = BIBLE_BOOKS.find(b => b.name === bookName);
  const bookIndex = Number(book?.index);
  const queryClient = useQueryClient();
  
  console.log("BookDetail render - bookName:", bookName, "bookIndex:", bookIndex, "user.id:", user?.id);
  
  const queryKey = ["bookProgress", user?.id, bookIndex];
  const { data: progress, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.id || !Number.isFinite(bookIndex)) return null;
      const results = await base44.entities.BookProgress.filter({ 
        user_id: user.id, 
        book_index: bookIndex 
      });
      console.log("BookDetail query results:", results);
      // Fall back to cached data if filter returns empty
      if (!results?.length) {
        const cached = queryClient.getQueryData(queryKey);
        console.log("BookDetail: No results, using cached:", cached);
        return cached ?? null;
      }
      return results[0];
    },
    enabled: !!user?.id && Number.isFinite(bookIndex),
    staleTime: 0,
    gcTime: 0,
  });
  
  console.log("BookDetail READ", { key: queryKey, progress });
  
  if (!book) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-stone-500">Book not found</p>
          <Button variant="link" onClick={() => navigate(-1)} className="text-amber-600 mt-2 p-0">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const counts = progress?.chapter_read_counts ?? {};
  const chapters = progress?.chapters_read ?? [];
  const completionCount = progress?.completion_count || 0;
  const percentComplete = Math.round((chapters.length / book.chapters) * 100);

  const handleChapterToggle = async (chapterNum) => {
    console.log("CHAPTER TILE CLICK", chapterNum);
    console.log("toggleChapter type:", typeof toggleChapter);
    console.log("bookName:", bookName, "book.index:", book?.index);
    try {
      const result = await toggleChapter(bookName, chapterNum);
      console.log("toggleChapter result:", result);
    } catch (e) {
      console.error("toggleChapter threw:", e);
      toast.error(e?.message || "Failed to update chapter");
    }
  };

  const handleRestart = async () => {
    await restartBook(bookName);
  };

  const handleMarkComplete = async () => {
    setCelebrationCount(completionCount + 1);
    await markBookComplete(bookName);
    setJustCompleted(true);
    setShowCelebration(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-lg mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full rounded-3xl" />
          <div className="grid grid-cols-5 gap-2">
            {Array(10).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
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
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">{book.name}</h1>
            <p className="text-base text-gray-500 dark:text-gray-400 capitalize">{book.testament} Testament</p>
          </div>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Progress</p>
              <p className="text-3xl font-bold text-black dark:text-white">{percentComplete}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {chapters.length} of {book.chapters} chapters
              </p>

              {completionCount > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium px-3 py-1.5 rounded-full">
                  <Trophy className="w-3 h-3" />
                  Completed {completionCount}x
                </div>
              )}
            </div>
            <ProgressRing progress={percentComplete} size={100} strokeWidth={8}>
              <span className="text-xl font-bold text-black dark:text-white">{percentComplete}%</span>
            </ProgressRing>
          </div>

          <div className="flex gap-2 mt-4">
            {chapters.length > 0 && (
              <Button
               variant="ghost"
               size="sm"
               onClick={handleRestart}
               className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              >
               <RotateCcw className="w-4 h-4 mr-2" />
               Start Over
              </Button>
              )}
              {chapters.length < book.chapters && (
              <Button
               variant="default"
               size="sm"
               onClick={handleMarkComplete}
               className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            )}
          </div>
        </motion.div>

        {/* Chapter Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Chapters</h3>
          <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
            {Array.from({ length: book.chapters }, (_, i) => i + 1).map((n, index) => {
              const chapterNum = Number(n);
              const isRead = (counts[String(chapterNum)] ?? counts[chapterNum] ?? 0) > 0 || chapters.includes(chapterNum);
              const readCount = counts[String(chapterNum)] ?? counts[chapterNum] ?? 0;
              
              const baseClass = "aspect-square rounded-xl font-medium text-sm relative flex flex-col items-center justify-center transition-all duration-200";
              const readClass = "bg-gradient-to-br from-green-500 to-green-600 text-white hover:scale-105";
              const unreadClass = "bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-green-500 dark:hover:border-green-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105";
              
              return (
                <motion.button
                  key={`${chapterNum}-${readCount}`}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => handleChapterToggle(chapterNum)}
                  className={`${baseClass} ${isRead ? readClass : unreadClass}`}
                >
                  <span className="text-sm font-bold">{chapterNum}</span>
                  {readCount > 0 && (
                    <span className="text-[10px] font-medium opacity-80 mt-0.5">
                      {readCount}x
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-400 dark:text-gray-500 mt-6"
        >
          Tap a chapter to log a read • Each tap counts
        </motion.p>
      </div>

      {/* Celebration Dialog */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-green-600 dark:text-green-500" />
            </div>
            <DialogTitle className="text-2xl">Awesome! 🎉</DialogTitle>
            <DialogDescription className="text-base">
              You've completed <span className="font-semibold text-green-700 dark:text-green-400">{book.name}</span>!
              <br />
              <span className="text-lg font-semibold text-black">
                Total completions: {celebrationCount}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <Button
              onClick={() => {
                setShowCelebration(false);
                handleRestart();
              }}
              className="bg-green-500 hover:bg-green-600"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Read Again
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowCelebration(false)}
            >
              Continue Exploring
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}