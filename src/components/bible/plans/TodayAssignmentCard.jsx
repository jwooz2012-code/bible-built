import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { computeTodayAssignment, getAssignmentForDate } from '@/components/bible/plans/planUtils';
import { useCompleteTodaysAssignment } from '@/components/bible/hooks/useCompleteTodaysAssignment';

export default function TodayAssignmentCard({
  plan,
  allTimeLogs,
  todayKey,
  onOpenPlanModal,
  onDismissPrompt,
  showPrompt,
  userId
}) {
  const hasPlan = !!plan?.startDate && !!plan?.endDate;
  const { completeToday, isCompleting } = useCompleteTodaysAssignment();

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

  const { summary, doneCount, totalCount, isComplete } = useMemo(() => {
    if (!assignedToday.length) {
      return { summary: '', doneCount: 0, totalCount: 0, isComplete: true };
    }

    // Check progress across all logs (not just today's)
    const completedIds = new Set(allTimeLogs.map((log) => log.chapterId));
    const done = assignedToday.filter((ch) => completedIds.has(ch.chapterId)).length;
    const total = assignedToday.length;

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
      isComplete: done === total
    };
  }, [assignedToday, allTimeLogs]);

  const handleComplete = () => {
    completeToday({ userId, plan, allTimeLogs, todayKey });
  };

  if (!hasPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bb-card bb-glow px-6 py-5">

        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Today's Assignment</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Choose a plan and Bible Built will guide you every day.
        </p>
        <div className="flex items-center gap-3">
          <Button onClick={onOpenPlanModal} className="flex-1">
            Choose a Plan
          </Button>
          {showPrompt && onDismissPrompt &&
          <button
            onClick={onDismissPrompt}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors">

              Not now
            </button>
          }
        </div>
      </motion.div>);

  }

  if (!assignment) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bb-card bb-glow px-6 py-5">

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Today's Reading</h3>
        </div>
        <button
          onClick={onOpenPlanModal}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors">

          Edit Plan
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center mb-4">
        <div>
          <div className="text-2xl font-bold text-foreground">{assignment.perDay}</div>
          <div className="text-xs text-muted-foreground">per day</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{assignment.daysLeft}</div>
          <div className="text-xs text-muted-foreground">days left</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{assignment.remaining}</div>
          <div className="text-xs text-muted-foreground">remaining</div>
        </div>
      </div>

      {summary &&
      <div className="border-t border-border pt-4 space-y-3">
          <div>
            <div className="text-sm font-medium text-foreground mb-1">{summary}</div>
            <div className="text-xs text-muted-foreground">
              {doneCount}/{totalCount} done today
            </div>
            <div className="text-xs text-muted-foreground/70 mt-1">
              Reading ahead counts toward future days.
            </div>
          </div>
          <Button
          onClick={handleComplete}
          disabled={isComplete || isCompleting}
          className="w-full">

            {isCompleting ?
          'Saving...' :
          isComplete ?
          <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Today Completed
              </> :

          'Mark Today Complete'
          }
          </Button>
        </div>
      }
    </motion.div>);

}