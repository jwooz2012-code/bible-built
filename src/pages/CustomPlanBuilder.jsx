import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { getDateKey, addDaysKey, formatDateLong } from '@/components/bible/utils/dateUtils';
import { generatePlanSchedule } from '@/components/bible/plans/planGenerator';
import { BIBLE_BOOKS } from '@/components/bible/bibleData';
import { CURATED_PLANS } from '@/components/bible/plans/curatedPlans';
import { CHARACTER_LIBRARY, flattenCharacterSections } from '@/components/bible/plans/characterLibrary';
import BooksTab from '@/components/customPlan/BooksTab';
import ThemesTab from '@/components/customPlan/ThemesTab';
import PeopleTab from '@/components/customPlan/PeopleTab';
import CharacterDetailCard from '@/components/customPlan/CharacterDetailCard';
import ThemeDetailCard from '@/components/customPlan/ThemeDetailCard';

export default function CustomPlanBuilder() {
  const navigate = useNavigate();
  const todayKey = getDateKey();

  // Tab state
  const [activeTab, setActiveTab] = useState('themes');

  // Selection state
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [characterDetailOpen, setCharacterDetailOpen] = useState(false);
  const [selectedCharacterForDetail, setSelectedCharacterForDetail] = useState(null);
  const [themeDetailOpen, setThemeDetailOpen] = useState(false);
  const [selectedThemeForDetail, setSelectedThemeForDetail] = useState(null);

  // Timeframe state
  const [timeframeMode, setTimeframeMode] = useState('finishIn'); // 'finishIn' or 'dateRange'
  const [finishInDays, setFinishInDays] = useState(30);
  const [startDate, setStartDate] = useState(todayKey);
  const [startTomorrow, setStartTomorrow] = useState(false);
  const [endDate, setEndDate] = useState(addDaysKey(todayKey, 30));

  // Options state
  const [skipSundays, setSkipSundays] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [maxPerDay, setMaxPerDay] = useState(null);

  // Confirmation state
  const [showConfirm, setShowConfirm] = useState(false);
  const [planName, setPlanName] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Compute effective start date
  const effectiveStartDate = useMemo(() => {
    return startTomorrow ? addDaysKey(todayKey, 1) : startDate;
  }, [startDate, startTomorrow, todayKey]);

  // Build chapter list based on active tab
  const chapterList = useMemo(() => {
    if (activeTab === 'books') {
      if (selectedBooks.length === 0) return [];
      
      const chapters = [];
      BIBLE_BOOKS.forEach(book => {
        if (selectedBooks.includes(book.name)) {
          for (let ch = 1; ch <= book.chapters; ch++) {
            chapters.push({ bookName: book.name, chapter: ch });
          }
        }
      });
      return chapters;
    }

    if (activeTab === 'themes') {
      if (!selectedTheme) return [];
      return CURATED_PLANS[selectedTheme] || [];
    }

    if (activeTab === 'people') {
      if (!selectedPerson) return [];
      return flattenCharacterSections(selectedPerson);
    }

    return [];
  }, [activeTab, selectedBooks, selectedTheme, selectedPerson]);

  // Calculate live summary
  const liveSummary = useMemo(() => {
    if (chapterList.length === 0) {
      return { totalChapters: 0, readingDays: 0, autoPace: 0, projectedFinish: null };
    }

    try {
      const timeframe = timeframeMode === 'finishIn'
        ? { mode: 'finishIn', days: finishInDays }
        : { mode: 'dateRange', endDate };

      const result = generatePlanSchedule({
        chapterList,
        startDate: effectiveStartDate,
        timeframe,
        skipSundays,
        maxPerDay: showAdvanced ? maxPerDay : null,
      });

      return result.summary;
    } catch (error) {
      return { totalChapters: chapterList.length, readingDays: 0, autoPace: 0, projectedFinish: null };
    }
  }, [chapterList, effectiveStartDate, timeframeMode, finishInDays, endDate, skipSundays, showAdvanced, maxPerDay]);

  // Generate preview (first 7 days)
  const previewDays = useMemo(() => {
    if (chapterList.length === 0) return [];

    try {
      const timeframe = timeframeMode === 'finishIn'
        ? { mode: 'finishIn', days: finishInDays }
        : { mode: 'dateRange', endDate };

      const result = generatePlanSchedule({
        chapterList,
        startDate: effectiveStartDate,
        timeframe,
        skipSundays,
        maxPerDay: showAdvanced ? maxPerDay : null,
      });

      return result.planDays.slice(0, 7);
    } catch (error) {
      return [];
    }
  }, [chapterList, effectiveStartDate, timeframeMode, finishInDays, endDate, skipSundays, showAdvanced, maxPerDay]);

  const handleGeneratePlan = () => {
    if (chapterList.length === 0) {
      toast.error('Please select books, a theme, or a person');
      return;
    }

    try {
      const timeframe = timeframeMode === 'finishIn'
        ? { mode: 'finishIn', days: finishInDays }
        : { mode: 'dateRange', endDate };

      const result = generatePlanSchedule({
        chapterList,
        startDate: effectiveStartDate,
        timeframe,
        skipSundays,
        maxPerDay: showAdvanced ? maxPerDay : null,
      });

      setGeneratedPlan(result);

      // Auto-generate plan name
      let autoName = '';
      if (activeTab === 'books') {
        autoName = selectedBooks.length === 1
          ? selectedBooks[0]
          : `${selectedBooks.length} Books`;
      } else if (activeTab === 'themes') {
        const themeName = {
          LEADERSHIP_INTENSIVE: 'Leadership Intensive',
          WISDOM_PLUNGE: 'Wisdom Plunge',
          INTENTIONAL_MOTHERHOOD: 'The Intentional Mom',
          GODLY_MAN: 'The Godly Man',
          LIVE_WITH_PURPOSE: 'Live With Purpose',
          KNOW_KING_DAVID: 'Know King David',
          HEART_OF_GOD: 'Heart of God',
        }[selectedTheme];
        autoName = themeName || 'Theme Plan';
      } else if (activeTab === 'people') {
        autoName = selectedPerson;
      }
      setPlanName(autoName);

      setShowConfirm(true);
    } catch (error) {
      toast.error(error.message || 'Failed to generate plan');
    }
  };

  const handleConfirm = async () => {
    if (!planName.trim()) {
      toast.error('Please enter a plan name');
      return;
    }

    setIsSaving(true);

    try {
      const user = await base44.auth.me();

      // Create the reading plan
      const plan = await base44.entities.ReadingPlan.create({
        userId: user.id,
        scope: 'CUSTOM',
        startDate: effectiveStartDate,
        endDate: generatedPlan.summary.projectedFinish,
        chaptersPerDay: generatedPlan.summary.autoPace,
      });

      // Create PlanDay records
      const planDayRecords = generatedPlan.planDays.map(day => ({
        planId: plan.id,
        userId: user.id,
        date: day.date,
        assignments: day.assignments,
      }));

      await base44.entities.PlanDay.bulkCreate(planDayRecords);

      toast.success('Custom plan created!');
      
      // Refresh the page to load the new active plan
      window.location.href = createPageUrl('Home');
    } catch (error) {
      console.error('Failed to save plan:', error);
      toast.error('Failed to save plan');
    } finally {
      setIsSaving(false);
    }
  };

  if (showConfirm && generatedPlan) {
    return (
      <div className="min-h-screen bg-background p-6 pb-32">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setShowConfirm(false)} className="text-muted-foreground">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Confirm Plan</h1>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="planName">Plan Name</Label>
              <Input
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter plan name"
                className="mt-2"
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="text-sm text-muted-foreground">Total Chapters</div>
              <div className="text-2xl font-bold text-foreground">{generatedPlan.summary.totalChapters}</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Reading Days</div>
                <div className="text-lg font-bold text-foreground mt-1">{generatedPlan.summary.readingDays}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Per Day</div>
                <div className="text-lg font-bold text-foreground mt-1">{generatedPlan.summary.autoPace}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Finish</div>
                <div className="text-lg font-bold text-foreground mt-1">
                  {new Date(generatedPlan.summary.projectedFinish).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-foreground mb-2">Preview (First 7 Days)</div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {generatedPlan.planDays.slice(0, 7).map((day, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">{formatDateLong(day.date)}</div>
                    <div className="text-sm text-foreground">
                      {day.assignments.map((a, i) => (
                        <span key={i}>
                          {a.bookName} {a.chapter}
                          {i < day.assignments.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleConfirm} disabled={isSaving} className="w-full">
              {isSaving ? 'Creating Plan...' : 'Create Plan'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-32">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-muted-foreground">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Custom Plan Builder</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-4">
            <ThemesTab 
              selectedTheme={selectedTheme}
              onThemeClick={(themeKey) => {
                setSelectedThemeForDetail(themeKey);
                setThemeDetailOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="people" className="space-y-4">
            <PeopleTab 
              selectedPerson={selectedPerson}
              onPersonClick={(characterKey) => {
                setSelectedCharacterForDetail(characterKey);
                setCharacterDetailOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="books" className="space-y-4">
            <BooksTab selectedBooks={selectedBooks} onBooksChange={setSelectedBooks} />
          </TabsContent>
        </Tabs>

        {/* Character Detail Card */}
        <CharacterDetailCard
          open={characterDetailOpen}
          onClose={() => {
            setCharacterDetailOpen(false);
            setSelectedCharacterForDetail(null);
          }}
          characterKey={selectedCharacterForDetail}
          onConfirm={(characterKey) => {
            setSelectedPerson(characterKey);
          }}
          onStartPlan={async (characterKey) => {
            setIsSaving(true);
            try {
              const user = await base44.auth.me();
              const chapterList = flattenCharacterSections(characterKey);

              const recommendedDays = Math.ceil(chapterList.length / 2);
              const timeframe = { mode: 'finishIn', days: recommendedDays };

              const result = generatePlanSchedule({
                chapterList,
                startDate: effectiveStartDate,
                timeframe,
                skipSundays: false,
                maxPerDay: null,
              });

              const plan = await base44.entities.ReadingPlan.create({
                userId: user.id,
                scope: 'CUSTOM',
                startDate: effectiveStartDate,
                endDate: result.summary.projectedFinish,
                chaptersPerDay: result.summary.autoPace,
              });

              const planDayRecords = result.planDays.map(day => ({
                planId: plan.id,
                userId: user.id,
                date: day.date,
                assignments: day.assignments,
              }));

              await base44.entities.PlanDay.bulkCreate(planDayRecords);

              toast.success('Plan started!');
              window.location.href = createPageUrl('Home');
            } catch (error) {
              console.error('Failed to start plan:', error);
              toast.error('Failed to start plan');
            } finally {
              setIsSaving(false);
            }
          }}
        />

        {/* Theme Detail Card */}
        <ThemeDetailCard
          open={themeDetailOpen}
          onClose={() => {
            setThemeDetailOpen(false);
            setSelectedThemeForDetail(null);
          }}
          themeKey={selectedThemeForDetail}
          onConfirm={(themeKey) => {
            setSelectedTheme(themeKey);
          }}
          onStartPlan={async (themeKey) => {
            setIsSaving(true);
            try {
              const user = await base44.auth.me();
              const chapterList = CURATED_PLANS[themeKey] || [];

              const recommendedDays = Math.ceil(chapterList.length / 2);
              const timeframe = { mode: 'finishIn', days: recommendedDays };

              const result = generatePlanSchedule({
                chapterList,
                startDate: effectiveStartDate,
                timeframe,
                skipSundays: false,
                maxPerDay: null,
              });

              const plan = await base44.entities.ReadingPlan.create({
                userId: user.id,
                scope: 'CUSTOM',
                startDate: effectiveStartDate,
                endDate: result.summary.projectedFinish,
                chaptersPerDay: result.summary.autoPace,
              });

              const planDayRecords = result.planDays.map(day => ({
                planId: plan.id,
                userId: user.id,
                date: day.date,
                assignments: day.assignments,
              }));

              await base44.entities.PlanDay.bulkCreate(planDayRecords);

              toast.success('Plan started!');
              window.location.href = createPageUrl('Home');
            } catch (error) {
              console.error('Failed to start plan:', error);
              toast.error('Failed to start plan');
            } finally {
              setIsSaving(false);
            }
          }}
        />

        {/* Timeframe */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Timeframe</h3>

          <div className="flex items-center gap-2">
            <Switch
              checked={startTomorrow}
              onCheckedChange={setStartTomorrow}
            />
            <Label>Start tomorrow</Label>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={timeframeMode === 'finishIn' ? 'default' : 'outline'}
                onClick={() => setTimeframeMode('finishIn')}
                className="flex-1"
              >
                Number of Days
              </Button>
              <Button
                size="sm"
                variant={timeframeMode === 'dateRange' ? 'default' : 'outline'}
                onClick={() => setTimeframeMode('dateRange')}
                className="flex-1"
              >
                Date range
              </Button>
            </div>

            {timeframeMode === 'finishIn' && (
              <>
                <div className="flex flex-wrap gap-2">
                  {[7, 14, 30, 60, 90, 180, 365].map(days => (
                    <Button
                      key={days}
                      size="sm"
                      variant={finishInDays === days ? 'default' : 'outline'}
                      onClick={() => setFinishInDays(days)}
                    >
                      {days}d
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={finishInDays}
                  onChange={(e) => setFinishInDays(parseInt(e.target.value) || 30)}
                  placeholder="Custom days"
                />
              </>
            )}

            {timeframeMode === 'dateRange' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Options</h3>

          <div className="flex items-center gap-2">
            <Switch checked={skipSundays} onCheckedChange={setSkipSundays} />
            <Label>Skip Sundays</Label>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">
              Auto pace: ~{liveSummary.autoPace} chapters/day
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
              <Label>Advanced</Label>
            </div>

            {showAdvanced && (
              <div>
                <Label className="text-xs">Max chapters/day (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={maxPerDay || ''}
                  onChange={(e) => setMaxPerDay(e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="No limit"
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>

        {/* Live Summary */}
        <div className="mt-6 bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Plan Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Total Chapters</div>
              <div className="text-lg font-bold text-foreground">{liveSummary.totalChapters}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Reading Days</div>
              <div className="text-lg font-bold text-foreground">{liveSummary.readingDays}</div>
            </div>
          </div>
          {liveSummary.projectedFinish && (
            <div className="text-xs text-muted-foreground text-center">
              Finish: {formatDateLong(liveSummary.projectedFinish)}
            </div>
          )}
        </div>

        {/* Preview */}
        {previewDays.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Preview (First 7 Days)</h3>
            <div className="space-y-2">
              {previewDays.map((day, idx) => (
                <div key={idx} className="bg-card border border-border rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">
                    Day {idx + 1} • {formatDateLong(day.date)}
                  </div>
                  <div className="text-sm text-foreground">
                    {day.assignments.map((a, i) => (
                      <span key={i}>
                        {a.bookName} {a.chapter}
                        {i < day.assignments.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selection Warning */}
        {chapterList.length === 0 && (
          <div className="mt-6 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground text-center">
            Select a plan to continue
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGeneratePlan}
          disabled={chapterList.length === 0}
          className="w-full mt-6"
        >
          Generate Plan
        </Button>
      </div>
    </div>
  );
}