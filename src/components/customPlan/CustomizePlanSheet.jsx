import React, { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDateKey, addDaysKey, formatDateLong } from '@/components/bible/utils/dateUtils';
import { generatePlanSchedule } from '@/components/bible/plans/planGenerator';

export default function CustomizePlanSheet({ 
  open, 
  onClose, 
  planName,
  chapterList, 
  onConfirm 
}) {
  const todayKey = getDateKey();
  const tomorrowKey = addDaysKey(todayKey, 1);

  // Duration state
  const [durationType, setDurationType] = useState('preset');
  const [selectedPreset, setSelectedPreset] = useState(30);
  const [customDays, setCustomDays] = useState('');

  // Advanced options (collapsed)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startOption, setStartOption] = useState('today');
  const [customStartDate, setCustomStartDate] = useState(todayKey);
  const [skipSundays, setSkipSundays] = useState(false);
  const [dailyCapMode, setDailyCapMode] = useState('auto');
  const [customCap, setCustomCap] = useState('');

  const effectiveDays = useMemo(() => {
    if (durationType === 'preset') return selectedPreset;
    const parsed = parseInt(customDays);
    return isNaN(parsed) || parsed < 1 ? 30 : parsed;
  }, [durationType, selectedPreset, customDays]);

  const effectiveStartDate = useMemo(() => {
    if (startOption === 'today') return todayKey;
    if (startOption === 'tomorrow') return tomorrowKey;
    return customStartDate;
  }, [startOption, customStartDate, todayKey, tomorrowKey]);

  const summary = useMemo(() => {
    if (!chapterList || chapterList.length === 0) {
      return { totalChapters: 0, readingDays: 0, autoPace: 0, projectedFinish: null };
    }

    try {
      const result = generatePlanSchedule({
        chapterList,
        startDate: effectiveStartDate,
        timeframe: { mode: 'finishIn', days: effectiveDays },
        skipSundays,
        maxPerDay: dailyCapMode === 'custom' && customCap ? parseInt(customCap) : null,
      });

      return result.summary;
    } catch (error) {
      return { totalChapters: chapterList.length, readingDays: 0, autoPace: 0, projectedFinish: null };
    }
  }, [chapterList, effectiveStartDate, effectiveDays, skipSundays, dailyCapMode, customCap]);

  const handleStartPlan = () => {
    try {
      const result = generatePlanSchedule({
        chapterList,
        startDate: effectiveStartDate,
        timeframe: { mode: 'finishIn', days: effectiveDays },
        skipSundays,
        maxPerDay: dailyCapMode === 'custom' && customCap ? parseInt(customCap) : null,
      });

      onConfirm({
        planName,
        startDate: effectiveStartDate,
        endDate: result.summary.projectedFinish,
        chaptersPerDay: result.summary.autoPace,
        planDays: result.planDays,
      });
    } catch (error) {
      console.error('Failed to generate plan:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{planName}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 pb-32">
          {/* Duration Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              How long do you want to read?
            </Label>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[14, 30, 60].map(days => (
                <button
                  key={days}
                  onClick={() => {
                    setDurationType('preset');
                    setSelectedPreset(days);
                  }}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                    durationType === 'preset' && selectedPreset === days
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {days} days
                  {days === 30 && (
                    <div className="text-xs text-primary mt-0.5">Recommended</div>
                  )}
                </button>
              ))}
              <button
                onClick={() => setDurationType('custom')}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                  durationType === 'custom'
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                )}
              >
                Custom…
              </button>
            </div>

            {durationType === 'custom' && (
              <div>
                <Label htmlFor="customDays" className="text-xs text-muted-foreground">
                  Number of days
                </Label>
                <Input
                  id="customDays"
                  type="number"
                  min="1"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="30"
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Summary Card */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="text-sm text-muted-foreground">
              You'll read about: <span className="font-semibold text-foreground">{summary.autoPace} chapters/day</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Finish date: <span className="font-semibold text-foreground">
                {summary.projectedFinish ? formatDateLong(summary.projectedFinish) : '—'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Reading days: <span className="font-semibold text-foreground">{summary.readingDays}</span>
            </div>
          </div>

          {/* Primary Action */}
          <Button onClick={handleStartPlan} className="w-full" size="lg">
            <Check className="w-5 h-5 mr-2" />
            Start Plan
          </Button>

          {/* Advanced Options (Collapsed) */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full p-3 rounded-lg border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              <span>Adjust plan (optional)</span>
              <ChevronDown 
                className={cn(
                  "w-4 h-4 transition-transform",
                  showAdvanced && "rotate-180"
                )} 
              />
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-5 p-4 rounded-lg border border-border bg-card/50">
                {/* Start Date */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Start date</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'today', label: 'Today' },
                      { value: 'tomorrow', label: 'Tomorrow' },
                      { value: 'pick', label: 'Pick date' },
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setStartOption(option.value)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-lg border transition-all text-sm",
                          startOption === option.value
                            ? "border-primary bg-primary/5 font-medium text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                    {startOption === 'pick' && (
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>

                {/* Skip Sundays */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="skip-sundays" className="text-sm font-medium">
                    Skip Sundays
                  </Label>
                  <Switch
                    id="skip-sundays"
                    checked={skipSundays}
                    onCheckedChange={setSkipSundays}
                  />
                </div>

                {/* Daily Cap */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    Limit chapters per day
                  </Label>
                  <div className="space-y-2">
                    {[
                      { value: 'auto', label: 'Auto (Recommended)' },
                      { value: 'custom', label: 'Custom limit' },
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setDailyCapMode(option.value)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-lg border transition-all text-sm",
                          dailyCapMode === option.value
                            ? "border-primary bg-primary/5 font-medium text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                    {dailyCapMode === 'custom' && (
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={customCap}
                        onChange={(e) => setCustomCap(e.target.value)}
                        placeholder="e.g., 5"
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}