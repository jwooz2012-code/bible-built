import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Shared Plan Info Card Component
 * Applies consistent typography, spacing, and hierarchy across all plan detail views.
 * Works in Light, Dark, and Energy modes.
 */
export default function PlanInfoCard({
  icon: Icon,
  iconColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  accentGradient,
  title,
  shortHook,
  subtitle,
  description,
  isDescriptionLong,
  onToggleDescription,
  showFullDescription,
  statsRow,
  readingPreview,
  children,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm"
      style={{ background: accentGradient ? `linear-gradient(135deg, ${accentGradient}, transparent)` : undefined }}
    >
      {/* Header Row */}
      <div className="flex items-start gap-4 mb-5">
        {Icon && (
          <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${iconColor}`}>
            <Icon className="w-7 h-7" strokeWidth={2} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-foreground mb-2 leading-snug">{title}</h1>
          {shortHook && (
            <p className="text-xs text-muted-foreground/70 mb-1.5 leading-normal">{shortHook}</p>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground/85 leading-relaxed line-clamp-2">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="mb-5 pb-5 border-b border-border/50">
          <p
            className={`text-sm text-foreground/80 leading-relaxed ${
              !showFullDescription && isDescriptionLong ? 'line-clamp-4' : ''
            }`}
          >
            {description}
          </p>
          {isDescriptionLong && (
            <button
              onClick={onToggleDescription}
              className="text-xs text-primary hover:text-primary/80 font-medium mt-2 transition-colors"
            >
              {showFullDescription ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Stats Row */}
      {statsRow && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          {statsRow.map((stat, idx) => (
            <div key={idx} className="bg-muted/40 rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1.5">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-foreground leading-tight">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground/80 mt-0.5">{stat.sublabel}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reading Preview Section */}
      {readingPreview && readingPreview.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Reading Preview</h3>
          <div className="space-y-2.5">
            {readingPreview.map((preview, idx) => (
              <div key={idx} className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-2">
                  Day {preview.day}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {preview.visibleChapters.map((chap, cidx) => (
                    <span
                      key={cidx}
                      className="text-xs font-medium text-foreground bg-background/70 px-2.5 py-1.5 rounded-md whitespace-nowrap"
                    >
                      {chap}
                    </span>
                  ))}
                  {preview.remainingCount > 0 && (
                    <span className="text-xs font-medium text-muted-foreground/70 bg-background/40 px-2.5 py-1.5 rounded-md">
                      +{preview.remainingCount} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {readingPreview[0]?.showToggle && (
            <button
              onClick={readingPreview[0].onToggle}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {readingPreview[0].isExpanded ? 'Show less' : 'View full preview'}
            </button>
          )}
        </div>
      )}

      {/* Custom children content */}
      {children}
    </motion.div>
  );
}