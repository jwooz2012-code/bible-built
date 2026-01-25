import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { getChartColors } from '@/components/utils/chartColors';

export default function CoverageRadar({ sectionData }) {
  const { resolvedTheme, energyMode } = useTheme();
  const colors = getChartColors(resolvedTheme, energyMode);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Sort by coverage descending (highest first)
  const sortedData = [...sectionData].sort((a, b) => b.percent - a.percent);
  
  // Show top 3 by default, all when expanded
  const displayData = isExpanded ? sortedData : sortedData.slice(0, 3);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">Bible Coverage</h3>

      <div className="space-y-3.5">
        {displayData.map((section, idx) => {
          const sectionName = section.section.split('/')[0];
          const percent = Math.round(section.percent);
          const displayPercent = percent === 0 ? '—' : `${percent}%`;
          
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">{sectionName}</span>
                <span className="text-muted-foreground font-semibold text-xs">{displayPercent}</span>
              </div>
              <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.track }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: colors.primary
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-4 pt-3 border-t border-border flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{isExpanded ? 'Hide sections' : 'View all sections'}</span>
        <ChevronDown 
          className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </button>
    </div>
  );
}