import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { groupLogsByDay } from '@/components/bible/utils/logUtils';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function Calendar() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayLogs, setSelectedDayLogs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
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
    try {
      await base44.entities.ReadingLog.delete(logId);
      setSelectedDayLogs(prev => prev.filter(log => log.id !== logId));
      queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
      toast.success('Reading removed');
    } catch (error) {
      console.error('Delete error:', error);
      if (error.message?.includes('not found')) {
        setSelectedDayLogs(prev => prev.filter(log => log.id !== logId));
        queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
      } else {
        toast.error('Failed to delete reading');
      }
    }
  };

  const handleClearDay = async () => {
    if (!selectedDay || selectedDayLogs.length === 0) return;
    
    setIsClearing(true);
    try {
      for (const log of selectedDayLogs) {
        await base44.entities.ReadingLog.delete(log.id);
      }
      setSelectedDayLogs([]);
      queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
      toast.success('Day cleared');
    } catch (error) {
      console.error('Clear day error:', error);
      toast.error('Failed to clear day');
    } finally {
      setIsClearing(false);
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
      
      const newLog = await base44.entities.ReadingLog.create({
        userId,
        timestamp,
        dateKey: selectedDay,
        book: book.name,
        bookIndex: book.index,
        chapter,
        chapterId,
        testament: book.testament,
      });

      setSelectedDayLogs(prev => [...prev, newLog]);
      queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
      setShowAddForm(false);
      setSelectedBook('');
      setSelectedChapter('');
      toast.success('Reading added');
    } catch (error) {
      console.error('Add reading error:', error);
      toast.error('Failed to add reading');
    } finally {
      setIsAdding(false);
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
                    className="aspect-square rounded-xl p-2 flex flex-col items-center justify-center gap-0.5 transition-all text-sm font-medium bg-secondary hover:opacity-80"
                    style={count > 0 ? {
                      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(250, 204, 21, 0.12))',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: 'var(--energy-orange)',
                      boxShadow: isToday ? '0 0 16px var(--energy-glow-light, var(--energy-glow-dark, rgba(249, 115, 22, 0.25)))' : '0 0 10px var(--energy-glow-light, var(--energy-glow-dark, rgba(249, 115, 22, 0.15)))'
                    } : isToday ? {
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: 'var(--energy-orange)',
                      boxShadow: '0 0 12px var(--energy-glow-light, var(--energy-glow-dark, rgba(249, 115, 22, 0.18)))'
                    } : {}}
                  >
                    <span className="text-foreground">{day}</span>
                    <span className="text-xs h-[14px] flex items-center justify-center text-foreground">
                      {count > 0 ? count : ''}
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
              <Button 
                onClick={handleClearDay}
                variant="destructive"
                size="sm"
                disabled={isClearing || selectedDayLogs.length === 0}
              >
                {isClearing ? 'Clearing...' : 'Clear Day'}
              </Button>
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
                    {isAdding ? 'Adding...' : 'Add'}
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
    </div>
  );
}