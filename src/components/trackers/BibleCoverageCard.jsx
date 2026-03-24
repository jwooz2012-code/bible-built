import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOTAL_BIBLE_CHAPTERS = 1189;
const GREEN = 'rgb(34,197,94)';
const GREEN_TRACK = 'rgba(34,197,94,0.12)';

function ThinProgressRow({ label, percent, delay = 0 }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground font-medium">{label}</span>
        <span className="text-[12px] font-semibold tabular-nums" style={{ color: GREEN }}>
          {percent === 0 ? '—' : `${Math.round(percent)}%`}
        </span>
      </div>
      <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: GREEN_TRACK }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(percent)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut', delay }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${GREEN}, rgb(74,222,128))` }}
        />
      </div>
    </div>
  );
}

export default function BibleCoverageCard({ sectionData, bookProgressYear, bookProgressLifetime }) {
  const [showBooks, setShowBooks] = useState(false);
  const [bookMode, setBookMode] = useState('year');

  const bookData = bookMode === 'year' ? bookProgressYear : bookProgressLifetime;

  // Hero: compute total from lifetime
  const totalRead = bookProgressLifetime.reduce((sum, b) => sum + b.completedDistinct, 0);
  const overallPercent = Math.round((totalRead / TOTAL_BIBLE_CHAPTERS) * 100);

  // OT / NT
  const otSection = sectionData.find(s => s.section?.includes('Old'));
  const ntSection = sectionData.find(s => s.section?.includes('New'));

  // Current book in progress (0 < percent < 100), highest progress first
  const currentBooks = bookData
    .filter(b => b.completedDistinct > 0 && b.percent < 100)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 1);

  // Recent completions (100%), show top 2
  const recentCompletions = bookData
    .filter(b => b.percent >= 100)
    .slice(0, showBooks ? undefined : 2);

  const hasMoreCompletions = bookData.filter(b => b.percent >= 100).length > 2;

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border)/0.7)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
      }}
    >
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)' }} />

      {/* ── Hero Section ── */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-[2.4rem] font-black text-foreground leading-none tracking-tight"
              style={{ textShadow: '0 0 30px rgba(34,197,94,0.2)' }}>
              {overallPercent}%
            </p>
            <p className="text-[13px] font-medium text-muted-foreground mt-1">
              through Scripture · <span className="text-foreground/70 font-semibold">{totalRead.toLocaleString()} / {TOTAL_BIBLE_CHAPTERS.toLocaleString()} chapters</span>
            </p>
          </div>
        </div>
        <div className="w-full h-2.5 rounded-full overflow-hidden mt-3" style={{ backgroundColor: GREEN_TRACK }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${GREEN} 0%, rgb(74,222,128) 100%)` }}
          />
        </div>
      </div>

      {/* ── OT / NT ── */}
      <div className="space-y-2.5 mb-6">
        {otSection && <ThinProgressRow label="Old Testament" percent={otSection.percent} delay={0.2} />}
        {ntSection && <ThinProgressRow label="New Testament" percent={ntSection.percent} delay={0.3} />}
      </div>

      {/* ── Book Progress ── */}
      <div className="pt-4 border-t border-border/50">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest">Book Progress</p>
          <div className="flex items-center rounded-md overflow-hidden" style={{ border: '1px solid hsl(var(--border))' }}>
            {['year', 'lifetime'].map(m => (
              <button
                key={m}
                onClick={() => setBookMode(m)}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors"
                style={{
                  background: bookMode === m ? GREEN : 'transparent',
                  color: bookMode === m ? '#fff' : 'hsl(var(--muted-foreground))'
                }}
              >
                {m === 'year' ? 'Year' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {bookData.filter(b => b.completedDistinct > 0).length === 0 ? (
          <p className="text-[13px] text-muted-foreground/60 text-center py-4">No books started yet</p>
        ) : (
          <div className="space-y-4">
            {/* Current book in progress */}
            {currentBooks.map(book => (
              <div key={book.bookIndex}
                className="rounded-xl p-3"
                style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-[13px] font-semibold text-foreground">{book.bookName}</span>
                    <span className="ml-2 text-[11px] text-muted-foreground/60">{book.completedDistinct}/{book.totalChapters} ch</span>
                  </div>
                  <span className="text-[13px] font-bold" style={{ color: GREEN }}>{Math.round(book.percent)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: GREEN_TRACK }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(book.percent)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${GREEN}, rgb(74,222,128))` }}
                  />
                </div>
              </div>
            ))}

            {/* Recent completions */}
            {recentCompletions.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Completed</p>
                {recentCompletions.map(book => (
                  <div key={book.bookIndex} className="flex items-center justify-between py-1">
                    <span className="text-[13px] text-foreground/80 font-medium">{book.bookName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground/50">{book.totalChapters} ch</span>
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                        style={{ background: 'rgba(34,197,94,0.1)', color: GREEN }}>✓</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {hasMoreCompletions && (
              <button
                onClick={() => setShowBooks(!showBooks)}
                className="w-full pt-3 border-t border-border/40 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{showBooks ? 'Show less' : `See all completed books`}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showBooks ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}