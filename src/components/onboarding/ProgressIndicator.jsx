import React from 'react';

export default function ProgressIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex gap-2 justify-center py-6">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i < currentStep
              ? 'bg-foreground w-2'
              : i === currentStep
              ? 'bg-foreground w-8'
              : 'bg-muted w-2'
          }`}
        />
      ))}
    </div>
  );
}