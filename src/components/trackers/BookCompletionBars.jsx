import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { getChartColors } from '@/components/utils/chartColors';
import { ChevronDown } from 'lucide-react';

export default function BookCompletionBars({ bookProgressYear, bookProgressLifetime }) {
  const { resolvedTheme, energyMode } = useTheme();
  const colors = getChartColors(resolvedTheme, energyMode);
  const [mode, setMode] = useState('year');
  const [isExpanded, setIsExpanded] = useState(false);
  const data = mode === 'year' ? bookProgressYear : bookProgressLifetime;

  // Show only books with progress
  const filteredData = data.filter(b => b.completedDistinct > 0);
  
  // Show top 6 by default, all when expanded
  const displayData = isExpanded ? filteredData : filteredData.slice(0, 6);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">Book Progress</h3>
        <div className="flex gap-2">
          <Button
            variant={mode === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('year')}
            className="h-8 text-xs"
          >
            This Year
          </Button>
          <Button
            variant={mode === 'lifetime' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('lifetime')}
            className="h-8 text-xs"
          >
            Lifetime
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {filteredData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No books started yet</p>
        ) : (
          displayData.map(book => (
            <div key={book.bookIndex}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{book.bookName}</span>
                <span className="text-xs text-muted-foreground">
                  {book.completedDistinct}/{book.totalChapters}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.track }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${book.percent}%`,
                    backgroundColor: colors.primary,
                    backgroundImage: energyMode ? 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))' : undefined
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
      {filteredData.length > 6 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 pt-3 border-t border-border flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>{isExpanded ? 'Hide books' : 'View all books'}</span>
          <ChevronDown 
            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </button>
      )}
    </div>
  );
}