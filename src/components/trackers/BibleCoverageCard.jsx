import React from 'react';
import { motion } from 'framer-motion';

const TOTAL_BIBLE_CHAPTERS = 1189;
const GREEN = 'rgb(34,197,94)';
const GREEN_TRACK = 'rgba(34,197,94,0.12)';

// Maps display label -> exact section keys used in sectionData (from bibleSections.js)
const SECTION_MERGE = [
  { label: 'Law',        keys: ['Law'],                                  testament: 'OT' },
  { label: 'History',    keys: ['History'],                              testament: 'OT' },
  { label: 'Wisdom',     keys: ['Poetry/Wisdom'],                        testament: 'OT' },
  { label: 'Prophets',   keys: ['Major Prophets', 'Minor Prophets'],     testament: 'OT' },
  { label: 'Gospels',    keys: ['Gospels'],                              testament: 'NT' },
  { label: 'Acts',       keys: ['Acts'],                                 testament: 'NT' },
  { label: 'Epistles',   keys: ['Pauline Epistles', 'General Epistles'], testament: 'NT' },
  { label: 'Revelation', keys: ['Revelation'],                           testament: 'NT' },
];

// Merge multiple raw sections into one accurate percent using chapter counts
function mergedSection(keys, sectionData) {
  let total = 0, read = 0;
  for (const s of sectionData) {
    if (keys.includes(s.section)) {
      total += s.total ?? 0;
      read += s.completedDistinct ?? 0;
    }
  }
  return { percent: total > 0 ? (read / total) * 100 : 0, read, total };
}

function SectionRow({ label, percent, delay = 0 }) {
  const pct = Math.round(percent);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-foreground/80">{label}</span>
        <span className="text-[12px] font-bold tabular-nums"
          style={{ color: pct > 0 ? GREEN : 'hsl(var(--muted-foreground)/0.4)' }}>
          {pct === 0 ? '0%' : `${pct}%`}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: GREEN_TRACK }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut', delay }}
          className="h-full rounded-full"
          style={{ background: pct > 0 ? `linear-gradient(90deg, ${GREEN}, rgb(74,222,128))` : 'transparent' }}
        />
      </div>
    </div>
  );
}

export default function BibleCoverageCard({ sectionData, bookProgressLifetime }) {
  // Hero: sum of distinct chapters per book across lifetime
  const totalRead = bookProgressLifetime.reduce((sum, b) => sum + b.completedDistinct, 0);
  const overallPercent = Math.round((totalRead / TOTAL_BIBLE_CHAPTERS) * 100);

  // Build merged sections
  const sections = SECTION_MERGE.map(s => ({
    ...s,
    ...mergedSection(s.keys, sectionData),
  }));

  const otSections = sections.filter(s => s.testament === 'OT');
  const ntSections = sections.filter(s => s.testament === 'NT');

  // Insights
  const nonZero = sections.filter(s => s.percent > 0);
  const mostRead = nonZero.length > 0 ? nonZero.reduce((a, b) => a.percent > b.percent ? a : b) : null;
  const leastExplored = sections.reduce((a, b) => a.percent < b.percent ? a : b);

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

      {/* ── Hero ── */}
      <div className="mb-6">
        <p className="text-[2.6rem] font-black text-foreground leading-none tracking-tight"
          style={{ textShadow: '0 0 30px rgba(34,197,94,0.18)' }}>
          {overallPercent}%
        </p>
        <p className="text-[13px] font-medium text-muted-foreground mt-1">
          through Scripture ·{' '}
          <span className="text-foreground/70 font-semibold">
            {totalRead.toLocaleString()} / {TOTAL_BIBLE_CHAPTERS.toLocaleString()} chapters
          </span>
        </p>
        <div className="w-full h-2.5 rounded-full overflow-hidden mt-3" style={{ backgroundColor: GREEN_TRACK }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${GREEN} 0%, rgb(74,222,128) 100%)` }}
          />
        </div>
      </div>

      {/* ── Old Testament Sections ── */}
      <div className="mb-5">
        <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-3">Old Testament</p>
        <div className="space-y-3">
          {otSections.map((s, i) => (
            <SectionRow key={s.label} label={s.label} percent={s.percent} delay={0.15 + i * 0.05} />
          ))}
        </div>
      </div>

      {/* ── New Testament Sections ── */}
      <div className="pt-4 border-t border-border/40 mb-5">
        <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-3">New Testament</p>
        <div className="space-y-3">
          {ntSections.map((s, i) => (
            <SectionRow key={s.label} label={s.label} percent={s.percent} delay={0.35 + i * 0.05} />
          ))}
        </div>
      </div>

      {/* ── Insight line ── */}
      {(mostRead || leastExplored) && (
        <div className="pt-3 border-t border-border/40 flex flex-wrap gap-x-4 gap-y-1">
          {mostRead && (
            <p className="text-[12px] text-muted-foreground/60">
              Most read: <span className="font-semibold" style={{ color: GREEN }}>{mostRead.label}</span>
            </p>
          )}
          {leastExplored && leastExplored.percent < 10 && (
            <p className="text-[12px] text-muted-foreground/60">
              Least explored: <span className="font-semibold text-foreground/60">{leastExplored.label}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}