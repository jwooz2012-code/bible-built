import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, Compass, Crown, Heart, Lamp, Leaf, Hourglass, Scroll, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const [showUpcoming, setShowUpcoming] = useState(false);

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

  const upcomingReadings = useMemo(() => {
    if (!existingPlan || existingPlan.scope === 'NONE') return [];
    if (!existingPlan.startDate || !existingPlan.endDate) return [];

    const completedIds = new Set(logs.map(log => log.chapterId));
    const upcoming = [];

    for (let i = 0; i < 7; i++) {
      const dateKey = addDaysKey(todayKey, i);
      const assigned = getAssignmentForDate({ plan: existingPlan, dateKey });
      
      if (assigned.length === 0) continue;

      const completed = assigned.filter(ch => completedIds.has(ch.chapterId)).length;
      const summary = assigned.reduce((acc, ch) => {
        if (!acc[ch.book]) acc[ch.book] = [];
        acc[ch.book].push(ch.chapter);
        return acc;
      }, {});
      
      const parts = Object.entries(summary).map(([book, chapters]) => {
        if (chapters.length === 1) return `${book} ${chapters[0]}`;
        const sorted = chapters.sort((a, b) => a - b);
        return `${book} ${sorted[0]}–${sorted[sorted.length - 1]}`;
      });

      upcoming.push({
        dateKey,
        isToday: i === 0,
        summary: parts.join(' • '),
        completed,
        total: assigned.length
      });
    }

    return upcoming;
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
            <div className="bg-gradient-to-br from-card to-accent/5 border-2 border-border rounded-2xl p-5 shadow-sm space-y-4">
              {/* Plan Identity */}
              <div>
                <h3 className="text-xl font-bold text-foreground">{planDetails.scopeName}</h3>
                {!planDetails.isNoPlan && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {planDetails.chaptersPerDay} chapters/day
                  </div>
                )}
              </div>

              {!planDetails.isNoPlan && (
                <>
                  {/* Today's Reading */}
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-foreground">
                        Today's Reading
                      </div>
                      {planDetails.doneToday === planDetails.totalToday && planDetails.totalToday > 0 && (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <Check className="w-3 h-3" />
                          <span>Completed</span>
                        </div>
                      )}
                    </div>
                    {planDetails.todaySummary ? (
                      <>
                        <div className="text-base text-foreground font-medium mb-1">
                          {planDetails.todaySummary}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {planDetails.doneToday}/{planDetails.totalToday} chapters read
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">No assignment today</div>
                    )}
                  </div>

                  {/* Up Next */}
                  {planDetails.tomorrowSummary && (
                    <div className="border-t border-border pt-4">
                      <div className="text-sm font-semibold text-foreground mb-2">
                        Up Next
                      </div>
                      <div className="text-base text-foreground/80 mb-1">
                        {planDetails.tomorrowSummary}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateKey(planDetails.nextKey)}
                        {planDetails.doneTomorrow > 0 && ` • ${planDetails.doneTomorrow}/${planDetails.totalTomorrow} already read`}
                      </div>
                    </div>
                  )}

                  {/* Progress Info */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {planDetails.daysLeft > 0 ? (
                        <>
                          {planDetails.daysLeft} day{planDetails.daysLeft !== 1 ? 's' : ''} remaining
                          {planDetails.remaining > 0 && ` • ${planDetails.remaining} chapters left`}
                        </>
                      ) : (
                        <>Plan complete • {formatDateKey(existingPlan.endDate)}</>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground/70">
                      You can read ahead at any time — it will count toward upcoming days.
                    </div>
                  </div>

                  {/* View Upcoming Button */}
                  <div className="border-t border-border pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowUpcoming(true)}
                      className="w-full"
                    >
                      View Upcoming Readings
                    </Button>
                  </div>
                </>
              )}

              {planDetails.isNoPlan && (
                <div className="text-sm text-muted-foreground">
                  No active plan — tracking chapters manually
                </div>
              )}
            </div>
          )}

          {/* Upcoming Readings Modal */}
          {showUpcoming && (
            <Sheet open={showUpcoming} onOpenChange={setShowUpcoming}>
              <SheetContent side="bottom" className="h-[70vh]">
                <SheetHeader>
                  <SheetTitle>Upcoming Readings</SheetTitle>
                  <SheetDescription>
                    Next 7 days in your current plan
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-3 pb-8 overflow-y-auto max-h-[calc(70vh-120px)]">
                  {upcomingReadings.map((day, idx) => (
                    <div 
                      key={day.dateKey}
                      className={cn(
                        "p-4 rounded-lg border",
                        day.isToday 
                          ? "border-primary bg-primary/5" 
                          : "border-border bg-card"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-foreground">
                          {day.isToday ? 'Today' : formatDateKey(day.dateKey)}
                        </div>
                        {day.completed === day.total && day.total > 0 && (
                          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <Check className="w-3 h-3" />
                            <span>Done</span>
                          </div>
                        )}
                      </div>
                      <div className="text-base text-foreground mb-1">
                        {day.summary}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {day.completed}/{day.total} chapters read
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUpcoming(false)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
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
                className={cn(
                  "text-left p-3 rounded-lg border-2 transition-all relative",
                  scope === 'NONE'
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:bg-accent"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">No Plan (Manual Tracking)</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Track your reading without a plan</div>
                  </div>
                  {scope === 'NONE' && (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                    </div>
                  )}
                </div>
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