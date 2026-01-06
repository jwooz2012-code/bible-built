import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { computeTodayAssignment } from '@/components/bible/plans/planUtils';

export default function TodayAssignmentCard({ 
  plan, 
  allTimeLogs, 
  todayKey, 
  onOpenPlanModal,
  onDismissPrompt,
  showPrompt 
}) {
  const hasPlan = !!plan?.startDate && !!plan?.endDate;

  const assignment = useMemo(() => {
    if (!hasPlan) return null;
    try {
      return computeTodayAssignment({ plan, logs: allTimeLogs, todayKey });
    } catch (error) {
      return null;
    }
  }, [hasPlan, plan, allTimeLogs, todayKey]);

  if (!hasPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bb-card bb-glow px-6 py-5"
      >
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
          {showPrompt && onDismissPrompt && (
            <button
              onClick={onDismissPrompt}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Not now
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  if (!assignment) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bb-card bb-glow px-6 py-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Today's Assignment</h3>
        </div>
        <button
          onClick={onOpenPlanModal}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
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

      {assignment.today.length > 0 && (
        <div className="border-t border-border pt-3">
          <div className="text-xs font-medium text-muted-foreground mb-2">Today's Chapters:</div>
          <div className="flex flex-wrap gap-2">
            {assignment.today.map((ch) => (
              <div
                key={ch.chapterId}
                className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground"
              >
                {ch.book} {ch.chapter}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}