import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import EditReadingSheet from './EditReadingSheet';

export default function WeekCalendar({ onAddChapters, onMarkComplete, onRemoveLog }) {
  const today = new Date();
  const [selectedDay, setSelectedDay] = React.useState(null);

  const currentWeekStart = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }, []);

  const { data: readingLogs = [] } = useQuery({
    queryKey: ['readingLogs'],
    queryFn: () => base44.entities.ReadingLog.list(),
  });

  const readingByDate = useMemo(() => {
    // Deduplicate by event_id first
    const uniqueLogs = Array.from(new Map(readingLogs.map(log => [log.event_id, log])).values());
    
    const grouped = {};
    uniqueLogs.forEach(log => {
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
              onBulkRemoveLogs={async (logIds) => {
                for (const logId of logIds) {
                  await onRemoveLog(logId);
                }
              }}
              onClearDay={async () => {
                const dayLogs = readingByDate[selectedDay.localDate] || [];
                for (const log of dayLogs) {
                  await onRemoveLog(log.id);
                }
              }}
              isAdding={false}
              isRemoving={false}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}