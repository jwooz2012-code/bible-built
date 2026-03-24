import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, BookOpen, ChevronRight, Pencil } from 'lucide-react';
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

  const { summary, parts, doneCount, totalCount, isComplete, readTodayCount } = useMemo(() => {
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
      return `${book} ${sorted[0]}\u2013${sorted[sorted.length - 1]}`;
    });

    return {
      summary: parts.join(' • '),
      parts,
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
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          className="w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-3.5"
          style={{
            background: 'color-mix(in srgb, rgb(34,197,94) 6%, hsl(var(--card)) 94%)',
            border: '1px solid color-mix(in srgb, rgb(34,197,94) 14%, hsl(var(--border)) 86%)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.07), 0 0 0 0 rgba(34,197,94,0)'
          }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'color-mix(in srgb, rgb(34,197,94) 15%, hsl(var(--card)) 85%)',
              boxShadow: '0 0 10px rgba(34,197,94,0.18)'
            }}>
            <BookOpen className="w-4 h-4" style={{ color: 'rgb(34,197,94)' }} />
          </div>
          <span className="flex-1 text-[14px] font-semibold text-foreground/90">Explore Reading Plans</span>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgb(34,197,94)', opacity: 0.7 }} />
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mb-6 px-7 py-6 cursor-pointer rounded-[18px]"
      onClick={onOpenPlanPreview}
      style={isComplete ? {
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderLeft: `3px solid color-mix(in srgb, ${successBg} 55%, transparent)`,
        boxShadow: '0 0 0 1px hsl(var(--border)) inset'
      } : {
        background: 'color-mix(in srgb, hsl(var(--card)) 60%, hsl(var(--background)) 40%)',
        border: '1px solid color-mix(in srgb, hsl(25 95% 53%) 22%, hsl(var(--border)) 78%)',
        borderLeft: '3px solid hsl(25 95% 53% / 0.55)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)'
      }}>

      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-muted-foreground">
          Today · {formatDateKey(todayKey)}
        </p>
        <motion.button
          onClick={(e) => { e.stopPropagation(); triggerHaptic(); onOpenPlanModal(); }}
          whileTap={{ scale: 0.85, opacity: 0.6 }}
          className="p-1 -mt-0.5 -mr-1 rounded-md text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      <div>

        {summary && (
          <>
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3 h-3 flex-shrink-0" style={{ color: 'hsl(25 95% 53%)' }} />
              <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'hsl(25 95% 53%)' }}>Today's Reading</span>
            </div>
            <div className="mb-2 flex flex-col gap-0.5">
              {(parts && parts.length > 0 ? parts : [summary]).map((line, i) => (
                <span key={i} className="text-[22px] font-semibold text-foreground leading-snug tracking-tight block">
                  {line}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              {plan.name || 'My Reading Plan'}
            </p>
          </>
        )}
      </div>

      {summary && (
        <motion.div whileTap={!isComplete ? { scale: 0.97 } : {}}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleComplete();
            }}
            disabled={isComplete || isCompleting || isMarkingToday}
            className="w-full transition-all duration-200"
            style={isComplete ? {
              background: successBg,
              color: successFg,
              opacity: 1,
              cursor: 'default'
            } : {
              background: 'hsl(25 95% 53%)',
              color: '#fff',
              boxShadow: '0 2px 8px hsl(25 95% 53% / 0.35)'
            }}>
            {(isCompleting || isMarkingToday) ?
              'Saving...' :
              isComplete ?
                <><CheckCircle2 className="w-4 h-4 mr-2" />Completed Today</> :
                'Mark Today Complete'
            }
          </Button>
        </motion.div>
      )}

    </motion.div>);

}