import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAssignmentForDate } from '@/components/bible/plans/planUtils';
import { formatDateKey, addDaysKey } from '@/components/bible/utils/dateUtils';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { PLAN_PRESETS } from '@/components/bible/plans/planPresets';

export default function PlanPreviewSheet({
  open,
  onClose,
  plan,
  userId,
  todayKey,
  logs,
  onOpenPlanModal
}) {
  const navigate = useNavigate();
  const [expandedDays, setExpandedDays] = useState(new Set([todayKey]));

  const handleEditPlan = () => {
    onClose();
    if (plan?.scope === 'CUSTOM') {
      navigate('/CustomPlanBuilder', { state: { existingPlan: plan } });
      return;
    }
    const preset = PLAN_PRESETS.find(p => p.scope === plan?.scope);
    if (preset) {
      navigate(`/PlanDetail?id=${preset.id}`, { state: { existingPlan: plan } });
    } else {
      onOpenPlanModal();
    }
  };

  // Generate 8 date keys: today + next 7 days
  const dateKeys = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => addDaysKey(todayKey, i));
  }, [todayKey]);

  // Fetch PlanDay data for CUSTOM plans
  const isCustomPlan = plan?.scope === 'CUSTOM';
  const { data: planDays = [] } = useQuery({
    queryKey: ['planDays', plan?.id, dateKeys],
    queryFn: async () => {
      if (!plan?.id || !isCustomPlan) return [];
      const allDays = await base44.entities.PlanDay.filter({ planId: plan.id, userId });
      return allDays.filter(day => dateKeys.includes(day.date)).sort((a, b) => a.date.localeCompare(b.date));
    },
    enabled: open && isCustomPlan && !!plan?.id,
    staleTime: 60000,
  });

  // Generate assignments for each day
  const dayAssignments = useMemo(() => {
    if (!plan) return [];

    return dateKeys.map((dateKey) => {
      let assignments = [];

      if (isCustomPlan) {
        // Use PlanDay data
        const planDay = planDays.find(pd => pd.date === dateKey);
        if (planDay?.assignments) {
          assignments = planDay.assignments.map(a => {
            const book = BIBLE_BOOKS.find(b => b.name === a.bookName);
            if (!book) return null;
            return {
              book: book.name,
              chapter: a.chapter,
              chapterId: generateChapterId(book.index, a.chapter),
            };
          }).filter(Boolean);
        }
      } else {
        // Use preset plan logic
        assignments = getAssignmentForDate({ plan, dateKey });
      }

      // Calculate progress
      const planStartDate = plan?.startDate || '2000-01-01';
      const relevantLogs = logs.filter((log) => log.dateKey >= planStartDate);
      const completedIds = new Set(relevantLogs.map((log) => log.chapterId));
      const done = assignments.filter((ch) => completedIds.has(ch.chapterId)).length;

      // Build summary string
      const grouped = assignments.reduce((acc, ch) => {
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
        dateKey,
        assignments,
        summary: parts.join(' • '),
        done,
        total: assignments.length,
        isComplete: done === assignments.length && assignments.length > 0,
      };
    });
  }, [plan, dateKeys, logs, isCustomPlan, planDays]);

  const toggleDay = (dateKey) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  };

  if (!open) return null;

  const hasPlan = !!plan?.startDate && !!plan?.endDate && plan?.scope !== 'NONE';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[70]"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-xl overflow-hidden"
          style={{ maxHeight: '85vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Plan Preview</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div 
            className="overflow-y-auto px-6 py-4" 
            style={{ 
              maxHeight: 'calc(85vh - 65px)',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)'
            }}
          >
            {!hasPlan ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No reading plan selected</p>
                <Button onClick={() => {
                  onClose();
                  onOpenPlanModal();
                }}>
                  Start Reading Plan
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {dayAssignments.map((day, index) => {
                  const isToday = index === 0;
                  const isExpanded = expandedDays.has(day.dateKey);
                  const hasAssignments = day.assignments.length > 0;

                  return (
                    <div
                      key={day.dateKey}
                      className="bb-card bb-glow p-4"
                      style={day.isComplete ? {
                        borderLeft: '3px solid color-mix(in srgb, hsl(142 70% 35%) 55%, transparent)',
                      } : undefined}
                    >
                      <button
                        onClick={() => hasAssignments && toggleDay(day.dateKey)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-foreground">
                                {isToday ? 'Today' : formatDateKey(day.dateKey)}
                              </span>
                              {day.isComplete && (
                                <span className="text-xs text-green-600 dark:text-green-500 font-medium">
                                  Complete
                                </span>
                              )}
                            </div>
                            {hasAssignments ? (
                              <>
                                <p className="text-sm text-muted-foreground truncate">
                                  {day.summary}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {day.done}/{day.total} read
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">
                                No reading scheduled
                              </p>
                            )}
                          </div>
                          {hasAssignments && (
                            <div className="shrink-0 mt-1">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Expanded assignment list */}
                      {isExpanded && hasAssignments && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 pt-3 border-t border-border"
                        >
                          <ul className="space-y-2">
                            {day.assignments.map((ch, idx) => {
                              const isRead = logs.some(log => log.chapterId === ch.chapterId && log.dateKey >= (plan?.startDate || '2000-01-01'));
                              return (
                                <li
                                  key={idx}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${isRead ? 'bg-green-600 dark:bg-green-500' : 'bg-muted-foreground/30'}`} />
                                  <span className={isRead ? 'text-muted-foreground line-through' : 'text-foreground'}>
                                    {ch.book} {ch.chapter}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Edit Plan Button */}
            {hasPlan && (
              <div className="mt-6 pb-2">
                <Button
                  variant="outline"
                  onClick={handleEditPlan}
                  className="w-full"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Plan
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}