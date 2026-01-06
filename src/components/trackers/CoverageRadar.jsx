import React from 'react';

export default function CoverageRadar({ sectionData }) {
  // Sort by coverage (lowest first)
  const sortedData = [...sectionData].sort((a, b) => a.percent - b.percent);
  
  // Get bottom 3 sections for "Focus Next"
  const bottom3 = sortedData.slice(0, 3).map(s => s.section.split('/')[0]).join(', ');

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-base font-semibold text-foreground mb-2">Bible Coverage</h3>
      <p className="text-xs text-muted-foreground mb-4">Lowest coverage first</p>
      
      {bottom3 && (
        <div className="mb-5 p-3 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Focus Next:</span> {bottom3}
          </p>
        </div>
      )}

      <div className="space-y-3.5">
        {sortedData.map((section, idx) => {
          const sectionName = section.section.split('/')[0];
          const percent = Math.round(section.percent);
          
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">{sectionName}</span>
                <span className="text-muted-foreground font-semibold text-xs">{percent}%</span>
              </div>
              <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: 'hsl(var(--chart-1))'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}