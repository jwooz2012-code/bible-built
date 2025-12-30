import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
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

export default function ReadingCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const { data: readingLogs = [] } = useQuery({
    queryKey: ['readingLogs'],
    queryFn: () => base44.entities.ReadingLog.list(),
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

  // Calculate month total
  const monthTotal = useMemo(() => {
    let total = 0;
    Object.entries(readingByDate).forEach(([date, logs]) => {
      const d = new Date(date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        total += logs.length;
      }
    });
    return total;
  }, [readingByDate, currentMonth, currentYear]);

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
    if (dayData && dayData.count > 0) {
      setSelectedDay(dayData);
    }
  };

  const selectedDayLogs = selectedDay ? readingByDate[selectedDay.localDate] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-slate-950 dark:to-slate-900">
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Reading Calendar</h1>
            <p className="text-sm text-gray-600 dark:text-slate-400">Track your daily reading</p>
          </div>
        </motion.div>

        {/* Month Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800/80 dark:backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-slate-700/50 mb-6"
        >
          <div className="flex items-center justify-between mb-2">
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
          <p className="text-center text-sm text-gray-600 dark:text-slate-400">
            Total chapters: <span className="font-semibold text-green-600 dark:text-green-400">{monthTotal}</span>
          </p>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800/80 dark:backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-slate-700/50"
        >
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div
                key={i}
                className="text-center text-xs font-semibold text-gray-500 dark:text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-3">
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
                    aspect-square rounded-2xl flex items-center justify-center
                    transition-all duration-200 relative
                    ${hasReading
                      ? 'bg-green-500 dark:bg-green-500 hover:bg-green-600 dark:hover:bg-green-600 shadow-md'
                      : 'bg-transparent hover:bg-gray-100 dark:hover:bg-slate-700/30'
                    }
                    ${isToday ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400' : ''}
                  `}
                >
                  {hasReading ? (
                    <>
                      <span className="text-2xl font-bold text-white">
                        {dayData.count}
                      </span>
                      <span className="absolute top-1 right-1.5 text-[10px] font-medium text-white/70">
                        {dayData.day}
                      </span>
                    </>
                  ) : (
                    <span className="text-base font-semibold text-gray-700 dark:text-slate-300">
                      {dayData.day}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
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
              Total chapters read: <span className="font-semibold text-green-600">{selectedDay?.count || 0}</span>
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-2 max-h-80 overflow-y-auto">
            {selectedDayLogs.map((log, index) => {
              const book = BIBLE_BOOKS[log.book_index];
              return (
                <div
                  key={`${log.event_id}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-100">{book?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Chapter {log.chapter}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-500">
                    {new Date(log.occurred_at).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}