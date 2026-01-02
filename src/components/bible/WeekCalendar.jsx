import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import EditReadingSheet from './EditReadingSheet';
import { BIBLE_BOOKS } from './bibleData';

export default function WeekCalendar({ onAddChapters, onMarkComplete, onRemoveLog }) {
  const queryClient = useQueryClient();
  const today = new Date();
  const [selectedDay, setSelectedDay] = React.useState(null);

  const currentWeekStart = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }, []);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: readingLogs = [] } = useQuery({
    queryKey: ['readingLogs', user?.id],
    queryFn: async () => {
      return await base44.entities.ReadingLog.list();
    },
    enabled: !!user?.id,
    staleTime: 0,
  });

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

  const selectedDayLogs = selectedDay ? readingByDate[selectedDay.localDate] || [] : [];

  const removeLogMutation = useMutation({
    mutationFn: async (logId) => {
      return await base44.entities.ReadingLog.delete(logId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingLogs', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['bookProgress', user?.id] });
      toast.success('Chapter removed');
    },
  });

  const handleBulkRemoveLogs = async (logIds) => {
    const logsToRemove = readingLogs.filter(log => logIds.includes(log.id));
    
    try {
      await Promise.all(
        logIds.map(logId => base44.entities.ReadingLog.delete(logId))
      );
      
      const bookUpdates = {};
      logsToRemove.forEach(log => {
        if (!bookUpdates[log.book_index]) {
          bookUpdates[log.book_index] = {};
        }
        if (!bookUpdates[log.book_index][log.chapter]) {
          bookUpdates[log.book_index][log.chapter] = 0;
        }
        bookUpdates[log.book_index][log.chapter]++;
      });
      
      const user = await base44.auth.me();
      
      for (const [bookIndex, chapterCounts] of Object.entries(bookUpdates)) {
        const progress = await base44.entities.BookProgress.filter({ 
          book_index: parseInt(bookIndex),
          user_id: user.id
        });
        
        if (progress.length > 0) {
          const bookProgress = progress[0];
          const chapterReadCounts = { ...bookProgress.chapter_read_counts };
          
          Object.entries(chapterCounts).forEach(([chapter, count]) => {
            const currentCount = chapterReadCounts[chapter] || 0;
            const newCount = currentCount - count;
            
            if (newCount > 0) {
              chapterReadCounts[chapter] = newCount;
            } else {
              delete chapterReadCounts[chapter];
            }
          });
          
          const chaptersRead = Object.keys(chapterReadCounts).map(Number);
          
          await base44.entities.BookProgress.update(bookProgress.id, {
            chapter_read_counts: chapterReadCounts,
            chapters_read: chaptersRead,
          });
        }
      }
      
      await queryClient.invalidateQueries({ queryKey: ['readingLogs', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['bookProgress', user?.id] });
      
      toast.success(`${logIds.length} chapters removed`);
    } catch (error) {
      toast.error('Failed to delete chapters');
      await queryClient.invalidateQueries({ queryKey: ['readingLogs', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['bookProgress', user?.id] });
    }
  };

  const handleClearDay = async () => {
    if (!selectedDay || selectedDayLogs.length === 0) return;
    
    const logIds = selectedDayLogs.map(log => log.id);
    await handleBulkRemoveLogs(logIds);
    setSelectedDay(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl p-5 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700/50 mb-6"
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">This Week</h3>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((dayData, i) => {
            const isToday = dayData.date.toDateString() === today.toDateString();
            const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedDay(dayData)}
                className={`
                  flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all
                  ${dayData.count > 0 
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md hover:shadow-lg hover:scale-105' 
                    : 'bg-gray-50 dark:bg-slate-700/20 hover:bg-gray-100 dark:hover:bg-slate-700/40'
                  }
                  ${isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                `}
              >
                <span className={`text-xs font-medium ${dayData.count > 0 ? 'text-white/80' : 'text-gray-500 dark:text-slate-400'}`}>
                  {dayLetters[i]}
                </span>
                <span className={`text-base font-bold ${dayData.count > 0 ? 'text-white' : 'text-gray-900 dark:text-slate-100'}`}>
                  {dayData.date.getDate()}
                </span>
                {dayData.count > 0 && (
                  <span className="text-xs font-semibold text-white/90">
                    {dayData.count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

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
          {selectedDay && (
            <EditReadingSheet
              selectedDay={selectedDay}
              logs={selectedDayLogs}
              onAddMultipleChapters={onAddChapters}
              onMarkBookComplete={onMarkComplete}
              onRemoveLog={onRemoveLog}
              onBulkRemoveLogs={handleBulkRemoveLogs}
              onClearDay={handleClearDay}
              isAdding={false}
              isRemoving={removeLogMutation.isPending}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}