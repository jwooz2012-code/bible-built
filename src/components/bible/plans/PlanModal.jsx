import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, Compass, Crown, Heart, Lamp, Leaf, Hourglass, Scroll, ChevronRight } from 'lucide-react';
import { getDateKey, formatDateKey, addDaysKey, formatDateRange } from '@/components/bible/utils/dateUtils';
import { computeTodayAssignment, buildScopeChapters, getAssignmentForDate } from '@/components/bible/plans/planUtils';
import { PLAN_PRESETS } from '@/components/bible/plans/planPresets';
import { useUpsertReadingPlan } from '@/components/bible/hooks/useReadingPlan';
import { createPageUrl } from '@/utils';

export default function PlanModal({ open, onClose, userId, existingPlan, logs }) {
  const navigate = useNavigate();
  const todayKey = getDateKey();
  
  const [scope, setScope] = useState('BIBLE');
  const [startDate, setStartDate] = useState(todayKey);
  const [endDate, setEndDate] = useState(todayKey);

  const { mutate: upsertPlan, isPending } = useUpsertReadingPlan();

  useEffect(() => {
    if (existingPlan) {
      setScope(existingPlan.scope);
      setStartDate(existingPlan.startDate);
      setEndDate(existingPlan.endDate);
    }
  }, [existingPlan]);

  const draftPlan = useMemo(() => ({
    scope,
    startDate,
    endDate,
  }), [scope, startDate, endDate]);

  const preview = useMemo(() => {
    try {
      return computeTodayAssignment({ plan: draftPlan, logs, todayKey });
    } catch (error) {
      return { perDay: 0, daysLeft: 0, remaining: 0, today: [] };
    }
  }, [draftPlan, logs, todayKey]);

  const planDetails = useMemo(() => {
    if (!existingPlan) return null;
    if (existingPlan.scope === 'NONE') {
      return {
        isNoPlan: true,
        scopeName: 'Manual Tracking'
      };
    }
    if (!existingPlan.startDate || !existingPlan.endDate) return null;

    // Today's assignment
    const assignedToday = getAssignmentForDate({ plan: existingPlan, dateKey: todayKey });
    const completedIds = new Set(logs.map(log => log.chapterId));
    const doneToday = assignedToday.filter(ch => completedIds.has(ch.chapterId)).length;
    const readTodayCount = logs.filter(log => log.dateKey === todayKey).length;

    const todaySummary = assignedToday.reduce((acc, ch) => {
      if (!acc[ch.book]) acc[ch.book] = [];
      acc[ch.book].push(ch.chapter);
      return acc;
    }, {});
    const todayParts = Object.entries(todaySummary).map(([book, chapters]) => {
      if (chapters.length === 1) return `${book} ${chapters[0]}`;
      const sorted = chapters.sort((a, b) => a - b);
      return `${book} ${sorted[0]}–${sorted[sorted.length - 1]}`;
    });

    // Tomorrow's assignment
    const nextKey = addDaysKey(todayKey, 1);
    const assignedTomorrow = getAssignmentForDate({ plan: existingPlan, dateKey: nextKey });
    const doneTomorrow = assignedTomorrow.filter(ch => completedIds.has(ch.chapterId)).length;

    const tomorrowSummary = assignedTomorrow.reduce((acc, ch) => {
      if (!acc[ch.book]) acc[ch.book] = [];
      acc[ch.book].push(ch.chapter);
      return acc;
    }, {});
    const tomorrowParts = Object.entries(tomorrowSummary).map(([book, chapters]) => {
      if (chapters.length === 1) return `${book} ${chapters[0]}`;
      const sorted = chapters.sort((a, b) => a - b);
      return `${book} ${sorted[0]}–${sorted[sorted.length - 1]}`;
    });

    // Plan stats
    const scopeChapters = buildScopeChapters(existingPlan.scope);
    const totalChapters = scopeChapters.length;
    const readChapterIds = new Set(logs.filter(log => 
      scopeChapters.some(ch => ch.chapterId === log.chapterId)
    ).map(log => log.chapterId));
    const remaining = totalChapters - readChapterIds.size;

    const today = new Date(todayKey);
    const endDate = new Date(existingPlan.endDate);
    const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

    return {
      todaySummary: todayParts.join(' • '),
      doneToday,
      totalToday: assignedToday.length,
      readTodayCount,
      tomorrowSummary: tomorrowParts.join(' • '),
      doneTomorrow,
      totalTomorrow: assignedTomorrow.length,
      nextKey,
      chaptersPerDay: existingPlan.chaptersPerDay || 0,
      daysLeft,
      remaining,
      scopeName: {
        BIBLE: 'Whole Bible',
        OT: 'Old Testament',
        NT: 'New Testament',
        PSALMS: 'Psalms',
        LEADERSHIP_INTENSIVE: 'Leadership Intensive',
        WISDOM_PLUNGE: 'Wisdom Plunge',
        INTENTIONAL_MOTHERHOOD: 'The Intentional Mom',
        GODLY_MAN: 'The Godly Man',
        LIVE_WITH_PURPOSE: 'Live With Purpose',
        KNOW_KING_DAVID: 'Know King David',
        HEART_OF_GOD: 'Heart of God'
      }[existingPlan.scope] || existingPlan.scope
    };
  }, [existingPlan, logs, todayKey]);

  const handlePresetClick = (preset) => {
    const dates = preset.getDates(todayKey);
    setScope(preset.scope);
    setStartDate(dates.startDate);
    setEndDate(dates.endDate);
  };

  const handleSave = () => {
    if (!userId) {
      toast.error('User not found');
      return;
    }

    // Handle "No Plan" mode
    if (scope === 'NONE') {
      upsertPlan(
        {
          existingPlan,
          planData: {
            userId,
            scope: 'NONE',
            startDate: null,
            endDate: null,
            chaptersPerDay: null,
          },
        },
        {
          onSuccess: () => {
            localStorage.setItem('bb_plan_prompt_seen', 'true');
            toast.success('Manual tracking mode enabled');
            onClose();
          },
          onError: (error) => {
            const msg = error?.message || error?.response?.data?.message || error?.data?.message || (typeof error === 'string' ? error : 'Failed to save plan');
            toast.error(msg);
          },
        }
      );
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    // Use preset chaptersPerDay if available, otherwise calculate
    const matchingPreset = PLAN_PRESETS.find(p => p.scope === scope);
    let chaptersPerDay;
    
    if (matchingPreset && matchingPreset.chaptersPerDay) {
      chaptersPerDay = matchingPreset.chaptersPerDay;
    } else {
      const scopeChapters = buildScopeChapters(scope);
      const totalChaptersInScope = scopeChapters.length;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDaysInPlan = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      chaptersPerDay = Math.ceil(totalChaptersInScope / totalDaysInPlan);
    }

    upsertPlan(
      {
        existingPlan,
        planData: {
          userId,
          scope,
          startDate,
          endDate,
          chaptersPerDay,
        },
      },
      {
        onSuccess: () => {
          localStorage.setItem('bb_plan_prompt_seen', 'true');
          toast.success('Reading plan saved');
          onClose();
        },
        onError: (error) => {
          const msg = error?.message || error?.response?.data?.message || error?.data?.message || (typeof error === 'string' ? error : 'Failed to save plan');
          toast.error(msg);
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Set Reading Plan</SheetTitle>
          <SheetDescription>
            Choose a preset or customize your own reading plan
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 pb-28">
          {/* Plan Details */}
          {planDetails && existingPlan && (
            <div className="bg-muted/50 rounded-lg p-4 border border-border space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Current Plan</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>{planDetails.scopeName}</div>
                  {!planDetails.isNoPlan && (
                    <>
                      <div>{formatDateRange(existingPlan.startDate, existingPlan.endDate)}</div>
                      <div>
                        {planDetails.chaptersPerDay}/day • {planDetails.daysLeft} days left
                        {planDetails.remaining > 0 && ` • ${planDetails.remaining} remaining`}
                      </div>
                    </>
                  )}
                  {planDetails.isNoPlan && (
                    <div>No plan selected</div>
                  )}
                </div>
              </div>

              {!planDetails.isNoPlan && (
                <div className="border-t border-border pt-3 space-y-3">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Today · {formatDateKey(todayKey)}
                    </div>
                    <div className="text-sm text-foreground">{planDetails.todaySummary}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {planDetails.doneToday}/{planDetails.totalToday} complete
                    </div>
                    <div className="text-xs text-muted-foreground/60 mt-0.5">
                      Read today: {planDetails.readTodayCount} chapter{planDetails.readTodayCount !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {planDetails.tomorrowSummary && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Next Up · {formatDateKey(planDetails.nextKey)}
                      </div>
                      <div className="text-sm text-foreground">{planDetails.tomorrowSummary}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {planDetails.doneTomorrow}/{planDetails.totalTomorrow} complete
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground/70 pt-2 border-t border-border">
                    Reading ahead counts toward future days.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Options */}
          <div>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  setScope('NONE');
                  setStartDate(todayKey);
                  setEndDate(todayKey);
                }}
                className="text-left p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
              >
                <div className="font-medium text-sm text-foreground">No Plan (Manual Tracking)</div>
                <div className="text-xs text-muted-foreground mt-0.5">Track your reading without a plan</div>
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate(createPageUrl('CustomPlanBuilder'));
                }}
                className="text-left p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
              >
                <div className="font-medium text-sm text-foreground">Custom Plan Builder</div>
                <div className="text-xs text-muted-foreground mt-0.5">Build your own reading plan</div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Plan'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}