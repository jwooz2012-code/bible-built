import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { computeTodayAssignment, getAssignmentForDate } from '@/components/bible/plans/planUtils';
import { useCompleteTodaysAssignment } from '@/components/bible/hooks/useCompleteTodaysAssignment';
import { formatDateKey, addDaysKey } from '@/components/bible/utils/dateUtils';

export default function TodayAssignmentCard({
  plan,
  allTimeLogs,
  todayKey,
  onOpenPlanModal,
  onDismissPrompt,
  showPrompt,
  userId
}) {
  const hasPlan = !!plan?.startDate && !!plan?.endDate && plan?.scope !== 'NONE';
  const { completeToday, isCompleting } = useCompleteTodaysAssignment();
  const [showTomorrow, setShowTomorrow] = useState(false);

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
    return getAssignmentForDate({ plan, dateKey: todayKey });
  }, [hasPlan, plan, todayKey]);

  const { summary, doneCount, totalCount, isComplete, readTodayCount } = useMemo(() => {
    if (!assignedToday.length) {
      return { summary: '', doneCount: 0, totalCount: 0, isComplete: true, readTodayCount: 0 };
    }

    // Check progress across all logs (not just today's)
    const completedIds = new Set(allTimeLogs.map((log) => log.chapterId));
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

    const completedIds = new Set(allTimeLogs.map((log) => log.chapterId));
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
    completeToday({ userId, plan, allTimeLogs, todayKey });
  };

  if (!hasPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6">

        <Button 
          onClick={onOpenPlanModal} 
          className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm">
          <Calendar className="w-5 h-5 mr-2" />
          Start Reading Plan
        </Button>
      </motion.div>);

  }

  if (!assignment) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bb-card bb-glow px-6 py-5"
      style={isComplete ? {
        background: 'color-mix(in srgb, var(--primary) 4%, transparent)',
        borderLeftWidth: '3px',
        borderLeftColor: 'hsl(var(--primary))'
      } : undefined}>

      <div 
        className="cursor-pointer" 
        onClick={onOpenPlanModal}>
        
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
              {plan.scope === 'LEADERSHIP_30' ? 'Leadership Intensive' : 
               plan.scope === 'WISDOM_7' ? 'Wisdom Plunge' :
               plan.scope === 'BIBLE' ? 'Whole Bible' :
               plan.scope === 'OT' ? 'Old Testament' :
               plan.scope === 'NT' ? 'New Testament' :
               plan.scope === 'PSALMS' ? 'Psalms' : 'Reading Plan'} · {totalCount} {totalCount === 1 ? 'chapter' : 'chapters'}
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
          disabled={isComplete || isCompleting}
          className="w-full"
          style={isComplete ? {
            background: 'hsl(var(--primary))',
            color: 'white'
          } : undefined}>
          {isCompleting ? 
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
    </motion.div>);

}