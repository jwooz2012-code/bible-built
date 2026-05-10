import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, CalendarPlus, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateKey } from '@/components/bible/utils/dateUtils';

function formatChapterRange(chapters) {
  const sorted = [...chapters].sort((a, b) => a - b);
  const parts = [];
  let start = sorted[0];
  let end = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      parts.push(start === end ? `${start}` : `${start}\u2013${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  parts.push(start === end ? `${start}` : `${start}\u2013${end}`);
  return parts.join(', ');
}

/**
 * Banner shown when a user has an unread assigned day in the past 7 days.
 * Gives three recovery paths: catch up, extend the plan, or skip the day.
 */
export default function MissedDayBanner({ missedDay, onCatchUp, onSkip, onAddDay, isSaving }) {
  if (!missedDay) return null;

  const { dateKey, assignment } = missedDay;

  // Build a compact reading summary  (e.g. "Gen 3-5 • Matt 1")
  const grouped = assignment.reduce((acc, ch) => {
    if (!acc[ch.book]) acc[ch.book] = [];
    acc[ch.book].push(ch.chapter);
    return acc;
  }, {});

  const parts = Object.entries(grouped).map(([book, chapters]) => (
    `${book} ${formatChapterRange(chapters)}`
  ));
  const summary = parts.join(' \u2022 ');

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mb-4 rounded-2xl overflow-hidden"
      style={{
        background: 'color-mix(in srgb, hsl(38 92% 50%) 7%, hsl(var(--card)) 93%)',
        border: '1px solid color-mix(in srgb, hsl(38 92% 50%) 28%, hsl(var(--border)) 72%)',
        borderLeft: '3px solid hsl(38 92% 50% / 0.65)',
      }}
    >
      <div className="px-5 pt-4 pb-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-0.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(38 92% 45%)' }} />
          <p className="text-sm font-semibold text-foreground">
            Missed Day — {formatDateKey(dateKey)}
          </p>
        </div>

        {/* Reading summary */}
        <p className="text-sm text-muted-foreground mb-4 pl-6 leading-relaxed">
          {summary}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {/* Primary: catch up */}
          <Button
            size="sm"
            onClick={onCatchUp}
            disabled={isSaving}
            className="w-full h-9 text-sm font-semibold"
            style={{ background: 'hsl(38 92% 48%)', color: '#fff', boxShadow: '0 2px 8px hsl(38 92% 48% / 0.3)' }}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2" />
            {isSaving ? 'Saving\u2026' : 'Catch Up Today'}
          </Button>

          {/* Secondary row */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onAddDay}
              disabled={isSaving}
              className="flex-1 h-9 text-xs font-medium"
            >
              <CalendarPlus className="w-3.5 h-3.5 mr-1.5" />
              Add a Day
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onSkip}
              disabled={isSaving}
              className="flex-1 h-9 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="w-3.5 h-3.5 mr-1.5" />
              Skip It
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
