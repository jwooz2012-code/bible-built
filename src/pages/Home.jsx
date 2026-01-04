import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
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
        
        {!selectedBook && (
          <>
            <WeekView logs={allTimeLogs} />
          </>
        )}

        {!selectedBook ? (
          <>
            <div className="grid grid-cols-2 gap-2.5 mb-8">
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


          </>
        ) : (
          <motion.div
            key={selectedBook.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6 gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 shrink-0" 
                  onClick={() => setSelectedBook(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold text-foreground flex-1 min-w-0">{selectedBook.name}</h2>
              </div>
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
                className="text-xs px-3 h-8 shrink-0"
              >
                {isMarkingAll ? '...' : 'Mark All'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mb-4">
              Tap a chapter to mark it read.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
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