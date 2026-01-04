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
import WeekView from '@/components/shared/WeekView';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';
import { useDayReadingLogs } from '@/components/bible/hooks/useDayReadingLogs';
import { useToggleChapterRead } from '@/components/bible/hooks/useToggleChapterRead';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { useMarkAllRead } from '@/components/bible/hooks/useMarkAllRead';
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
  
  const { markRead, undoRead, isMarkingRead, isUndoingRead } = useToggleChapterRead();
  const { markAllRead, isMarkingAll } = useMarkAllRead();

  const getBookStats = (book) => {
    const chapterCounts = {};
    for (let i = 1; i <= book.chapters; i++) {
      chapterCounts[i] = 0;
    }
    
    const bookLogs = allTimeLogs.filter(log => log.bookIndex === book.index);
    bookLogs.forEach(log => {
      if (chapterCounts[log.chapter] !== undefined) {
        chapterCounts[log.chapter]++;
      }
    });
    
    const minCount = Math.min(...Object.values(chapterCounts));
    return { completions: minCount };
  };

  const getChapterStats = (bookIndex, chapter) => {
    const chapterId = generateChapterId(bookIndex, chapter);
    const chapterLogs = allTimeLogs.filter(log => log.chapterId === chapterId);
    return { timesRead: chapterLogs.length };
  };

  const handleChapterClick = async (book, chapter, chapterId) => {
    if (!userId) {
      toast.error('Please log in again');
      return;
    }
    
    try {
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
      });
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
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <PageHeader title="Bible Built" subtitle={formattedDate} />
        
        <WeekView logs={allTimeLogs} />

        {!selectedBook ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {BIBLE_BOOKS.map(book => {
                const stats = getBookStats(book);
                return (
                  <BookCard
                    key={book.index}
                    book={book}
                    completions={stats.completions}
                    onClick={() => setSelectedBook(book)}
                  />
                );
              })}
            </div>

            {last10Logs.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm"
              >
                <button
                  onClick={() => setShowRecent(!showRecent)}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent Activity</h3>
                  {showRecent ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
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
                          className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {log.book} {log.chapter}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLog(log.id)}
                            className="h-8 w-8 p-0"
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
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6 gap-3">
              <h2 className="text-lg font-semibold text-foreground flex-1 min-w-0">{selectedBook.name}</h2>
              <div className="flex gap-2 shrink-0">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await markAllRead({ userId, book: selectedBook });
                    } catch (error) {
                      console.error('Mark all read failed:', error);
                    }
                  }}
                  disabled={isMarkingAll || isMarkingRead || isUndoingRead}
                  className="text-xs px-3 h-8"
                >
                  {isMarkingAll ? '...' : 'Mark All'}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-3" onClick={() => setSelectedBook(null)}>Back</Button>
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chapter => {
                const chapterId = generateChapterId(selectedBook.index, chapter);
                const chapterStats = getChapterStats(selectedBook.index, chapter);
                return (
                  <ChapterTile
                    key={chapter}
                    chapter={chapter}
                    timesRead={chapterStats.timesRead}
                    onClick={() => handleChapterClick(selectedBook, chapter, chapterId)}
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