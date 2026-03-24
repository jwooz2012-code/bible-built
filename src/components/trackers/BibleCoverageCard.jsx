import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GREEN = 'rgb(34,197,94)';
const GREEN_DIM = 'rgba(34,197,94,0.5)';
const GREEN_TRACK = 'rgba(34,197,94,0.1)';
const TRACK = 'hsl(var(--secondary))';

function ProgressRow({ label, value, total, percent, accent, delay = 0 }) {
  const displayPercent = percent === 0 ? '—' : `${Math.round(percent)}%`;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          {total != null && (
            <span className="text-[12px] text-muted-foreground/60">{value}/{total}</span>
          )}
          <span
            className="text-[13px] font-bold tabular-nums"
            style={{ color: accent ? GREEN : 'hsl(var(--muted-foreground))' }}
          >
            {displayPercent}
          </span>
        </div>
      </div>
      <div className="relative w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: accent ? GREEN_TRACK : TRACK }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(percent)}%` }}
          transition={{ duration: 0.7, ease: 'easeOut', delay }}
          className="h-full rounded-full"
          style={{ background: accent ? `linear-gradient(90deg, ${GREEN} 0%, rgb(74,222,128) 100%)` : GREEN_DIM }}
        />
      </div>
    </div>
  );
}

export default function BibleCoverageCard({ sectionData, bookProgressYear, bookProgressLifetime }) {
  const [showSections, setShowSections] = useState(false);
  const [showBooks, setShowBooks] = useState(false);
  const [bookMode, setBookMode] = useState('year');

  // OT / NT from section data
  const otSection = sectionData.find(s => s.section === 'Old Testament' || s.section?.startsWith('Old'));
  const ntSection = sectionData.find(s => s.section === 'New Testament' || s.section?.startsWith('New'));

  const sorted = [...sectionData].sort((a, b) => b.percent - a.percent);
  const otPercent = otSection?.percent ?? 0;
  const ntPercent = ntSection?.percent ?? 0;

  const bookData = bookMode === 'year' ? bookProgressYear : bookProgressLifetime;
  const booksWithProgress = bookData.filter(b => b.completedDistinct > 0).sort((a, b) => b.percent - a.percent);
  const topBooks = showBooks ? booksWithProgress : booksWithProgress.slice(0, 5);

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border)/0.7)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
      }}
    >
      <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)' }} />

      {/* OT / NT Overview */}
      <div className="space-y-4 mb-5">
        <ProgressRow
          label="Old Testament"
          percent={otPercent}
          accent
          delay={0.1}
        />
        <ProgressRow
          label="New Testament"
          percent={ntPercent}
          accent
          delay={0.2}
        />
      </div>

      {/* Section Breakdown Toggle */}
      <button
        onClick={() => setShowSections(!showSections)}
        className="w-full mb-5 pt-4 border-t border-border/50 flex items-center justify-between text-[12px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="font-medium tracking-wide uppercase">{showSections ? 'Hide Sections' : 'View by Section'}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSections ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showSections && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden space-y-3.5 mb-5"
          >
            {sorted.map((s, idx) => (
              <ProgressRow
                key={idx}
                label={s.section.split('/')[0]}
                percent={s.percent}
                delay={idx * 0.04}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book Progress */}
      <div className="pt-4 border-t border-border/50">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest">Book Progress</p>
          <div className="flex items-center gap-1 rounded-lg overflow-hidden" style={{ border: '1px solid hsl(var(--border))' }}>
            {['year', 'lifetime'].map(m => (
              <button
                key={m}
                onClick={() => setBookMode(m)}
                className="px-3 py-1 text-[11px] font-semibold transition-colors"
                style={{
                  background: bookMode === m ? GREEN : 'transparent',
                  color: bookMode === m ? '#fff' : 'hsl(var(--muted-foreground))'
                }}
              >
                {m === 'year' ? 'This Year' : 'Lifetime'}
              </button>
            ))}
          </div>
        </div>

        {booksWithProgress.length === 0 ? (
          <p className="text-[13px] text-muted-foreground/60 text-center py-4">No books started yet</p>
        ) : (
          <div className="space-y-3.5">
            {topBooks.map((book, idx) => (
              <ProgressRow
                key={book.bookIndex}
                label={book.bookName}
                value={book.completedDistinct}
                total={book.totalChapters}
                percent={book.percent}
                delay={idx * 0.03}
              />
            ))}
          </div>
        )}

        {booksWithProgress.length > 5 && (
          <button
            onClick={() => setShowBooks(!showBooks)}
            className="w-full mt-4 pt-3 border-t border-border/50 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{showBooks ? 'Show less' : `View all ${booksWithProgress.length} books`}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showBooks ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}