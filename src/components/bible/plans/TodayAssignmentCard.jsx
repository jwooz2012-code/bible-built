import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, ChevronDown, ChevronUp, BookOpen, ChevronRight } from 'lucide-react';
import { triggerHaptic } from '@/components/utils/haptics';
import { computeTodayAssignment, getAssignmentForDate } from '@/components/bible/plans/planUtils';
import { useCompleteTodaysAssignment } from '@/components/bible/hooks/useCompleteTodaysAssignment';
import { useTodayPlanDay } from '@/components/bible/hooks/usePlanDays';
import { useMarkTodayComplete } from '@/components/bible/hooks/useMarkTodayComplete';
import { formatDateKey, addDaysKey } from '@/components/bible/utils/dateUtils';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';

export default function TodayAssignmentCard({
  plan,
  allTimeLogs,
  todayKey,
  onOpenPlanModal,
  onOpenPlanPreview,
  onDismissPrompt,
  showPrompt,
  userId
}) {
  const hasPlan = !!plan?.startDate && !!plan?.endDate && plan?.scope !== 'NONE';
  const { completeToday, isPending: isCompleting } = useCompleteTodaysAssignment();
  const { markTodayComplete, isPending: isMarkingToday } = useMarkTodayComplete();
  const [showTomorrow, setShowTomorrow] = useState(false);
  
  // Check if this is a CUSTOM plan with PlanDays
  const isCustomPlan = plan?.scope === 'CUSTOM';
  const { data: todayPlanDay } = useTodayPlanDay({ 
    planId: plan?.id, 
    todayKey, 
    enabled: isCustomPlan 
  });

  const assignment = useMemo(() => {
    if (!hasPlan) return null;
    try {
      return computeTodayAssignment({ plan, logs: allTimeLogs, todayKey });
    } catch (error) {
      return null;
    }
  }, [hasPlan, plan, allTimeLogs, todayKey]);

  const assignedToday = useMemo(() => {
    if (!hasPlan) return [];
    
    // For CUSTOM plans, use PlanDays
    if (isCustomPlan && todayPlanDay) {
      return (todayPlanDay.assignments || []).map(a => {
        const book = BIBLE_BOOKS.find(b => b.name === a.bookName);
        if (!book) return null;
        return {
          book: book.name,
          chapter: a.chapter,
          chapterId: generateChapterId(book.index, a.chapter),
        };
      }).filter(Boolean);
    }
    
    return getAssignmentForDate({ plan, dateKey: todayKey });
  }, [hasPlan, plan, todayKey, isCustomPlan, todayPlanDay]);

  const { summary, doneCount, totalCount, isComplete, readTodayCount } = useMemo(() => {
    if (!assignedToday.length) {
      return { summary: '', doneCount: 0, totalCount: 0, isComplete: true, readTodayCount: 0 };
    }

    // Check progress only from logs on or after plan start date
    const planStartDate = plan?.startDate || '2000-01-01';
    const relevantLogs = allTimeLogs.filter((log) => log.dateKey >= planStartDate);
    const completedIds = new Set(relevantLogs.map((log) => log.chapterId));
    const done = assignedToday.filter((ch) => completedIds.has(ch.chapterId)).length;
    const total = assignedToday.length;

    // Count chapters actually read today
    const readToday = allTimeLogs.filter((log) => log.dateKey === todayKey).length;

    // Build summary string
    const grouped = assignedToday.reduce((acc, ch) => {
      if (!acc[ch.book]) acc[ch.book] = [];
      acc[ch.book].push(ch.chapter);
      return acc;
    }, {});

    const parts = Object.entries(grouped).map(([book, chapters]) => {
      if (chapters.length === 1) return `${book} ${chapters[0]}`;
      const sorted = chapters.sort((a, b) => a - b);
      return `${book} ${sorted[0]}–${sorted[sorted.length - 1]}`;
    });

    return {
      summary: parts.join(' • '),
      doneCount: done,
      totalCount: total,
      isComplete: done === total,
      readTodayCount: readToday
    };
  }, [assignedToday, allTimeLogs, todayKey]);

  const tomorrowData = useMemo(() => {
    if (!showTomorrow || !hasPlan) return null;
    
    const nextKey = addDaysKey(todayKey, 1);
    const assignedTomorrow = getAssignmentForDate({ plan, dateKey: nextKey });
    
    if (!assignedTomorrow.length) return null;

    // Check progress only from logs on or after plan start date
    const planStartDate = plan?.startDate || '2000-01-01';
    const relevantLogs = allTimeLogs.filter((log) => log.dateKey >= planStartDate);
    const completedIds = new Set(relevantLogs.map((log) => log.chapterId));
    const doneTomorrow = assignedTomorrow.filter((ch) => completedIds.has(ch.chapterId)).length;

    // Build summary string
    const grouped = assignedTomorrow.reduce((acc, ch) => {
      if (!acc[ch.book]) acc[ch.book] = [];
      acc[ch.book].push(ch.chapter);
      return acc;
    }, {});

    const parts = Object.entries(grouped).map(([book, chapters]) => {
      if (chapters.length === 1) return `${book} ${chapters[0]}`;
      const sorted = chapters.sort((a, b) => a - b);
      return `${book} ${sorted[0]}–${sorted[sorted.length - 1]}`;
    });

    return {
      dateKey: nextKey,
      summary: parts.join(' • '),
      done: doneTomorrow,
      total: assignedTomorrow.length
    };
  }, [showTomorrow, hasPlan, plan, todayKey, allTimeLogs]);

  const handleComplete = () => {
    if (isCustomPlan && assignedToday.length > 0) {
      // Use new hook for CUSTOM plans
      markTodayComplete({
        userId,
        todayAssignments: assignedToday.map(a => ({
          bookName: a.book,
          chapter: a.chapter,
        })),
      });
    } else {
      // Use existing hook for other plans
      completeToday({ userId, plan, logs: allTimeLogs, todayKey });
    }
  };

  // Compute plan progress for active plan
  const planDayNumber = useMemo(() => {
    if (!hasPlan || !plan?.startDate) return null;
    const start = new Date(plan.startDate);
    const today = new Date(todayKey);
    return Math.max(1, Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1);
  }, [hasPlan, plan, todayKey]);

  const planTotalDays = useMemo(() => {
    if (!hasPlan || !plan?.startDate || !plan?.endDate) return null;
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    return Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1);
  }, [hasPlan, plan]);

  if (!hasPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5">
        <motion.button
          onClick={() => { triggerHaptic(); onOpenPlanModal(); }}
          whileTap={{ scale: 0.97, opacity: 0.9 }}
          className="w-full text-left rounded-2xl bg-card border border-border px-5 py-4 flex items-center gap-4"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-foreground">Explore Reading Plans</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">Stay consistent with a guided path through Scripture</p>
          </div>
          <div className="flex items-center gap-1 text-[13px] font-medium text-muted-foreground flex-shrink-0">
            <span>Browse</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </motion.button>
      </motion.div>);

  }

  if (!assignment) return null;

  const planProgressLine = planDayNumber && planTotalDays
    ? `Current plan: Day ${planDayNumber} of ${planTotalDays}`
    : null;

  // Success color for completed state (theme-safe green)
  const successBg = 'hsl(142 70% 35%)';
  const successFg = 'hsl(0 0% 100%)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      className="mb-6 px-7 py-6 cursor-pointer rounded-[18px]"
      onClick={onOpenPlanPreview}
      style={isComplete ? {
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderLeft: `3px solid color-mix(in srgb, ${successBg} 55%, transparent)`,
        boxShadow: '0 0 0 1px hsl(var(--border)) inset'
      } : {
        background: 'color-mix(in srgb, hsl(var(--card)) 60%, hsl(var(--background)) 40%)',
        border: '1px solid color-mix(in srgb, hsl(var(--foreground)) 8%, transparent)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
      }}>

      <div>
        
        {/* Date line */}
        <p className="text-xs text-muted-foreground mb-2">
          Today · {formatDateKey(todayKey)}
        </p>

        {/* Reading reference - large and bold */}
        {summary && (
          <>
            <h3 className="text-2xl font-bold text-foreground mb-2 leading-tight">
              {summary}
            </h3>
            
            {/* Context line */}
            <p className="text-sm text-muted-foreground mb-4">
              {plan.name || 'My Reading Plan'} · {totalCount} {totalCount === 1 ? 'chapter' : 'chapters'}
            </p>
          </>
        )}
      </div>

      {summary && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleComplete();
          }}
          disabled={isComplete || isCompleting || isMarkingToday}
          className="w-full"
          style={isComplete ? {
            background: successBg,
            color: successFg,
            opacity: 1,
            cursor: 'default'
          } : undefined}>
          {(isCompleting || isMarkingToday) ? 
            'Saving...' : 
            isComplete ? 
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Completed Today
              </> : 
              'Mark Today Complete'
          }
        </Button>
      )}

      {planProgressLine && (
        <motion.button
          onClick={(e) => { e.stopPropagation(); triggerHaptic(); onOpenPlanModal(); }}
          whileTap={{ scale: 0.97 }}
          className="w-full mt-3 flex items-center justify-between px-3 py-2 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[12px] font-medium text-muted-foreground">Explore Reading Plans</span>
          </div>
          <span className="text-[11px] text-muted-foreground/70">{planProgressLine} →</span>
        </motion.button>
      )}
    </motion.div>);

}