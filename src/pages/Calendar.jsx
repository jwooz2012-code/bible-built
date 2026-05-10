import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { groupLogsByDay } from '@/components/bible/utils/logUtils';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/components/ThemeProvider';
import AddChapterActionSheet from '@/components/calendar/AddChapterActionSheet';
import BulkAddModal from '@/components/calendar/BulkAddModal';
import GraceDaysBanner from '@/components/calendar/GraceDaysBanner';
import { useStreakWithGrace } from '@/components/bible/hooks/useStreakWithGrace';
import { useReadingLogsRange as useAllLogs } from '@/components/bible/hooks/useReadingLogsRange';
import { getTier } from '@/components/trackers/ProgressHero';
import { Shield } from 'lucide-react';

const WEEKLY_QUOTES = [
  "Faithfulness is built one chapter at a time.",
  "Show up. Let the Word do the work.",
  "You don't master the Word. You return to it.",
  "Consistency shapes understanding.",
  "A quiet habit can carry a lifetime.",
  "Read again. There is more here.",
  "Depth comes from staying.",
  "The Word rewards the patient reader.",
  "This is how Scripture becomes familiar.",
  "Built slowly. Held forever."
];

export default function Calendar() {
  const { energyMode, energyPalette, resolvedTheme } = useTheme();
  const { user, isLoadingAuth } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isClearingDay, setIsClearingDay] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCalendarHint, setShowCalendarHint] = useState(false);

  const queryClient = useQueryClient();

  // Calendar hint logic — runs once when user is identified
  useEffect(() => {
    if (!user) return;
    // Migrate: if dismissed flag was set before hintStartDate existed, reset it
    if (localStorage.getItem('cal_hint_dismissed') && !localStorage.getItem('cal_hint_start')) {
      localStorage.removeItem('cal_hint_dismissed');
      localStorage.removeItem('cal_hint_taps');
    }
    // Initialize hintStartDate on first visit
    if (!localStorage.getItem('cal_hint_start')) {
      localStorage.setItem('cal_hint_start', String(Date.now()));
    }
    const dismissed = localStorage.getItem('cal_hint_dismissed');
    if (!dismissed) {
      const hintStart = parseInt(localStorage.getItem('cal_hint_start'), 10);
      const daysSinceStart = (Date.now() - hintStart) / (1000 * 60 * 60 * 24);
      const tapCount = parseInt(localStorage.getItem('cal_hint_taps') || '0', 10);
      if (tapCount < 3 && daysSinceStart < 14) {
        setShowCalendarHint(true);
      } else {
        localStorage.setItem('cal_hint_dismissed', '1');
      }
    }
  }, [user?.id]);

  const userId = user?.id;
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data: logs = [], isLoading: logsLoading } = useReadingLogsRange(userId, monthStart, monthEnd);

  // Grace days — need all-time logs for streak computation
  const { data: allTimeLogsForGrace = [] } = useAllLogs(userId, '2000-01-01', '2099-12-31');
  const { currentStreak: gracefulStreak, graceCoveredDates = [], graceDaysUsed } = useStreakWithGrace(allTimeLogsForGrace, userId);
  const tierColor = getTier(gracefulStreak).color;
  const graceCoveredSet = new Set(graceCoveredDates);
  const logsByDay = groupLogsByDay(logs);

  // Year totals
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const { data: yearLogs = [] } = useReadingLogsRange(userId, yearStart, yearEnd);

  // Compute totals with duplicate safety
  const thisMonthTotal = logs.length;
  const thisYearTotal = yearLogs.length;

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

  const dismissHint = () => {
    localStorage.setItem('cal_hint_dismissed', '1');
    setShowCalendarHint(false);
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDay(dateKey);
    // Track taps for hint dismissal
    if (showCalendarHint) {
      const taps = parseInt(localStorage.getItem('cal_hint_taps') || '0', 10) + 1;
      localStorage.setItem('cal_hint_taps', String(taps));
      if (taps >= 3) {
        setShowCalendarHint(false);
      }
    }
  };

  const handleDeleteLog = async (logId) => {
    setIsDeleting(true);
    try {
      await base44.entities.ReadingLog.delete(logId);
      await queryClient.invalidateQueries({ queryKey: ['readingLogs', userId] });
      await queryClient.invalidateQueries({ queryKey: ['dayLogs', userId] });
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

      await queryClient.invalidateQueries({ queryKey: ['readingLogs', userId] });
      await queryClient.invalidateQueries({ queryKey: ['dayLogs', userId] });
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
      await Promise.all(logsToDelete.map(log => base44.entities.ReadingLog.delete(log.id)));
      await queryClient.invalidateQueries({ queryKey: ['readingLogs', userId] });
      await queryClient.invalidateQueries({ queryKey: ['dayLogs', userId] });
      setShowClearDialog(false);
      toast.success(`Cleared ${count} reading${count !== 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Failed to clear day');
      await queryClient.invalidateQueries({ queryKey: ['readingLogs', userId] });
      await queryClient.invalidateQueries({ queryKey: ['dayLogs', userId] });
    } finally {
      setIsClearingDay(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const getWeeklyQuote = () => {
    const startOfYear = new Date(year, 0, 1);
    const now = new Date();
    const weeksSinceStartOfYear = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    return WEEKLY_QUOTES[weeksSinceStartOfYear % WEEKLY_QUOTES.length];
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pb-4">
        <PageHeader title="Calendar" subtitle="Track your daily reading" />

        <GraceDaysBanner tierColor={tierColor} graceDaysUsed={graceDaysUsed} />

        {/* Momentum Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center gap-6 mb-2 text-center py-1"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">📅</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-medium text-muted-foreground">This Month</span>
              <span className="text-xs font-medium text-muted-foreground">•</span>
              <span className="text-base font-bold text-foreground">{thisMonthTotal}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-base">⚔️</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-medium text-muted-foreground">This Year</span>
              <span className="text-xs font-medium text-muted-foreground">•</span>
              <span className="text-base font-bold text-foreground">{thisYearTotal}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl px-5 pt-2 pb-5"
        >
          <div className="flex items-center justify-between mb-2">
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

          {showCalendarHint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-3 -mt-1"
            >
              <p className="text-[13px] text-muted-foreground/60">Tap a day to add or edit readings</p>
              <button
                onClick={dismissHint}
                className="text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors ml-2 flex-shrink-0"
                aria-label="Dismiss hint"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {logsLoading ? (
            <div className="grid grid-cols-7 gap-2 py-12">
              <div className="col-span-7 flex justify-center">
                <LoadingSpinner />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, i) => {
                if (!day) return <div key={i} />;
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const count = logsByDay[dateKey]?.length || 0;
                const isToday = dateKey === todayKey;
                const isGraceDay = !count && graceCoveredSet.has(dateKey);

                const getEnergyDayStyle = () => {
                  if (isToday) {
                    return count > 0
                      ? { background: 'rgba(28,32,38,0.95)', borderColor: 'hsl(var(--primary))', borderWidth: '2px', boxShadow: '0 0 0 1px hsla(var(--primary)/0.25), inset 0 0 12px hsla(var(--primary)/0.15)' }
                      : { background: 'rgba(28,32,38,0.6)', borderColor: 'hsl(var(--primary))', borderWidth: '2px', boxShadow: '0 0 0 1px hsla(var(--primary)/0.2)' };
                  }
                  if (count > 0) return { background: 'rgba(28,32,38,0.9)', borderWidth: '1.5px', borderColor: 'hsla(var(--primary)/0.4)', boxShadow: 'inset 0 0 8px hsla(var(--primary)/0.1)' };
                  if (isGraceDay) return { background: `${tierColor}0D`, borderColor: `${tierColor}30`, borderWidth: '1px' };
                  return { background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' };
                };

                const getDefaultDayStyle = () => {
                  if (isToday) {
                    return count > 0
                      ? { background: 'hsl(var(--accent))', borderColor: 'hsl(var(--primary))', borderWidth: '2px', boxShadow: '0 0 0 1px hsla(var(--primary)/0.1)' }
                      : { background: 'hsla(var(--accent)/0.08)', borderColor: 'hsl(var(--primary))', borderWidth: '2px', boxShadow: '0 0 0 1px hsla(var(--primary)/0.1)' };
                  }
                  if (count > 0) return { background: 'hsl(var(--accent))', borderWidth: '1.5px', borderColor: 'hsl(var(--accent))' };
                  if (isGraceDay) return { background: `${tierColor}0D`, borderColor: `${tierColor}30`, borderWidth: '1px' };
                  return { background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' };
                };

                return (
                  <button
                    key={i}
                    onClick={() => handleDayClick(day)}
                    className="aspect-square rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 transition-all text-sm font-medium hover:opacity-80 border"
                    style={energyMode ? getEnergyDayStyle() : getDefaultDayStyle()}
                  >
                    <span 
                      className={(isToday || count > 0) ? "font-semibold text-[15px]" : "text-foreground font-semibold text-[15px]"} 
                      style={(isToday || count > 0) ? { 
                        color: energyMode 
                          ? '#FFFFFF' 
                          : (energyPalette === 'royal' && count > 0 ? '#000000' : resolvedTheme === 'dark' ? '#FFFFFF' : 'hsl(222 22% 18%)') 
                      } : {}}
                    >
                      {day}
                    </span>
                    {isGraceDay ? (
                      <Shield
                        title="Grace Day used — your streak was protected"
                        style={{
                          width: 11,
                          height: 11,
                          fill: tierColor,
                          stroke: tierColor,
                          strokeWidth: 1.5,
                          opacity: 0.6,
                          marginTop: 2,
                        }}
                      />
                    ) : (
                      <span 
                        className="text-sm h-4 flex items-center justify-center font-bold opacity-85" 
                        style={count > 0 ? { color: '#10B981' } : { color: 'transparent' }}
                      >
                        {count > 0 ? count : '•'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Reflective Quote - Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-[13px] text-muted-foreground opacity-60 italic">
            {getWeeklyQuote()}
          </p>
        </motion.div>
      </div>

      <Sheet open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <SheetContent side="bottom" className="max-h-[80vh] flex flex-col pb-24">
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
          
          <div className="mt-6 space-y-4 flex-1 overflow-y-auto min-h-0 pr-4">
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowActionSheet(true)}
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

      <AddChapterActionSheet
        open={showActionSheet}
        onOpenChange={setShowActionSheet}
        onAddOne={() => setShowAddForm(true)}
        onBulkAdd={() => setShowBulkModal(true)}
      />

      <BulkAddModal
        open={showBulkModal}
        onOpenChange={setShowBulkModal}
        userId={userId}
        dateKey={selectedDay}
      />
    </div>
  );
}