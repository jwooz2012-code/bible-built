import React from 'react';

const GRACE_DAYS_PER_MONTH = 2;

export default function GraceDaysBanner({ tierColor, graceDaysUsed = 0 }) {
  const color = tierColor || '#10B981';
  const graceDaysAvailable = Math.max(0, GRACE_DAYS_PER_MONTH - graceDaysUsed);
  const leftLabel = graceDaysAvailable === 0 ? 'none left' : graceDaysAvailable === 1 ? '1 left' : '2 left';

  return (
    <div className="flex items-center gap-2 mb-3" style={{ height: 30 }}>
      <span className="text-xs font-medium text-muted-foreground">Grace Days</span>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: GRACE_DAYS_PER_MONTH }, (_, i) => (
          <div
            key={i}
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: i < graceDaysAvailable ? color : 'transparent',
              border: `1.5px solid ${i < graceDaysAvailable ? color : 'rgba(161,161,170,0.4)'}`,
              opacity: i < graceDaysAvailable ? 1 : 0.45,
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground/60">({leftLabel})</span>
    </div>
  );
}