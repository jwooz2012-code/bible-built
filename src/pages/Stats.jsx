import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { useReadingStats } from '@/components/bible/hooks/useReadingStats';
import { TOTAL_CHAPTERS, OT_CHAPTERS, NT_CHAPTERS, BIBLE_BOOKS } from '@/components/bible/bibleData';
import { 
  Pencil, 
  Zap, 
  BookMarked, 
  CalendarCheck, 
  Library, 
  Award, 
  Flame, 
  Blocks, 
  Columns, 
  BookCopy, 
  Ruler, 
  ScrollText, 
  Crown, 
  RefreshCw, 
  TreePine, 
  Hammer,
  Circle,
  Sword
} from 'lucide-react';
import { toast } from 'sonner';
import VelocityMeter from '@/components/trackers/VelocityMeter';
import CoverageRadar from '@/components/trackers/CoverageRadar';
import BookCompletionBars from '@/components/trackers/BookCompletionBars';
import PersonalRecordsCard from '@/components/trackers/PersonalRecordsCard';
import { groupByDateKey, computeVelocity, computeBookProgress, computeSectionCoverage, computeRecords } from '@/components/trackers/deriveStats';
import { BOOK_TO_SECTION, computeSectionTotals } from '@/components/bible/bibleSections';
import { getDateKey } from '@/components/bible/utils/dateUtils';

export default function Stats() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBaselineDialog, setShowBaselineDialog] = useState(false);
  const [baselineInput, setBaselineInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    base44.auth.me().
    then((u) => {if (mounted) {setUser(u);setIsLoading(false);}}).
    catch(() => {if (mounted) setIsLoading(false);});
    return () => {mounted = false;};
  }, []);

  const userId = user?.id;
  const currentYear = new Date().getFullYear();
  const yearStart = `${currentYear}-01-01`;
  const yearEnd = `${currentYear}-12-31`;

  const { data: yearLogs = [], isLoading: yearLoading } = useReadingLogsRange(userId, yearStart, yearEnd);
  const { data: lifetimeLogs = [], isLoading: lifetimeLoading } = useReadingLogsRange(userId, '2000-01-01', '2099-12-31');

  const yearStats = useReadingStats(yearLogs);
  const lifetimeStats = useReadingStats(lifetimeLogs);

  const today = getDateKey();

  const trackerStats = useMemo(() => {
    if (!lifetimeLogs.length) {
      return {
        velocity: { avg7: 0, trend: 'flat' },
        sectionCoverage: [],
        bookProgressYear: [],
        bookProgressLifetime: [],
        records: { longestStreak: 0, bestRolling7: 0, bestMonth: 0, mostReadBook: { name: 'None', count: 0 } }
      };
    }

    const dateCountMap = groupByDateKey(lifetimeLogs);
    const velocity = computeVelocity(dateCountMap, today);
    const sectionTotals = computeSectionTotals(BIBLE_BOOKS, BOOK_TO_SECTION);
    const sectionCoverage = computeSectionCoverage(lifetimeLogs, BOOK_TO_SECTION, sectionTotals);
    const bookProgressYear = computeBookProgress(yearLogs, BIBLE_BOOKS, 'year');
    const bookProgressLifetime = computeBookProgress(lifetimeLogs, BIBLE_BOOKS, 'lifetime');
    const records = computeRecords(dateCountMap, lifetimeLogs);

    return { velocity, sectionCoverage, bookProgressYear, bookProgressLifetime, records };
  }, [lifetimeLogs, yearLogs, today]);

  const baselineCompletions = user?.baselineCompletions || 0;
  const trackedCompletions = lifetimeStats.timesThroughBible;
  const lifetimeTotal = baselineCompletions + trackedCompletions;

  // Calculate additional stats for achievements
  const totalChaptersRead = lifetimeStats.totalCount;
  const bibleReadThroughCount = lifetimeTotal;

  // Count distinct books completed (books where ALL chapters have been read)
  const totalBooksCompletedDistinct = (() => {
    const bookChaptersRead = {};
    lifetimeLogs.forEach((log) => {
      if (!bookChaptersRead[log.book]) {
        bookChaptersRead[log.book] = new Set();
      }
      bookChaptersRead[log.book].add(log.chapter);
    });

    let completedCount = 0;
    Object.keys(bookChaptersRead).forEach((bookName) => {
      const bookData = BIBLE_BOOKS.find((b) => b.name === bookName);
      if (bookData && bookChaptersRead[bookName].size >= bookData.chapters) {
        completedCount++;
      }
    });
    return completedCount;
  })();

  // Count distinct days with reading
  const uniqueDays = new Set(lifetimeLogs.map((log) => log.dateKey));
  const daysWithReadingDistinct = uniqueDays.size;

  // NT read through count
  const ntReadThroughCount = Math.floor(lifetimeStats.ntCount / NT_CHAPTERS);

  // Check if OT or NT completed at least once
  const otOrNtCompletedFlag = lifetimeStats.otCount >= OT_CHAPTERS || lifetimeStats.ntCount >= NT_CHAPTERS;

  // Get icon for achievement by title
  const getAchievementIcon = (title, achieved) => {
    const iconProps = { className: "w-5 h-5", strokeWidth: 2 };
    // Battle badge uses theme-aware color, no inline style
    const color = title === 'Battle' ? undefined : (achieved ? '#FFFFFF' : '#9CA3AF');
    
    switch(title) {
      case 'Battle':
        return <Sword {...iconProps} />;
      case 'First Rep':
        return <Zap {...iconProps} style={{ color }} />;
      case 'Locked In':
        return <BookMarked {...iconProps} style={{ color }} />;
      case 'Habit Forming':
        return <CalendarCheck {...iconProps} style={{ color }} />;
      case 'Fifty Down':
        return <Library {...iconProps} style={{ color }} />;
      case 'Triple Digits':
        return <Award {...iconProps} style={{ color }} />;
      case 'All In':
        return <Flame {...iconProps} style={{ color }} />;
      case 'Built to Last':
        return <Blocks {...iconProps} style={{ color }} />;
      case 'Cover to Cover':
        return <BookCopy {...iconProps} style={{ color }} />;
      case 'Testament Strong':
        return <ScrollText {...iconProps} style={{ color }} />;
      case 'The Whole Word':
        return <Crown {...iconProps} style={{ color }} />;
      case 'Back for More':
        return <RefreshCw {...iconProps} style={{ color }} />;
      case 'Deep Roots':
        return <TreePine {...iconProps} style={{ color }} />;
      case 'Iron Discipline':
        return <Hammer {...iconProps} style={{ color }} />;
      case 'Master Builder':
        return <Ruler {...iconProps} style={{ color }} />;
      case 'Built for a Lifetime':
        return <Columns {...iconProps} style={{ color }} />;
      default:
        return <Circle {...iconProps} style={{ color }} />;
    }
  };

  // Get color for achievement by title
  const getAchievementColor = (title) => {
    switch(title) {
      case 'Battle': return 'BLACK_WHITE';
      case 'First Rep': return 'from-[#D1D5DB] to-[#9CA3AF]'; // Silver
      case 'Locked In': return 'from-[#10B981] to-[#059669]'; // Forest green
      case 'Habit Forming': return 'from-[#10B981] to-[#059669]'; // Accent green
      case 'Fifty Down': return 'from-[#F97316] to-[#EA580C]'; // Accent orange
      case 'Triple Digits': return 'from-[#FBBF24] to-[#F59E0B]'; // Accent gold
      case 'All In': return 'from-[#EF4444] to-[#DC2626]'; // Accent red-orange
      case 'Built to Last': return 'from-[#D4A574] to-[#B8956A]'; // Accent clay
      case 'Built for a Lifetime': return 'from-[#64748B] to-[#475569]'; // Accent slate
      case 'Cover to Cover': return 'from-[#14B8A6] to-[#0D9488]'; // Accent teal
      case 'Testament Strong': return 'from-[#A855F7] to-[#9333EA]'; // Accent purple
      case 'The Whole Word': return 'from-[#FBBF24] to-[#F59E0B]'; // Accent gold
      case 'Back for More': return 'from-[#0EA5E9] to-[#0284C7]'; // Accent sky
      case 'Deep Roots': return 'from-[#84CC16] to-[#65A30D]'; // Accent brown/green
      case 'Iron Discipline': return 'from-[#6B7280] to-[#4B5563]'; // Accent graphite
      case 'Master Builder': return 'from-[#6366F1] to-[#4F46E5]'; // Accent indigo
      case 'default': return 'from-[#F97316] to-[#FACC15]';
    }
  };

  // Define achievements with simple threshold checks
  const achievements = [
  { id: 0, title: 'Battle', subtitle: 'You showed up knowing the Christian life is a fight. The Word of God is your weapon — and this is where faithfulness begins.', achieved: true, current: 1, target: 1 },
  { id: 1, title: 'First Rep', subtitle: 'Read your first chapter', achieved: totalChaptersRead >= 1, current: totalChaptersRead, target: 1 },
  { id: 2, title: 'Locked In', subtitle: 'Completed a book', achieved: totalBooksCompletedDistinct >= 1, current: totalBooksCompletedDistinct, target: 1 },
  { id: 3, title: 'Habit Forming', subtitle: 'Read for 7 days', achieved: daysWithReadingDistinct >= 7, current: daysWithReadingDistinct, target: 7 },
  { id: 4, title: 'Fifty Down', subtitle: 'Read 50 chapters', achieved: totalChaptersRead >= 50, current: totalChaptersRead, target: 50 },
  { id: 5, title: 'Triple Digits', subtitle: 'Read 100 chapters', achieved: totalChaptersRead >= 100, current: totalChaptersRead, target: 100 },
  { id: 6, title: 'All In', subtitle: 'Read 250 chapters', achieved: totalChaptersRead >= 250, current: totalChaptersRead, target: 250 },
  { id: 7, title: 'Built to Last', subtitle: 'Read 500 chapters', achieved: totalChaptersRead >= 500, current: totalChaptersRead, target: 500 },
  { id: 8, title: 'Cover to Cover', subtitle: 'Completed 10 books', achieved: totalBooksCompletedDistinct >= 10, current: totalBooksCompletedDistinct, target: 10 },
  { id: 9, title: 'Testament Strong', subtitle: 'Finished OT or NT', achieved: otOrNtCompletedFlag, current: Math.max(lifetimeStats.otCount, lifetimeStats.ntCount), target: Math.min(OT_CHAPTERS, NT_CHAPTERS) },
  { id: 10, title: 'The Whole Word', subtitle: 'Read the entire Bible', achieved: bibleReadThroughCount >= 1, current: lifetimeStats.totalCount, target: TOTAL_CHAPTERS },
  { id: 11, title: 'Back for More', subtitle: 'Read the Bible twice', achieved: bibleReadThroughCount >= 2, current: bibleReadThroughCount, target: 2 },
  { id: 12, title: 'Deep Roots', subtitle: 'Read NT 5 times', achieved: ntReadThroughCount >= 5, current: ntReadThroughCount, target: 5 },
  { id: 13, title: 'Iron Discipline', subtitle: 'Read for 250 days', achieved: daysWithReadingDistinct >= 250, current: daysWithReadingDistinct, target: 250 },
  { id: 14, title: 'Master Builder', subtitle: 'Completed 30 books', achieved: totalBooksCompletedDistinct >= 30, current: totalBooksCompletedDistinct, target: 30 },
  { id: 15, title: 'Built for a Lifetime', subtitle: 'Read 1000 chapters', achieved: totalChaptersRead >= 1000, current: totalChaptersRead, target: 1000 }];


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-20 w-64" />
      </div>);

  }

  if (!user || !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-20 w-64" />
      </div>);

  }

  const handleEditBaseline = () => {
    setBaselineInput(String(baselineCompletions));
    setShowBaselineDialog(true);
  };

  const handleSaveBaseline = async () => {
    const value = parseInt(baselineInput, 10);
    if (isNaN(value) || value < 0 || value > 99) {
      toast.error('Please enter a number between 0 and 99');
      return;
    }

    setIsSaving(true);
    try {
      await base44.auth.updateMe({ baselineCompletions: value });
      setUser({ ...user, baselineCompletions: value });
      setShowBaselineDialog(false);
      toast.success('Updated starting count.');
    } catch (error) {
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-5 py-8">
        <PageHeader title="Statistics" subtitle="Your reading progress" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-card border border-border rounded-2xl p-5 mb-8">

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              This Year ({currentYear})
            </h2>
          </div>

          {yearLoading ?
          <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
            </div> :

          <div className="space-y-4">
              <div className="text-center pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground mb-2">Chapters Read</p>
                <p className="text-5xl font-bold text-foreground mb-3">{yearStats.totalCount}</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground font-medium">{yearStats.totalCount} / {TOTAL_CHAPTERS}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground font-medium">{yearStats.totalPercent}%</span>
                </div>
                <div className="relative w-full h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.max(0, Math.min(100, yearStats.totalPercent || 0))}%`,
                    background: 'linear-gradient(90deg, #F97316 0%, #FACC15 50%, #FB923C 100%)',
                    boxShadow: '0 0 8px var(--energy-glow)'
                  }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1.5">Old Testament</p>
                  <p className="text-xl font-semibold text-foreground">{yearStats.otCount}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{yearStats.otPercent}%</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1.5">New Testament</p>
                  <p className="text-xl font-semibold text-foreground">{yearStats.ntCount}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{yearStats.ntPercent}%</p>
                </div>
              </div>

              {(() => {
              const uniqueReadingDays = new Set(yearLogs.map((log) => log.dateKey)).size;
              if (uniqueReadingDays === 0) return null;
              const avgChaptersPerDay = yearStats.totalCount / uniqueReadingDays;
              const remainingChapters = TOTAL_CHAPTERS - yearStats.totalCount;
              const estimatedDays = Math.ceil(remainingChapters / avgChaptersPerDay);
              return (
                <p className="text-xs text-muted-foreground/80 text-center pt-1">
                    At this pace: ~{estimatedDays} days to finish
                  </p>);

            })()}
            </div>
          }
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-5 mb-8">

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Lifetime</h2>
            <p className="text-sm text-muted-foreground">All-time reading history</p>
          </div>

          {lifetimeLoading ?
          <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
            </div> :

          <div className="space-y-4">
              <div className="text-center rounded-xl p-4 relative" style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(250, 204, 21, 0.12) 100%)',
              boxShadow: '0 0 16px var(--energy-glow)'
            }}>
                <Button
                variant="ghost"
                size="sm"
                onClick={handleEditBaseline} className="text-muted-foreground text-xs font-medium opacity-100 rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent absolute top-2 right-2 h-8 w-8 p-0 hover:text-foreground">


                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <p className="text-xs text-muted-foreground mb-1.5">Times Through the Bible</p>
                <p className="text-5xl font-bold mb-2" style={{ color: '#F97316' }}>{lifetimeTotal}</p>
                <div className="space-y-1.5 mt-3">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span>{lifetimeStats.progressToNext} / {TOTAL_CHAPTERS}</span>
                    <span>•</span>
                    <span>{lifetimeStats.percentToNext}% to next</span>
                  </div>
                  <div className="relative w-full h-1 bg-background/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${lifetimeStats.percentToNext}%`,
                        background: 'linear-gradient(90deg, #F97316 0%, #FACC15 100%)'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Chapters Read</p>
                <p className="text-3xl font-semibold text-foreground mb-3">{lifetimeStats.totalCount}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1.5">Old Testament</p>
                    <p className="text-xl font-semibold text-foreground">{lifetimeStats.otCount}</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1.5">New Testament</p>
                    <p className="text-xl font-semibold text-foreground">{lifetimeStats.ntCount}</p>
                  </div>
                </div>
              </div>
            </div>
          }
        </motion.div>

        {/* Reading Velocity Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.1 }}
          className="mb-8">
          <VelocityMeter avg7={trackerStats.velocity.avg7} trend={trackerStats.velocity.trend} />
        </motion.div>

        {/* Bible Coverage Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.12 }}
          className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Bible Coverage</h2>
            <p className="text-sm text-muted-foreground">Where you've spent time in Scripture</p>
          </div>
          <CoverageRadar sectionData={trackerStats.sectionCoverage} />
        </motion.div>

        {/* Books Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.14 }}
          className="mb-8">
          <BookCompletionBars
            bookProgressYear={trackerStats.bookProgressYear}
            bookProgressLifetime={trackerStats.bookProgressLifetime} />
        </motion.div>

        {/* Records Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.16 }}
          className="mb-8">
          <PersonalRecordsCard records={trackerStats.records} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.18 }}>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Badges</h2>
            <p className="text-sm text-muted-foreground">Milestones you've earned</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="mb-4 flex items-center gap-3">
              <Award className="w-6 h-6" style={{ color: '#FACC15' }} />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {achievements.filter((a) => a.achieved).length} / {achievements.length} unlocked
                </p>
              </div>
            </div>

            {!lifetimeLoading && achievements.filter((a) => a.achieved).length > 0 && (
              <div className="mb-6 pb-5 border-b border-border">
                <p className="text-xs text-muted-foreground mb-3">Unlocked Badges</p>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  {achievements.filter((a) => a.achieved).map((achievement) => {
                    const color = getAchievementColor(achievement.title);
                    const isBW = color === 'BLACK_WHITE';
                    return (
                      <div
                        key={achievement.id}
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isBW ? 'bg-foreground' : `bg-gradient-to-br ${color}`
                        }`}
                        style={{
                          boxShadow: '0 2px 4px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
                          border: '2px solid',
                          borderColor: 'color-mix(in srgb, var(--border) 60%, transparent)'
                        }}
                      >
                        <div 
                          style={{ 
                            color: isBW ? 'hsl(var(--background))' : '#FFFFFF',
                            filter: 'drop-shadow(0 0.5px 1px rgba(0,0,0,0.2))',
                            opacity: 0.95
                          }}>
                          {getAchievementIcon(achievement.title, true)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {lifetimeLoading ?
          <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div> :

          <div className="grid grid-cols-1 gap-3">
              {achievements.map((achievement) => {
                const color = getAchievementColor(achievement.title);
                const isBW = color === 'BLACK_WHITE';
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className={`rounded-xl p-4 border transition-all ${
                      achievement.achieved ?
                      'bg-card border-[#F97316]' :
                      'bg-secondary border-border/50'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          achievement.achieved
                            ? isBW
                              ? 'bg-foreground'
                              : `bg-gradient-to-br ${color}`
                            : 'bg-muted'
                        }`}
                        style={{ 
                          opacity: achievement.achieved ? 1 : 0.5,
                          boxShadow: achievement.achieved 
                            ? '0 1px 3px rgba(0,0,0,0.1), inset 0 0.5px 0 rgba(255,255,255,0.1)'
                            : 'none',
                          border: '2px solid',
                          borderColor: achievement.achieved 
                            ? 'color-mix(in srgb, var(--border) 60%, transparent)'
                            : 'var(--border)'
                        }}>
                        <div 
                          style={{ 
                            color: achievement.achieved && isBW ? 'hsl(var(--background))' : undefined,
                            filter: achievement.achieved ? 'drop-shadow(0 0.5px 0.5px rgba(0,0,0,0.15))' : 'none',
                            opacity: achievement.achieved ? 0.95 : 1
                          }}>
                          {getAchievementIcon(achievement.title, achievement.achieved)}
                        </div>
                      </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-[15px] ${
                  achievement.achieved ? 'text-foreground' : 'text-muted-foreground'}`
                  }>
                        {achievement.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.subtitle}</p>
                      {!achievement.achieved &&
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                          {achievement.current} / {achievement.target}
                        </p>
                  }
                    </div>
                    {achievement.achieved &&
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #F97316, #FACC15)' }} />

                    }
                    </div>
                  </motion.div>
                );
              })}
            </div>
            }
            </div>
            </motion.div>
            </div>

            <Dialog open={showBaselineDialog} onOpenChange={setShowBaselineDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Starting Count</DialogTitle>
            <DialogDescription>
              Completions before using Bible Built. Does not change reading logs.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              min="0"
              max="99"
              value={baselineInput}
              onChange={(e) => setBaselineInput(e.target.value)}
              placeholder="0"
              className="text-center text-lg" />

          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBaselineDialog(false)}
              disabled={isSaving}>

              Cancel
            </Button>
            <Button
              onClick={handleSaveBaseline}
              disabled={isSaving}>

              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

}