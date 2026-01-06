import React, { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { computeTodayAssignment, buildScopeChapters } from '@/components/bible/plans/planUtils';
import { PLAN_PRESETS } from '@/components/bible/plans/planPresets';
import { useUpsertReadingPlan } from '@/components/bible/hooks/useReadingPlan';

export default function PlanModal({ open, onClose, userId, existingPlan, logs }) {
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

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    // Calculate chaptersPerDay
    const scopeChapters = buildScopeChapters(scope);
    const totalChaptersInScope = scopeChapters.length;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDaysInPlan = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const chaptersPerDay = Math.ceil(totalChaptersInScope / totalDaysInPlan);

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
          toast.error(error?.message || 'Failed to save plan');
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

        <div className="mt-6 space-y-6">
          {/* Suggested Plans */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Suggested Plans</h3>
            <div className="grid grid-cols-1 gap-2">
              {PLAN_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset)}
                  className="text-left p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                >
                  <div className="font-medium text-sm text-foreground">{preset.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Plan */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Customize Plan</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="scope" className="text-xs">Scope</Label>
                <Select value={scope} onValueChange={setScope}>
                  <SelectTrigger id="scope" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BIBLE">Whole Bible</SelectItem>
                    <SelectItem value="OT">Old Testament</SelectItem>
                    <SelectItem value="NT">New Testament</SelectItem>
                    <SelectItem value="PSALMS">Psalms</SelectItem>
                    <SelectItem value="LEADERSHIP_30">Leadership (30 chapters)</SelectItem>
                    <SelectItem value="WISDOM_7">Wisdom (7 chapters)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="text-xs">End Date</Label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                />
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Preview</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">{preview.perDay}</div>
                <div className="text-xs text-muted-foreground">per day</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{preview.daysLeft}</div>
                <div className="text-xs text-muted-foreground">days left</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{preview.remaining}</div>
                <div className="text-xs text-muted-foreground">remaining</div>
              </div>
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