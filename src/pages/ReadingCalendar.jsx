import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BIBLE_BOOKS } from '@/components/bible/bibleData';
import ThemeToggle from '@/components/ThemeToggle';
import EditReadingSheet from '@/components/bible/EditReadingSheet';
import { useBookProgress } from '@/components/bible/useBookProgress';
import { toast } from 'sonner';

export default function ReadingCalendar() {
  const today = new Date();
  const [view, setView] = useState('month');
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  });
  const [selectedDay, setSelectedDay] = useState(null);

  const queryClient = useQueryClient();
  const { updateProgressMutation, checkAchievements } = useBookProgress();

  const { data: readingLogs = [] } = useQuery({
    queryKey: ['readingLogs'],
    queryFn: () => base44.entities.ReadingLog.list(),
  });

  const addLogMutation = useMutation({
    mutationFn: async ({ localDate, bookIndex, chapter }) => {
      const book = BIBLE_BOOKS[bookIndex];
      const dateObj = new Date(localDate + 'T12:00:00');
      
      return await base44.entities.ReadingLog.create({
        user_id: (await base44.auth.me()).id,
        occurred_at: dateObj.toISOString(),
        local_date: localDate,
        book_index: bookIndex,
        chapter: chapter,
        event_id: `${Date.now()}_${bookIndex}_${chapter}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
      toast.success('Chapter added');
      setTimeout(() => checkAchievements(), 500);
    },
  });

  const removeLogMutation = useMutation({
    mutationFn: async (logId) => {
      return await base44.entities.ReadingLog.delete(logId);
    },
    onMutate: async (logId) => {
      await queryClient.cancelQueries({ queryKey: ['readingLogs'] });
      const previousLogs = queryClient.getQueryData(['readingLogs']);
      queryClient.setQueryData(['readingLogs'], (old) => 
        old?.filter(log => log.id !== logId) || []
      );
      return { previousLogs };
    },
    onError: (err, logId, context) => {
      queryClient.setQueryData(['readingLogs'], context.previousLogs);
      toast.error('Failed to remove chapter');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
    },
  });

  // Group reading logs by local_date
  const readingByDate = useMemo(() => {
    const grouped = {};
    readingLogs.forEach(log => {
      if (!grouped[log.local_date]) {
        grouped[log.local_date] = [];
      }
      grouped[log.local_date].push(log);
    });
    return grouped;
  }, [readingLogs]);

  // Week view logic
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      const localDate = date.toLocaleDateString('en-CA');
      const count = readingByDate[localDate]?.length || 0;
      days.push({ date, localDate, count, dayOfWeek: i });
    }
    return days;
  }, [currentWeekStart, readingByDate]);

  // Calculate totals and stats for current view
  const viewStats = useMemo(() => {
    let total = 0;
    let readingDays = 0;
    let daysInPeriod = 0;

    if (view === 'week') {
      daysInPeriod = 7;
      weekDays.forEach(day => {
        if (day.count > 0) {
          total += day.count;
          readingDays++;
        }
      });
    } else if (view === 'month') {
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      daysInPeriod = lastDay.getDate();
      
      Object.entries(readingByDate).forEach(([date, logs]) => {
        const d = new Date(date + 'T00:00:00');
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          total += logs.length;
          readingDays++;
        }
      });
    } else if (view === 'year') {
      const isLeapYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || (currentYear % 400 === 0);
      daysInPeriod = isLeapYear ? 366 : 365;
      
      Object.entries(readingByDate).forEach(([date, logs]) => {
        const d = new Date(date + 'T00:00:00');
        if (d.getFullYear() === currentYear) {
          total += logs.length;
          readingDays++;
        }
      });
    }

    const avgPerDay = readingDays > 0 ? (total / readingDays).toFixed(1) : 0;

    return { total, readingDays, avgPerDay, daysInPeriod };
  }, [view, readingByDate, currentMonth, currentYear, weekDays]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const localDate = date.toLocaleDateString('en-CA');
      const count = readingByDate[localDate]?.length || 0;
      days.push({ day, date, localDate, count });
    }
    
    return days;
  }, [currentMonth, currentYear, readingByDate]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = (dayData) => {
    if (dayData) {
      setSelectedDay(dayData);
    }
  };

  const selectedDayLogs = selectedDay ? readingByDate[selectedDay.localDate] || [] : [];

  const handleAddMultipleChapters = async (localDate, bookIndex, chapters) => {
    for (const chapter of chapters) {
      await addLogMutation.mutateAsync({ localDate, bookIndex, chapter });
    }
    
    const progress = await base44.entities.BookProgress.filter({ 
      book_index: bookIndex 
    });
    
    if (progress.length > 0) {
      const bookProgress = progress[0];
      const book = BIBLE_BOOKS[bookIndex];
      
      const chapterReadCounts = { ...bookProgress.chapter_read_counts };
      chapters.forEach(chapter => {
        chapterReadCounts[chapter] = (chapterReadCounts[chapter] || 0) + 1;
      });
      
      const chaptersRead = [...new Set([...(bookProgress.chapters_read || []), ...chapters])];
      
      const chapterReadDates = { ...bookProgress.chapter_read_dates };
      chapters.forEach(chapter => {
        chapterReadDates[chapter] = localDate;
      });
      
      let completionCount = bookProgress.completion_count || 0;
      if (chaptersRead.length === book.chapters) {
        completionCount += 1;
      }
      
      await updateProgressMutation.mutateAsync({
        id: bookProgress.id,
        data: {
          chapter_read_counts: chapterReadCounts,
          chapters_read: chaptersRead,
          chapter_read_dates: chapterReadDates,
          completion_count: completionCount,
          last_read_date: new Date().toISOString(),
        }
      });
    }
  };

  const handleMarkBookComplete = async (localDate, bookIndex) => {
    const book = BIBLE_BOOKS[bookIndex];
    const allChapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
    
    for (const chapter of allChapters) {
      await addLogMutation.mutateAsync({ localDate, bookIndex, chapter });
    }
    
    const progress = await base44.entities.BookProgress.filter({ 
      book_index: bookIndex 
    });
    
    if (progress.length > 0) {
      const bookProgress = progress[0];
      
      const chapterReadCounts = { ...bookProgress.chapter_read_counts };
      allChapters.forEach(chapter => {
        chapterReadCounts[chapter] = (chapterReadCounts[chapter] || 0) + 1;
      });
      
      const chapterReadDates = { ...bookProgress.chapter_read_dates };
      allChapters.forEach(chapter => {
        chapterReadDates[chapter] = localDate;
      });
      
      await updateProgressMutation.mutateAsync({
        id: bookProgress.id,
        data: {
          chapter_read_counts: chapterReadCounts,
          chapters_read: allChapters,
          chapter_read_dates: chapterReadDates,
          completion_count: (bookProgress.completion_count || 0) + 1,
          last_read_date: new Date().toISOString(),
        }
      });
    }
  };

  const handleRemoveLog = async (logId) => {
    const log = readingLogs.find(l => l.id === logId);
    if (!log) return;
    
    await removeLogMutation.mutateAsync(logId);
    
    const progress = await base44.entities.BookProgress.filter({ 
      book_index: log.book_index 
    });
    
    if (progress.length > 0) {
      const bookProgress = progress[0];
      const chapterReadCounts = { ...bookProgress.chapter_read_counts };
      const currentCount = chapterReadCounts[log.chapter] || 0;
      
      if (currentCount > 1) {
        chapterReadCounts[log.chapter] = currentCount - 1;
      } else {
        delete chapterReadCounts[log.chapter];
      }
      
      const chaptersRead = Object.keys(chapterReadCounts).map(Number);
      
      await updateProgressMutation.mutateAsync({
        id: bookProgress.id,
        data: {
          chapter_read_counts: chapterReadCounts,
          chapters_read: chaptersRead,
        }
      });
    }
    
    toast.success('Chapter removed');
  };

  const handleBulkRemoveLogs = async (logIds) => {
    const logsToRemove = readingLogs.filter(log => logIds.includes(log.id));
    
    await queryClient.cancelQueries({ queryKey: ['readingLogs'] });
    const previousLogs = queryClient.getQueryData(['readingLogs']);
    
    queryClient.setQueryData(['readingLogs'], (old) => 
      old?.filter(log => !logIds.includes(log.id)) || []
    );
    
    try {
      await Promise.all(
        logIds.map(logId => base44.entities.ReadingLog.delete(logId))
      );
      
      const bookUpdates = {};
      logsToRemove.forEach(log => {
        if (!bookUpdates[log.book_index]) {
          bookUpdates[log.book_index] = [];
        }
        bookUpdates[log.book_index].push(log.chapter);
      });
      
      for (const [bookIndex, chapters] of Object.entries(bookUpdates)) {
        const progress = await base44.entities.BookProgress.filter({ 
          book_index: parseInt(bookIndex)
        });
        
        if (progress.length > 0) {
          const bookProgress = progress[0];
          const chapterReadCounts = { ...bookProgress.chapter_read_counts };
          
          chapters.forEach(chapter => {
            const currentCount = chapterReadCounts[chapter] || 0;
            if (currentCount > 1) {
              chapterReadCounts[chapter] = currentCount - 1;
            } else {
              delete chapterReadCounts[chapter];
            }
          });
          
          const chaptersRead = Object.keys(chapterReadCounts).map(Number);
          
          await updateProgressMutation.mutateAsync({
            id: bookProgress.id,
            data: {
              chapter_read_counts: chapterReadCounts,
              chapters_read: chaptersRead,
            }
          });
        }
      }
      
      toast.success(`${logIds.length} chapters removed`);
    } catch (error) {
      queryClient.setQueryData(['readingLogs'], previousLogs);
      toast.error('Failed to delete chapters');
    } finally {
      queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
    }
  };

  const handleClearDay = async () => {
    if (selectedDay && selectedDayLogs.length > 0) {
      const logIds = selectedDayLogs.map(log => log.id);
      const logsToRemove = [...selectedDayLogs];
      
      await queryClient.cancelQueries({ queryKey: ['readingLogs'] });
      const previousLogs = queryClient.getQueryData(['readingLogs']);
      
      queryClient.setQueryData(['readingLogs'], (old) => 
        old?.filter(log => !logIds.includes(log.id)) || []
      );
      
      setSelectedDay(null);
      toast.success('Day cleared');
      
      try {
        await Promise.all(
          logIds.map(logId => base44.entities.ReadingLog.delete(logId))
        );
        
        const bookUpdates = {};
        logsToRemove.forEach(log => {
          if (!bookUpdates[log.book_index]) {
            bookUpdates[log.book_index] = [];
          }
          bookUpdates[log.book_index].push(log.chapter);
        });
        
        for (const [bookIndex, chapters] of Object.entries(bookUpdates)) {
          const progress = await base44.entities.BookProgress.filter({ 
            book_index: parseInt(bookIndex)
          });
          
          if (progress.length > 0) {
            const bookProgress = progress[0];
            const chapterReadCounts = { ...bookProgress.chapter_read_counts };
            
            chapters.forEach(chapter => {
              const currentCount = chapterReadCounts[chapter] || 0;
              if (currentCount > 1) {
                chapterReadCounts[chapter] = currentCount - 1;
              } else {
                delete chapterReadCounts[chapter];
              }
            });
            
            const chaptersRead = Object.keys(chapterReadCounts).map(Number);
            
            await updateProgressMutation.mutateAsync({
              id: bookProgress.id,
              data: {
                chapter_read_counts: chapterReadCounts,
                chapters_read: chaptersRead,
              }
            });
          }
        }
      } catch (error) {
        queryClient.setQueryData(['readingLogs'], previousLogs);
        toast.error('Failed to clear day');
      } finally {
        queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
      }
    }
  };

  const handlePrevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  // Year view logic
  const yearMonths = useMemo(() => {
    const months = [];
    for (let m = 0; m < 12; m++) {
      let total = 0;
      
      Object.entries(readingByDate).forEach(([date, logs]) => {
        const d = new Date(date + 'T00:00:00');
        if (d.getFullYear() === currentYear && d.getMonth() === m) {
          total += logs.length;
        }
      });
      
      months.push({ month: m, total });
    }
    return months;
  }, [currentYear, readingByDate]);

  const handlePrevYear = () => {
    setCurrentYear(currentYear - 1);
  };

  const handleNextYear = () => {
    setCurrentYear(currentYear + 1);
  };

  const getYearIntensityColor = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-slate-800/30';
    return 'bg-emerald-600 dark:bg-emerald-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-slate-950 dark:to-slate-900">
      <ThemeToggle />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Reading Calendar</h1>
              <p className="text-sm text-gray-600 dark:text-slate-400">Track your daily reading</p>
            </div>
          </div>

          {/* View Tabs */}
          <Tabs value={view} onValueChange={setView}>
            <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/50">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Summary Header */}
        <motion.div
          key={`${view}-${currentMonth}-${currentYear}-${currentWeekStart}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800/80 dark:backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-slate-700/50 mb-6"
        >
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-1">
              <span className="text-green-600 dark:text-green-400">{viewStats.total}</span> chapters
            </p>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {view === 'week' && 'this week'}
              {view === 'month' && 'this month'}
              {view === 'year' && 'this year'}
            </p>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-slate-100">{viewStats.readingDays}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">reading days</p>
            </div>
            <div className="h-10 w-px bg-gray-200 dark:bg-slate-700" />
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-slate-100">{viewStats.avgPerDay}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">avg/day</p>
            </div>
          </div>
        </motion.div>

        {/* Week View */}
        {view === 'week' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800/80 dark:backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-slate-700/50 mb-6"
            >
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevWeek}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                    {weekDays[0]?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6]?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextWeek}
                  className="rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-800/80 dark:backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-slate-700/50"
            >
              <div className="grid grid-cols-7 gap-3">
                {weekDays.map((dayData, i) => {
                  const isToday = dayData.date.toDateString() === today.toDateString();
                  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                  
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedDay(dayData)}
                      className={`
                        flex flex-col items-center gap-2 p-4 rounded-2xl transition-all
                        ${dayData.count > 0 ? 'bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/50' : 'bg-gray-50/50 dark:bg-slate-700/10'}
                        ${isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                      `}
                    >
                      <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                        {dayLetters[i]}
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-slate-100">
                        {dayData.date.getDate()}
                      </span>
                      {dayData.count > 0 && (
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {dayData.count}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}

        {/* Month View */}
        {view === 'month' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800/80 dark:backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-slate-700/50 mb-6"
            >
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevMonth}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                    {monthNames[currentMonth]} {currentYear}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextMonth}
                  className="rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-800/80 dark:backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-slate-700/50"
            >
              <div className="grid grid-cols-7 gap-4 mb-5">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div
                    key={i}
                    className="text-center text-xs font-semibold text-gray-500 dark:text-slate-400 flex items-center justify-center"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-4">
                {calendarDays.map((dayData, index) => {
                  if (!dayData) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const isToday = dayData.date.toDateString() === today.toDateString();
                  const hasReading = dayData.count > 0;

                  return (
                    <motion.button
                      key={dayData.day}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      onClick={() => handleDayClick(dayData)}
                      className={`
                        w-full aspect-square rounded-xl flex items-center justify-center p-3
                        transition-all duration-200 min-h-[44px]
                        ${hasReading ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 shadow-md shadow-emerald-600/20 hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 hover:scale-105' : 'bg-slate-50 dark:bg-slate-700/10 hover:bg-slate-100 dark:hover:bg-slate-700/30 hover:scale-105'}
                        ${isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                      `}
                    >
                      {hasReading ? (
                        <span className="text-sm font-semibold text-white">
                          {dayData.count}
                        </span>
                      ) : (
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}

        {/* Year View */}
        {view === 'year' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800/80 dark:backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-slate-700/50 mb-6"
            >
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevYear}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                    {currentYear}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextYear}
                  className="rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-4"
            >
              {yearMonths.map((monthData, mIndex) => (
                <motion.div
                  key={mIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: mIndex * 0.05 }}
                  className={`
                    bg-white dark:bg-slate-800/80 dark:backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700/50
                    ${monthData.total > 0 ? 'ring-2 ring-emerald-500/30 dark:ring-emerald-400/30' : ''}
                  `}
                >
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-2">
                    {monthNames[monthData.month]}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                    {monthData.total > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">{monthData.total}</span>
                    ) : (
                      <span className="text-gray-300 dark:text-slate-700">0</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">chapters</p>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>

      {/* Bottom Sheet */}
      <Sheet open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>
              {selectedDay && selectedDay.date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </SheetTitle>
            <SheetDescription>
              Total chapters read: <span className="font-semibold text-emerald-600 dark:text-emerald-500">{selectedDayLogs.length}</span>
            </SheetDescription>
          </SheetHeader>
          <EditReadingSheet
            selectedDay={selectedDay}
            logs={selectedDayLogs}
            onAddMultipleChapters={handleAddMultipleChapters}
            onMarkBookComplete={handleMarkBookComplete}
            onRemoveLog={handleRemoveLog}
            onBulkRemoveLogs={handleBulkRemoveLogs}
            onClearDay={handleClearDay}
            isAdding={addLogMutation.isPending}
            isRemoving={removeLogMutation.isPending}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}