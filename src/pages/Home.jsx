import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import BookCard from '@/components/shared/BookCard';
import ChapterTile from '@/components/shared/ChapterTile';
import WeekView from '@/components/shared/WeekView';
import { BIBLE_BOOKS, generateChapterId, TOTAL_CHAPTERS, OT_CHAPTERS, NT_CHAPTERS } from '@/components/bible/bibleData';
import { useDayReadingLogs } from '@/components/bible/hooks/useDayReadingLogs';
import { useToggleChapterRead } from '@/components/bible/hooks/useToggleChapterRead';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { useMarkAllRead } from '@/components/bible/hooks/useMarkAllRead';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { useReadingStats } from '@/components/bible/hooks/useReadingStats';
import { useMostRecentBooks } from '@/components/bible/hooks/useMostRecentBooks';
import { useReadingPlan } from '@/components/bible/hooks/useReadingPlan';
import { useCurrentStreak } from '@/components/bible/hooks/useCurrentStreak';
import TodayProgressBar from '@/components/trackers/TodayProgressBar';
import StreakCard from '@/components/trackers/StreakCard';
import WeeklySummaryCard from '@/components/trackers/WeeklySummaryCard';
import PersonalRecordsCard from '@/components/trackers/PersonalRecordsCard';
import BadgeStrip from '@/components/badges/BadgeStrip';
import { computeBadgeState } from '@/components/badges/badgeEngine';
import { dedupeChapterIds, groupByDateKey, computeStreaks, computeWeeklySummary, computeRecords } from '@/components/trackers/deriveStats';
import XPBar from '@/components/energy/XPBar';
import { useTheme } from '@/components/ThemeProvider';
import TodayAssignmentCard from '@/components/bible/plans/TodayAssignmentCard';
import PlanModal from '@/components/bible/plans/PlanModal';
import PlanPreviewSheet from '@/components/bible/plans/PlanPreviewSheet';
import { runValidation } from '@/components/bible/plans/validatePlans';

export default function Home() {
  const navigate = useNavigate();
  const { energyMode, energyPalette, resolvedTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedTestamentFilter, setSelectedTestamentFilter] = useState('OT');
  const [planOpen, setPlanOpen] = useState(false);
  const [planPreviewOpen, setPlanPreviewOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [selectedBook]);

  // Listen for Home tab taps for scroll-to-top behavior
  useEffect(() => {
    const onHomeTap = () => {
      if (selectedBook) {
        // If viewing a book, go back to main view
        setSelectedBook(null);
      }
      // Always scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    window.addEventListener('biblebuilt:homeTap', onHomeTap);
    return () => window.removeEventListener('biblebuilt:homeTap', onHomeTap);
  }, [selectedBook]);

  useEffect(() => {
    let mounted = true;
    base44.auth.me().
    then((u) => {
      if (mounted) {
        setUser(u);
        setIsLoading(false);
      }
    }).
    catch(() => {if (mounted) setIsLoading(false);});
    return () => {mounted = false;};
  }, []);

  useEffect(() => {
    const countKey = 'bb_app_open_count';
    const currentCount = parseInt(localStorage.getItem(countKey) || '0', 10);
    const newCount = currentCount + 1;
    localStorage.setItem(countKey, String(newCount));
    setShowWelcome(newCount <= 5);
  }, []);

  // DEV: Validate plans on mount
  useEffect(() => {
    runValidation();
  }, []);

  const userId = user?.id;
  const today = getDateKey();
  const { data: todayLogs = [] } = useDayReadingLogs(userId, today);
  const { data: allTimeLogs = [], isLoading: isLoadingLogs } = useReadingLogsRange(userId, '2000-01-01', '2099-12-31');
  const { data: plan } = useReadingPlan(userId);
  
  // Single source of truth for current streak
  const currentStreak = useCurrentStreak(allTimeLogs);

  const trackerStats = useMemo(() => {
    if (!allTimeLogs.length) {
      return {
        lifetimeUniqueChapters: 0,
        yearUniqueChapters: 0,
        otUniqueChapters: 0,
        ntUniqueChapters: 0,
        otPercent: 0,
        ntPercent: 0,
        longestStreak: 0,
        thisWeekChapters: 0,
        thisWeekActiveDays: 0,
        deltaVsLastWeek: 0,
        records: { longestStreak: 0, bestRolling7: 0, bestMonth: 0, mostReadBook: { name: 'None', count: 0 }, mostCompletedBook: { name: 'None', count: 0 } }
      };
    }

    const currentYear = new Date().getFullYear();
    const yearStart = `${currentYear}-01-01`;
    const yearLogs = allTimeLogs.filter((log) => log.dateKey >= yearStart);

    const lifetimeUnique = dedupeChapterIds(allTimeLogs);
    const yearUnique = dedupeChapterIds(yearLogs);

    // OT/NT progress for current year
    const yearOtLogs = yearLogs.filter((log) => log.testament === 'OT');
    const yearNtLogs = yearLogs.filter((log) => log.testament === 'NT');
    const otUnique = dedupeChapterIds(yearOtLogs);
    const ntUnique = dedupeChapterIds(yearNtLogs);

    const dateCountMap = groupByDateKey(allTimeLogs);
    const sortedDates = Array.from(dateCountMap.keys()).sort().reverse();
    const { longestStreak } = computeStreaks(sortedDates, today);
    const { thisWeekChapters, thisWeekActiveDays, deltaVsLastWeek } = computeWeeklySummary(dateCountMap, today);
    const records = computeRecords(dateCountMap, allTimeLogs);

    return {
      lifetimeUniqueChapters: lifetimeUnique.size,
      yearUniqueChapters: yearUnique.size,
      otUniqueChapters: otUnique.size,
      ntUniqueChapters: ntUnique.size,
      otPercent: Math.round(otUnique.size / 929 * 100),
      ntPercent: Math.round(ntUnique.size / 260 * 100),
      longestStreak,
      thisWeekChapters,
      thisWeekActiveDays,
      deltaVsLastWeek,
      records
    };
  }, [allTimeLogs, today]);

  const currentYear = new Date().getFullYear();
  const now = new Date();

  // Year calculations
  const yearStart = `${currentYear}-01-01`;
  const yearEnd = `${currentYear}-12-31`;
  const yearLogs = allTimeLogs.filter((log) => log.dateKey >= yearStart && log.dateKey <= yearEnd);
  const yearChaptersRead = yearLogs.length;

  // Week calculations (last 7 days)
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekStart = getDateKey(weekAgo);
  const weekLogs = allTimeLogs.filter((log) => log.dateKey >= weekStart);
  const { totalCount: weekChaptersRead } = useReadingStats(weekLogs);

  // Month calculations (current month)
  const monthStart = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthLogs = allTimeLogs.filter((log) => log.dateKey >= monthStart && log.dateKey <= yearEnd);
  const { totalCount: monthChaptersRead } = useReadingStats(monthLogs);

  // Phase calculations
  const readingDays = new Set(allTimeLogs.map((log) => log.dateKey)).size;
  const yearReadingDays = new Set(yearLogs.map((log) => log.dateKey)).size;
  const avgChaptersPerReadingDay = yearReadingDays > 0 ? (yearChaptersRead / yearReadingDays).toFixed(1) : 0;

  const { markRead, undoRead, isMarkingRead, isUndoingRead } = useToggleChapterRead();
  const { markAllRead, isMarkingAll } = useMarkAllRead();

  const recentBooks = useMostRecentBooks(allTimeLogs);

  const hasPlan = !!plan?.startDate && !!plan?.endDate;
  const showPrompt = !hasPlan && !localStorage.getItem('bb_plan_prompt_seen');

  // Calculate achievements
  const { totalCount: lifetimeTotalCount } = useReadingStats(allTimeLogs);
  const uniqueDays = new Set(allTimeLogs.map((log) => log.dateKey));
  const daysWithReadingDistinct = uniqueDays.size;

  const bookChaptersRead = {};
  allTimeLogs.forEach((log) => {
    if (!bookChaptersRead[log.book]) {
      bookChaptersRead[log.book] = new Set();
    }
    bookChaptersRead[log.book].add(log.chapter);
  });

  let totalBooksCompletedDistinct = 0;
  Object.keys(bookChaptersRead).forEach((bookName) => {
    const bookData = BIBLE_BOOKS.find((b) => b.name === bookName);
    if (bookData && bookChaptersRead[bookName].size >= bookData.chapters) {
      totalBooksCompletedDistinct++;
    }
  });

  // Use centralized badge engine
  const badgeState = computeBadgeState(allTimeLogs, user, { debug: false });
  const achievements = badgeState.badges;

  const handleDismissPrompt = () => {
    localStorage.setItem('bb_plan_prompt_seen', 'true');
    window.location.reload();
  };

  const filteredBooks = BIBLE_BOOKS.filter((book) => {
    if (selectedTestamentFilter === 'OT') return book.testament === 'OT';
    if (selectedTestamentFilter === 'NT') return book.testament === 'NT';
    return true;
  });

  const getBookStats = (book) => {
    const chapterCounts = {};
    for (let i = 1; i <= book.chapters; i++) {
      chapterCounts[i] = 0;
    }

    const bookLogs = allTimeLogs.filter((log) => log.bookIndex === book.index);
    bookLogs.forEach((log) => {
      if (chapterCounts[log.chapter] !== undefined) {
        chapterCounts[log.chapter]++;
      }
    });

    const minCount = Math.min(...Object.values(chapterCounts));
    return { completions: minCount };
  };

  const getChapterStats = (bookIndex, chapter) => {
    const chapterId = generateChapterId(bookIndex, chapter);
    const chapterLogs = allTimeLogs.filter((log) => log.chapterId === chapterId);
    return { timesRead: chapterLogs.length };
  };

  const handleChapterClick = async (book, chapter, chapterId) => {
    if (!userId) {
      toast.error('Please log in again');
      return;
    }

    base44.analytics.track({
      eventName: 'chapter_completion_clicked',
      properties: {
        book: book.name,
        chapter,
        testament: book.testament,
      }
    });

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
        testament: book.testament
      });
    } catch (error) {
      toast.error(error?.message || 'Action failed. Please try again.');
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>);

  }

  if (!user || !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>);

  }

  const weeklyQuotes = [
  "Faithfulness is built one chapter at a time.",
  "Show up. Let the Word do the work.",
  "You don't master the Word. You return to it.",
  "Consistency shapes understanding.",
  "A quiet habit can carry a lifetime.",
  "Read again. There is more here.",
  "Depth comes from staying.",
  "The Word rewards the patient reader.",
  "This is how Scripture becomes familiar.",
  "Built slowly. Held forever."];


  const getWeeklyQuote = () => {
    const startOfYear = new Date(currentYear, 0, 1);
    const weeksSinceStartOfYear = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    return weeklyQuotes[weeksSinceStartOfYear % weeklyQuotes.length];
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-6xl mx-auto px-5 pb-8">
        {!selectedBook &&
        <>
            {showWelcome && (
              <p className="text-sm text-muted-foreground/70 text-center mb-6">
                Track what matters.
              </p>
            )}

            {/* Today's Assignment Card */}
            <TodayAssignmentCard
              plan={plan}
              allTimeLogs={allTimeLogs}
              todayKey={today}
              userId={userId}
              onOpenPlanModal={() => setPlanOpen(true)}
              onOpenPlanPreview={() => setPlanPreviewOpen(true)}
              onDismissPrompt={handleDismissPrompt}
              showPrompt={showPrompt}
            />

            {/* Your Progress Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
                {!isLoadingLogs && (
                  <span className="text-xs text-muted-foreground font-medium">
                    • Chapters read this year: {yearChaptersRead}
                  </span>
                )}
              </div>
              
              {energyMode &&
                <div className="flex items-center justify-center mb-4">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center px-2.5 py-1 bb-energy-card rounded-full text-[10px] font-bold text-accent uppercase tracking-wide">
                    ⚡ Energy Mode
                  </motion.span>
                </div>
              }

              <PersonalRecordsCard records={trackerStats.records} currentStreak={currentStreak} showTitle={false} />
              
              <div className="mt-3 mb-1">
                <BadgeStrip badges={achievements} showLabel={true} />
              </div>
            </motion.div>

            {energyMode &&
              <div className="mb-5">
                <XPBar todayCount={todayLogs.length} />
              </div>
            }

            <WeekView logs={allTimeLogs} />

            {recentBooks.length > 0 &&
          <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">Continue Reading</h2>
                <div className="grid grid-cols-2 gap-2">
                  {recentBooks.slice(0, 2).map((book) => {
                const stats = getBookStats(book);
                return (
                  <BookCard
                    key={book.index}
                    book={book}
                    completions={stats.completions}
                    onClick={() => setSelectedBook(book)}
                    compact={true} />);


              })}
                </div>
              </div>
          }

            <div className="flex gap-2 mb-5">
              <Button
              variant={selectedTestamentFilter === 'OT' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTestamentFilter('OT')}
              className="flex-1 h-9 text-xs font-medium">

                Old Testament
              </Button>
              <Button
              variant={selectedTestamentFilter === 'NT' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTestamentFilter('NT')}
              className="flex-1 h-9 text-xs font-medium">

                New Testament
              </Button>
            </div>
          </>
        }

        {!selectedBook ?
        <>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {filteredBooks.map((book) => {
              const stats = getBookStats(book);
              return (
                <BookCard
                  key={book.index}
                  book={book}
                  completions={stats.completions}
                  onClick={() => setSelectedBook(book)} />);


            })}
            </div>
          </> :

        <motion.div
          key={selectedBook.name}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between mb-6 gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 shrink-0"
                onClick={() => {
                  setSelectedBook(null);
                }}>

                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-semibold text-foreground flex-1 min-w-0">{selectedBook.name}</h2>
              </div>
              <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await markAllRead({ userId, book: selectedBook });
              }}
              disabled={isMarkingAll || isMarkingRead || isUndoingRead}
              className="text-xs px-3 h-8 shrink-0">

                {isMarkingAll ? '...' : 'Mark All'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mb-5">
              Tap a chapter to mark it read.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3.5">
              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => {
              const chapterId = generateChapterId(selectedBook.index, chapter);
              const chapterStats = getChapterStats(selectedBook.index, chapter);
              return (
                <ChapterTile
                  key={chapter}
                  chapter={chapter}
                  timesRead={chapterStats.timesRead}
                  onClick={() => handleChapterClick(selectedBook, chapter, chapterId)}
                  disabled={isMarkingRead || isUndoingRead} />);


            })}
            </div>
          </motion.div>
        }
        </div>

        {/* Plan Modal */}
        <PlanModal
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        userId={userId}
        existingPlan={plan}
        logs={allTimeLogs}
        />

        {/* Plan Preview Sheet */}
        <PlanPreviewSheet
        open={planPreviewOpen}
        onClose={() => setPlanPreviewOpen(false)}
        plan={plan}
        userId={userId}
        todayKey={today}
        logs={allTimeLogs}
        onOpenPlanModal={() => {
          setPlanPreviewOpen(false);
          setPlanOpen(true);
        }}
        />
        </div>);

        }