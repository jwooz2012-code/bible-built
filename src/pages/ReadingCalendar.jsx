import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from '@/components/ThemeToggle';
import { base44 } from '@/api/base44Client';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';

export default function ReadingCalendar() {
  const today = new Date();
  const urlParams = new URLSearchParams(window.location.search);
  const initialView = urlParams.get('view') || 'month';
  const [view, setView] = useState(initialView);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [me, setMe] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    base44.auth.me().then(u => { 
      if (mounted) setMe(u); 
    }).catch(() => setMe(null));
    return () => { mounted = false; };
  }, []);

  const userId = me?.id;

  const calendarStartDate = view === 'month'
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
    : `${currentYear}-01-01`;

  const calendarEndDate = view === 'month'
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(new Date(currentYear, currentMonth + 1, 0).getDate()).padStart(2, '0')}`
    : `${currentYear}-12-31`;

  const { data: readingLogs = [] } = useReadingLogsRange(userId, calendarStartDate, calendarEndDate);

  const readingByDate = useMemo(() => {
    const grouped = {};
    readingLogs.forEach(log => {
      if (!grouped[log.date]) {
        grouped[log.date] = [];
      }
      grouped[log.date].push(log);
    });
    return grouped;
  }, [readingLogs]);

  const viewStats = useMemo(() => {
    const total = readingLogs.length;
    const readingDays = Object.keys(readingByDate).length;
    const daysInPeriod = view === 'month' 
      ? new Date(currentYear, currentMonth + 1, 0).getDate()
      : ((currentYear % 4 === 0 && currentYear % 100 !== 0) || (currentYear % 400 === 0)) ? 366 : 365;
    const avgPerDay = daysInPeriod > 0 ? (total / daysInPeriod).toFixed(1) : 0;

    return { total, readingDays, avgPerDay };
  }, [readingLogs, readingByDate, view, currentMonth, currentYear]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const localDate = date.toLocaleDateString('en-CA');
      const count = readingByDate[localDate]?.length || 0;
      days.push({ day, date, localDate, count });
    }
    
    return days;
  }, [currentMonth, currentYear, readingByDate]);

  const yearMonths = useMemo(() => {
    const months = [];
    for (let m = 0; m < 12; m++) {
      const monthStart = `${currentYear}-${String(m + 1).padStart(2, '0')}-01`;
      const monthEnd = `${currentYear}-${String(m + 1).padStart(2, '0')}-${String(new Date(currentYear, m + 1, 0).getDate()).padStart(2, '0')}`;
      const total = readingLogs.filter(log => log.date >= monthStart && log.date <= monthEnd).length;
      months.push({ month: m, total });
    }
    return months;
  }, [currentYear, readingLogs]);

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

  const handlePrevYear = () => setCurrentYear(currentYear - 1);
  const handleNextYear = () => setCurrentYear(currentYear + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-slate-950 dark:to-slate-900">
      <ThemeToggle />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
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

          <Tabs value={view} onValueChange={setView}>
            <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/50">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <motion.div
          key={`${view}-${currentMonth}-${currentYear}`}
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
              {view === 'month' && 'this month'}
              {view === 'year' && 'this year'}
            </p>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-slate-100">{viewStats.readingDays}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">reading days</p>
            </div>
          </div>
        </motion.div>

        {view === 'month' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800/80 dark:backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-slate-700/50 mb-6"
            >
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-full">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-full">
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
                  <div key={i} className="text-center text-xs font-semibold text-gray-500 dark:text-slate-400">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-4">
                {calendarDays.map((dayData, index) => {
                  if (!dayData) return <div key={`empty-${index}`} className="aspect-square" />;

                  const isToday = dayData.date.toDateString() === today.toDateString();
                  const hasReading = dayData.count > 0;

                  return (
                    <motion.div
                      key={dayData.day}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className={`
                        w-full aspect-square rounded-xl flex items-center justify-center p-3 min-h-[44px]
                        ${hasReading ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 shadow-md' : 'bg-slate-50 dark:bg-slate-700/10'}
                        ${isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                      `}
                    >
                      {hasReading ? (
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-bold text-white">{dayData.count}</span>
                          <span className="text-[9px] text-white/70 font-medium">ch</span>
                        </div>
                      ) : (
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}

        {view === 'year' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800/80 dark:backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-slate-700/50 mb-6"
            >
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handlePrevYear} className="rounded-full">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{currentYear}</h2>
                <Button variant="ghost" size="icon" onClick={handleNextYear} className="rounded-full">
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
                  <div className="flex items-baseline gap-1">
                    <p className="text-4xl font-bold text-gray-900 dark:text-slate-100">
                      {monthData.total > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">{monthData.total}</span>
                      ) : (
                        <span className="text-gray-300 dark:text-slate-700">0</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-500">ch</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">chapters read</p>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}