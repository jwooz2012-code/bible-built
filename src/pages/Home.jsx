import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import BookCard from '@/components/shared/BookCard';
import ChapterTile from '@/components/shared/ChapterTile';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';
import { useDayReadingLogs } from '@/components/bible/hooks/useDayReadingLogs';
import { useToggleChapterRead } from '@/components/bible/hooks/useToggleChapterRead';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { useMarkAllRead } from '@/components/bible/hooks/useMarkAllRead';
import { useAllBookCycleStates } from '@/components/bible/hooks/useAllBookCycleStates';
import { useBookCycleState } from '@/components/bible/hooks/useBookCycleState';
import { getChapterIdsSet } from '@/components/bible/utils/logUtils';
import { getDateKey } from '@/components/bible/utils/dateUtils';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    let mounted = true;
    base44.auth.me()
      .then(u => { 
        if (mounted) { 
          console.log('[Home] Authenticated user object:', u);
          console.log('[Home] user.id (used by security {{user.id}}):', u?.id);
          setUser(u); 
          setIsLoading(false); 
        } 
      })
      .catch(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const userId = user?.id;
  const today = getDateKey();
  const { data: todayLogs = [] } = useDayReadingLogs(userId, today);
  const { data: allTimeLogs = [] } = useReadingLogsRange(userId, '2000-01-01', '2099-12-31');
  const { data: allCycleStates = [] } = useAllBookCycleStates(userId);
  
  const todayChapterIds = getChapterIdsSet(todayLogs);
  const { markRead, undoRead, isMarkingRead, isUndoingRead } = useToggleChapterRead();
  const { markAllRead, isMarkingAll } = useMarkAllRead();
  
  const selectedBookCycleState = useBookCycleState(userId, selectedBook?.index);

  const getCycleStateForBook = (bookIndex) => {
    const state = allCycleStates.find(s => s.bookIndex === bookIndex);
    return state?.currentCycle || 1;
  };

  const getBookStats = (book) => {
    const currentCycle = getCycleStateForBook(book.index);
    const bookLogs = allTimeLogs.filter(log => log.bookIndex === book.index);
    
    // Chapters read in current cycle
    const currentCycleLogs = bookLogs.filter(log => log.cycle === currentCycle);
    const currentCycleChapterSet = new Set(currentCycleLogs.map(log => log.chapter));
    const currentCycleProgress = currentCycleChapterSet.size;
    
    // Calculate completed cycles (times through)
    const maxCompletedCycle = currentCycle - 1;
    const timesThrough = Math.max(0, maxCompletedCycle);
    
    // Check if current cycle is complete
    if (currentCycleProgress === book.chapters) {
      return {
        currentCycleProgress,
        timesThrough: currentCycle,
        currentCycleChapterSet,
      };
    }
    
    return {
      currentCycleProgress,
      timesThrough,
      currentCycleChapterSet,
    };
  };

  const getChapterStats = (bookIndex, chapter) => {
    const chapterId = generateChapterId(bookIndex, chapter);
    const chapterLogs = allTimeLogs.filter(log => log.chapterId === chapterId);
    const cyclesRead = new Set(chapterLogs.map(log => log.cycle)).size;
    const currentCycle = getCycleStateForBook(bookIndex);
    const isReadInCurrentCycle = chapterLogs.some(log => log.cycle === currentCycle);
    const isReadToday = todayChapterIds.has(chapterId);
    
    return { cyclesRead, isReadInCurrentCycle, isReadToday };
  };

  const handleChapterClick = async (book, chapter, chapterId, isReadToday) => {
    if (!userId) {
      toast.error('Please log in again');
      return;
    }
    
    const currentCycle = getCycleStateForBook(book.index);
    
    try {
      if (!isReadToday) {
        const now = new Date();
        await markRead({
          userId,
          dateKey: getDateKey(now),
          timestamp: now.toISOString(),
          book: book.name,
          bookIndex: book.index,
          chapter,
          chapterId,
          testament: book.testament,
          cycle: currentCycle,
        });
      } else {
        await undoRead({ userId, dateKey: getDateKey(), chapterId });
      }
    } catch (error) {
      console.error('Chapter click error:', error);
      toast.error(error?.message || 'Action failed. Please try again.');
    }
  };

  const handleDeleteLog = async (logId) => {
    await base44.entities.ReadingLog.delete(logId);
  };

  const last10Logs = allTimeLogs
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-20 w-64" />
      </div>
    );
  }

  if (!user || !userId) {
    base44.auth.redirectToLogin();
    return null;
  }

  const formattedDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <PageHeader title="Bible Built" subtitle={formattedDate} />

        {!selectedBook ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {BIBLE_BOOKS.map(book => {
                const stats = getBookStats(book);
                return (
                  <BookCard
                    key={book.index}
                    book={book}
                    currentCycleProgress={stats.currentCycleProgress}
                    timesThrough={stats.timesThrough}
                    onClick={() => setSelectedBook(book)}
                  />
                );
              })}
            </div>

            {last10Logs.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <button
                  onClick={() => setShowRecent(!showRecent)}
                  className="w-full flex items-center justify-between mb-2"
                >
                  <h3 className="font-semibold text-foreground">Recent Activity</h3>
                  {showRecent ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <AnimatePresence>
                  {showRecent && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {last10Logs.map(log => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-3 bg-secondary rounded-xl"
                        >
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {log.book} {log.chapter}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLog(log.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            key={selectedBook.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">{selectedBook.name}</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      const cycle = selectedBookCycleState.currentCycle;
                      await markAllRead({ userId, book: selectedBook, cycle });
                    } catch (error) {
                      console.error('Mark all read failed:', error);
                    }
                  }}
                  disabled={isMarkingAll || isMarkingRead || isUndoingRead}
                >
                  {isMarkingAll ? 'Marking...' : 'Mark All as Read'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => selectedBookCycleState.restartBook()}
                  disabled={selectedBookCycleState.isRestarting}
                >
                  {selectedBookCycleState.isRestarting ? 'Restarting...' : 'Restart Book'}
                </Button>
                <Button variant="ghost" onClick={() => setSelectedBook(null)}>Back</Button>
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chapter => {
                const chapterId = generateChapterId(selectedBook.index, chapter);
                const chapterStats = getChapterStats(selectedBook.index, chapter);
                return (
                  <ChapterTile
                    key={chapter}
                    chapter={chapter}
                    isReadToday={chapterStats.isReadToday}
                    isInCurrentCycle={chapterStats.isReadInCurrentCycle}
                    cyclesRead={chapterStats.cyclesRead}
                    onClick={() => handleChapterClick(selectedBook, chapter, chapterId, chapterStats.isReadToday)}
                    disabled={isMarkingRead || isUndoingRead}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </div>


    </div>
  );
}