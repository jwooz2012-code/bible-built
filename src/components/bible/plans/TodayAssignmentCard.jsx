import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, BookOpen, ChevronRight, ChevronLeft, Pencil } from 'lucide-react';
import { triggerHaptic } from '@/components/utils/haptics';
import { buildScopeChapters } from '@/components/bible/plans/planUtils';
import { useCompleteTodaysAssignment } from '@/components/bible/hooks/useCompleteTodaysAssignment';
import { usePlanDays } from '@/components/bible/hooks/usePlanDays';
import { useMarkTodayComplete } from '@/components/bible/hooks/useMarkTodayComplete';
import { formatDateKey } from '@/components/bible/utils/dateUtils';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';

function formatChapterList(chapters) {
  const sorted = [...chapters].sort((a, b) => a - b);
  const parts = [];
  let start = sorted[0];
  let end = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      parts.push(start === end ? `${start}` : `${start}–${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  parts.push(start === end ? `${start}` : `${start}–${end}`);
  return parts.join(', ');
}

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
  const { completeToday, isCompleting } = useCompleteTodaysAssignment();
  const { markTodayComplete, isPending: isMarkingToday } = useMarkTodayComplete();
  const [viewOffset, setViewOffset] = useState(0);

  const isCustomPlan = plan?.scope === 'CUSTOM';

  // For CUSTOM plans: fetch all plan days sorted by date
  const { data: rawCustomDays = [] } = usePlanDays({
    planId: plan?.id,
    enabled: isCustomPlan && hasPlan,
  });

  // Build navigation chunks — same shape for both plan types:
  // [ [{ book, chapter, chapterId, bookIndex?, testament? }, ...], ... ]
  const navigationChunks = useMemo(() => {
    if (!hasPlan) return [];

    if (isCustomPlan) {
      // Sort plan days by date, then map each to its chapter array
      const sorted = [...rawCustomDays].sort((a, b) => (a.date < b.date ? -1 : 1));
      return sorted.map(day =>
        (day.assignments || []).map(a => {
          const book = BIBLE_BOOKS.find(b => b.name === a.bookName);
          if (!book) return null;
          return {
            book: book.name,
            bookIndex: book.index,
            chapter: a.chapter,
            chapterId: generateChapterId(book.index, a.chapter),
            testament: book.testament,
          };
        }).filter(Boolean)
      );
    }

    // Non-CUSTOM: chunk scope chapters by chaptersPerDay
    if (!plan?.chaptersPerDay) return [];
    const scope = buildScopeChapters(plan.scope);
    const perDay = Number(plan.chaptersPerDay);
    if (!perDay || !scope.length) return [];
    const chunks = [];
    for (let i = 0; i < scope.length; i += perDay) {
      chunks.push(scope.slice(i, i + perDay));
    }
    return chunks;
  }, [hasPlan, isCustomPlan, rawCustomDays, plan]);

  // Index of the first plan day that is not fully read since plan start
  const firstIncompleteIdx = useMemo(() => {
    if (!navigationChunks.length || !plan?.startDate) return 0;
    const readIds = new Set(
      allTimeLogs.filter(l => l.dateKey >= plan.startDate).map(l => l.chapterId)
    );
    for (let i = 0; i < navigationChunks.length; i++) {
      if (!navigationChunks[i].every(ch => readIds.has(ch.chapterId))) return i;
    }
    return navigationChunks.length; // all done
  }, [navigationChunks, allTimeLogs, plan?.startDate]);

  // Auto-reset view when progress advances (firstIncompleteIdx changes)
  useEffect(() => {
    setViewOffset(0);
  }, [firstIncompleteIdx]);

  // Unified navigation state
  const totalDays = navigationChunks.length;
  const viewedDayIdx = firstIncompleteIdx + viewOffset;
  const assignedToday = navigationChunks[viewedDayIdx] || [];
  const isViewingAhead = viewOffset > 0;
  const canGoBack = viewOffset > 0;
  const canGoForward = viewedDayIdx < totalDays - 1;
  const isPlanComplete = firstIncompleteIdx >= totalDays && totalDays > 0;
  const viewedDayNumber = viewedDayIdx + 1;

  // Completion state for whatever day is being viewed
  const { summary, parts, isComplete } = useMemo(() => {
    if (!assignedToday.length) {
      return { summary: '', parts: [], isComplete: isPlanComplete };
    }
    const planStart = plan?.startDate || '';
    const completedIds = new Set(
      allTimeLogs.filter(log => log.dateKey >= planStart).map(log => log.chapterId)
    );
    const done = assignedToday.filter(ch => completedIds.has(ch.chapterId)).length;
    const grouped = assignedToday.reduce((acc, ch) => {
      if (!acc[ch.book]) acc[ch.book] = [];
      acc[ch.book].push(ch.chapter);
      return acc;
    }, {});
    const parts = Object.entries(grouped).map(([book, chapters]) =>
      `${book} ${formatChapterList(chapters)}`
    );
    return {
      summary: parts.join(' • '),
      parts,
      isComplete: done === assignedToday.length,
    };
  }, [assignedToday, allTimeLogs, plan?.startDate, isPlanComplete]);

  const handleComplete = () => {
    triggerHaptic();
    const onSettled = () => setViewOffset(0);
    if (isCustomPlan && assignedToday.length > 0) {
      markTodayComplete({
        userId,
        allTimeLogs,
        todayAssignments: assignedToday.map(a => ({ bookName: a.book, chapter: a.chapter })),
      }, { onSettled });
    } else {
      completeToday({
        userId,
        plan,
        allTimeLogs,
        todayKey,
        assignedChapters: assignedToday,
      }, { onSettled });
    }
  };

  // ---- Render ----

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
            boxShadow: '0 2px 10px rgba(0,0,0,0.07)'
          }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'color-mix(in srgb, rgb(34,197,94) 15%, hsl(var(--card)) 85%)',
              boxShadow: '0 0 10px rgba(34,197,94,0.18)'
            }}>
            <BookOpen className="w-4 h-4" style={{ color: 'rgb(34,197,94)' }} />
          </div>
          <span className="flex-1 text-base font-semibold text-foreground/90">Explore Reading Plans</span>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgb(34,197,94)', opacity: 0.7 }} />
        </motion.button>
      </motion.div>
    );
  }

  const successBg = 'hsl(142 70% 35%)';
  const successFg = 'hsl(0 0% 100%)';
  const aheadColor = 'hsl(217 91% 55%)';
  const isBusy = isCompleting || isMarkingToday;

  const cardStyle = isPlanComplete ? {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderLeft: `3px solid color-mix(in srgb, ${successBg} 55%, transparent)`,
  } : isViewingAhead ? {
    background: 'color-mix(in srgb, hsl(var(--card)) 60%, hsl(var(--background)) 40%)',
    border: `1px solid color-mix(in srgb, ${aheadColor} 22%, hsl(var(--border)) 78%)`,
    borderLeft: `3px solid color-mix(in srgb, ${aheadColor} 55%, transparent)`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  } : isComplete ? {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderLeft: `3px solid color-mix(in srgb, ${successBg} 55%, transparent)`,
    boxShadow: '0 0 0 1px hsl(var(--border)) inset',
  } : {
    background: 'color-mix(in srgb, hsl(var(--card)) 60%, hsl(var(--background)) 40%)',
    border: '1px solid color-mix(in srgb, hsl(25 95% 53%) 22%, hsl(var(--border)) 78%)',
    borderLeft: '3px solid hsl(25 95% 53% / 0.55)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
  };

  const labelColor = isPlanComplete || isComplete
    ? successBg
    : isViewingAhead
    ? aheadColor
    : 'hsl(25 95% 53%)';

  const labelText = isPlanComplete
    ? 'Plan Complete'
    : isViewingAhead
    ? `Read Ahead · Day ${viewedDayNumber}${totalDays ? ` of ${totalDays}` : ''}`
    : `Today's Reading`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mb-6 px-5 py-5 cursor-pointer rounded-[18px]"
      onClick={onOpenPlanPreview}
      style={cardStyle}>

      {/* Header row: date + nav arrows + edit */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">
          {isViewingAhead ? '' : formatDateKey(todayKey)}
        </p>
        <div className="flex items-center gap-0.5 -mr-1">
          <motion.button
            onClick={(e) => { e.stopPropagation(); triggerHaptic(); setViewOffset(v => v - 1); }}
            whileTap={{ scale: 0.8 }}
            disabled={!canGoBack}
            className="p-1.5 rounded-md transition-colors"
            style={{ opacity: canGoBack ? 1 : 0, pointerEvents: canGoBack ? 'auto' : 'none' }}>
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </motion.button>
          <motion.button
            onClick={(e) => { e.stopPropagation(); triggerHaptic(); setViewOffset(v => v + 1); }}
            whileTap={{ scale: 0.8 }}
            disabled={!canGoForward}
            className="p-1.5 rounded-md transition-colors"
            style={{ opacity: canGoForward ? 1 : 0.25, pointerEvents: canGoForward ? 'auto' : 'none' }}>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
          <motion.button
            onClick={(e) => { e.stopPropagation(); triggerHaptic(); onOpenPlanModal(); }}
            whileTap={{ scale: 0.85, opacity: 0.6 }}
            className="p-1.5 rounded-md text-muted-foreground/60 hover:text-muted-foreground transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Plan complete state */}
      {isPlanComplete && (
        <div className="text-center py-2">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: successBg }} />
          <p className="text-base font-semibold text-foreground">{plan.name || 'Reading Plan'} Complete!</p>
          <p className="text-sm text-muted-foreground mt-1">You finished every day. Well done.</p>
        </div>
      )}

      {/* Reading content */}
      {!isPlanComplete && summary && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen className="w-3 h-3 flex-shrink-0" style={{ color: labelColor }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: labelColor }}>
              {labelText}
            </span>
          </div>
          <div className="mb-2 flex flex-col gap-0.5">
            {(parts.length > 0 ? parts : [summary]).map((line, i) => (
              <span key={i} className="text-[22px] font-semibold text-foreground leading-snug tracking-tight block">
                {line}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {plan.name || 'My Reading Plan'}
          </p>
        </div>
      )}

      {/* Action button + read-ahead nudge */}
      {!isPlanComplete && summary && (
        <div className="space-y-2">
          <motion.div whileTap={!isComplete ? { scale: 0.97 } : {}}>
            <Button
              onClick={(e) => { e.stopPropagation(); handleComplete(); }}
              disabled={isComplete || isBusy}
              className="w-full transition-all duration-200"
              style={isComplete ? {
                background: successBg,
                color: successFg,
                opacity: 1,
                cursor: 'default',
              } : isViewingAhead ? {
                background: aheadColor,
                color: '#fff',
                boxShadow: `0 2px 8px color-mix(in srgb, ${aheadColor} 35%, transparent)`,
              } : {
                background: 'hsl(25 95% 53%)',
                color: '#fff',
                boxShadow: '0 2px 8px hsl(25 95% 53% / 0.35)',
              }}>
              {isBusy ? 'Saving…' : isComplete ? (
                <><CheckCircle2 className="w-4 h-4 mr-2" />{isViewingAhead ? 'Completed' : 'Completed Today'}</>
              ) : isViewingAhead ? (
                `Mark Day ${viewedDayNumber} Complete`
              ) : (
                'Mark Today Complete'
              )}
            </Button>
          </motion.div>

          {/* Nudge to read ahead when today is done */}
          {!isViewingAhead && isComplete && canGoForward && (
            <motion.button
              onClick={(e) => { e.stopPropagation(); triggerHaptic(); setViewOffset(1); }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: aheadColor, background: `color-mix(in srgb, ${aheadColor} 8%, transparent)` }}>
              Read Tomorrow&apos;s Chapters
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      )}

    </motion.div>
  );
}
