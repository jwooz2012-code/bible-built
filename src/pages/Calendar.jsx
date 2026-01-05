import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { groupLogsByDay } from '@/components/bible/utils/logUtils';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/components/ThemeProvider';

export default function Calendar() {
  const { energyMode, energyPalette, resolvedTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isClearingDay, setIsClearingDay] = useState(false);
  
  const queryClient = useQueryClient();

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

  // Calculate last 7 days reading frequency
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const last7DaysStart = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`;
  
  const { data: last7DaysLogs = [] } = useReadingLogsRange(userId, last7DaysStart, todayKey);
  const last7DaysUniqueDates = new Set(last7DaysLogs.map(log => log.dateKey));
  const daysReadInLast7 = last7DaysUniqueDates.size;

  const selectedDayLogs = selectedDay ? (logsByDay[selectedDay] || []) : [];

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
  };

  const handleDeleteLog = async (logId) => {
    setIsDeleting(true);
    try {
      await base44.entities.ReadingLog.delete(logId);
      await queryClient.invalidateQueries();
      toast.success('Chapter removed from this day');
    } catch (error) {
      toast.error('Failed to remove chapter');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddReading = async () => {
    if (!selectedBook || !selectedChapter) {
      toast.error('Please select a book and chapter');
      return;
    }

    setIsAdding(true);
    try {
      const book = BIBLE_BOOKS.find(b => b.name === selectedBook);
      const chapter = parseInt(selectedChapter);
      const chapterId = generateChapterId(book.index, chapter);
      
      const timestamp = new Date(selectedDay + 'T12:00:00').toISOString();
      
      await base44.entities.ReadingLog.create({
        userId,
        timestamp,
        dateKey: selectedDay,
        book: book.name,
        bookIndex: book.index,
        chapter,
        chapterId,
        testament: book.testament,
      });

      await queryClient.invalidateQueries();
      setShowAddForm(false);
      setSelectedBook('');
      setSelectedChapter('');
      toast.success(`${book.name} ${chapter} added to this day`);
    } catch (error) {
      toast.error('Failed to add reading');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClearDay = async () => {
    setIsClearingDay(true);
    const logsToDelete = [...selectedDayLogs];
    const count = logsToDelete.length;
    
    try {
      for (const log of logsToDelete) {
        await base44.entities.ReadingLog.delete(log.id);
      }
      
      await queryClient.invalidateQueries();
      setShowClearDialog(false);
      toast.success(`Cleared ${count} reading${count !== 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Failed to clear day');
      await queryClient.invalidateQueries();
    } finally {
      setIsClearingDay(false);
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

        {daysReadInLast7 > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-xs text-muted-foreground mb-4 opacity-75"
          >
            You read on {daysReadInLast7} of the last 7 days.
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground">
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
                const isToday = dateKey === todayKey;

                return (
                  <button
                    key={i}
                    onClick={() => handleDayClick(day)}
                    className="aspect-square rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 transition-all text-sm font-medium hover:opacity-80 border"
                    style={isToday ? {
                      background: 'hsl(var(--accent))',
                      borderColor: 'hsl(var(--accent))',
                      borderWidth: '1.5px'
                    } : count > 0 ? {
                      background: 'hsl(var(--accent))',
                      borderWidth: '1.5px',
                      borderColor: 'hsl(var(--accent))'
                    } : {
                      background: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))'
                    }}
                  >
                    <span className={(isToday || count > 0) ? "font-semibold text-[15px]" : "text-foreground font-semibold text-[15px]"} style={(isToday || count > 0) ? { color: energyMode && energyPalette === 'royal' && count > 0 ? '#000000' : resolvedTheme === 'dark' ? '#FFFFFF' : 'hsl(222 22% 18%)' } : {}}>{day}</span>
                    <span className="text-sm h-4 flex items-center justify-center font-bold opacity-85" style={count > 0 ? { color: resolvedTheme === 'dark' ? '#FFFFFF' : '#1a1a1a' } : { color: 'transparent' }}>
                      {count > 0 ? count : '•'}
                    </span>
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
          
          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                variant="outline" 
                className="flex-1"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Reading
              </Button>
              
              {selectedDayLogs.length > 0 && (
                <Button 
                  onClick={() => setShowClearDialog(true)}
                  variant="outline" 
                  className="flex-1"
                  size="sm"
                  disabled={isClearingDay}
                >
                  Clear Day
                </Button>
              )}
            </div>

            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-secondary p-4 rounded-xl space-y-3"
              >
                <Select value={selectedBook} onValueChange={(val) => {
                  setSelectedBook(val);
                  setSelectedChapter('');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select book" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {BIBLE_BOOKS.map(book => (
                      <SelectItem key={book.index} value={book.name}>
                        {book.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedBook && (
                  <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select chapter" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {Array.from({ length: BIBLE_BOOKS.find(b => b.name === selectedBook)?.chapters || 0 }, (_, i) => i + 1).map(ch => (
                        <SelectItem key={ch} value={String(ch)}>
                          Chapter {ch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddReading}
                    disabled={isAdding || !selectedBook || !selectedChapter}
                    className="flex-1"
                    size="sm"
                  >
                    {isAdding ? 'Adding...' : 'Add Chapter'}
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedBook('');
                      setSelectedChapter('');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
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
                      disabled={isDeleting}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this day?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all reading entries for {selectedDay && new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearingDay}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearDay}
              disabled={isClearingDay}
            >
              {isClearingDay ? 'Clearing...' : 'Clear Day'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}