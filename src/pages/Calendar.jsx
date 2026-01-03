import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { groupLogsByDay } from '@/components/bible/utils/logUtils';

export default function Calendar() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayLogs, setSelectedDayLogs] = useState([]);

  useEffect(() => {
    let mounted = true;
    base44.auth.me()
      .then(u => { if (mounted) { setUser(u); setIsLoading(false); } })
      .catch(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const userId = user?.id;
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data: logs = [], isLoading: logsLoading } = useReadingLogsRange(userId, monthStart, monthEnd);
  const logsByDay = groupLogsByDay(logs);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleDayClick = (day) => {
    if (!day) return;
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDay(dateKey);
    setSelectedDayLogs(logsByDay[dateKey] || []);
  };

  const handleDeleteLog = async (logId) => {
    await base44.entities.ReadingLog.delete(logId);
    setSelectedDayLogs(prev => prev.filter(log => log.id !== logId));
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-20 w-64" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <PageHeader title="Calendar" subtitle="Track your daily reading" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold text-foreground">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {logsLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {Array(35).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square" />)}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, i) => {
                if (!day) return <div key={i} />;
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const count = logsByDay[dateKey]?.length || 0;
                const isToday = dateKey === new Date().toISOString().slice(0, 10);

                return (
                  <button
                    key={i}
                    onClick={() => handleDayClick(day)}
                    className={`
                      aspect-square rounded-xl p-2 flex flex-col items-center justify-center
                      transition-all text-sm font-medium
                      ${isToday ? 'ring-2 ring-accent' : ''}
                      ${count > 0
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
                      }
                    `}
                  >
                    {day}
                    {count > 0 && <span className="text-xs mt-0.5">{count}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <Sheet open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <SheetContent side="bottom" className="max-h-[70vh] overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {selectedDay && new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-2">
            {selectedDayLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm">No chapters read this day</p>
            ) : (
              selectedDayLogs.map(log => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-xl"
                >
                  <span className="font-medium text-foreground text-sm">
                    {log.book} {log.chapter}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLog(log.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}