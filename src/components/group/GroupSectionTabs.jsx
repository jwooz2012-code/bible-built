import React, { useEffect, useRef, useState } from 'react';

/**
 * The group page's section tabs. They stay pinned under the phone's status bar while
 * scrolling, so switching sections is always one tap away.
 *
 * tabs: [{ key, emoji, label, dot }]
 */
export default function GroupSectionTabs({ tabs, active, onChange, barRef }) {
  const fillerRef = useRef(null);
  const [stuck, setStuck] = useState(false);

  // Pinned → solid background, a hairline, and a strip behind the status bar so
  // content never shows through above the tabs.
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const bar = barRef.current;
      if (!bar) return;
      const safeTop = fillerRef.current?.offsetHeight ?? 0;
      setStuck(window.scrollY > 0 && bar.getBoundingClientRect().top <= safeTop + 0.5);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [barRef]);

  return (
    <div
      ref={barRef}
      className={`sticky z-30 -mx-5 px-5 py-2 transition-[background-color,box-shadow] duration-200 ${stuck ? 'bg-background/95 backdrop-blur-xl shadow-[0_1px_0_hsl(var(--border))]' : ''}`}
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      <div
        ref={fillerRef}
        aria-hidden="true"
        className={`absolute left-0 right-0 bottom-full bg-background ${stuck ? '' : 'invisible'}`}
        style={{ height: 'env(safe-area-inset-top, 0px)' }}
      />
      <div role="tablist" aria-label="Group sections" className="flex gap-1 bg-muted rounded-2xl p-1">
        {tabs.map(({ key, emoji, label, dot }) => {
          const selected = key === active;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(key)}
              className="relative flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 h-12 rounded-xl transition-all"
              style={selected
                ? { background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                : { color: 'hsl(var(--muted-foreground))' }}
            >
              <span className="relative text-base leading-none">
                {emoji}
                {dot && <span aria-label="New posts" className="absolute -top-0.5 -right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-muted" />}
              </span>
              <span className="text-[11px] font-semibold leading-none truncate max-w-full px-1">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
