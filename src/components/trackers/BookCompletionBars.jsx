import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function BookCompletionBars({ bookProgressYear, bookProgressLifetime }) {
  const [mode, setMode] = useState('year');
  const data = mode === 'year' ? bookProgressYear : bookProgressLifetime;

  // Show only books with progress
  const filteredData = data.filter(b => b.completedDistinct > 0);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">Book Progress</h3>
        <div className="flex gap-2">
          <Button
            variant={mode === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('year')}
            className="h-8 text-xs bg-background text-slate-800 border border-border dark:text-white"
          >
            This Year
          </Button>
          <Button
            variant={mode === 'lifetime' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('lifetime')}
            className="h-8 text-xs bg-background text-slate-800 border border-border dark:text-white"
          >
            Lifetime
          </Button>
        </div>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No books started yet</p>
        ) : (
          filteredData.map(book => (
            <div key={book.bookIndex}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{book.bookName}</span>
                <span className="text-xs text-muted-foreground">
                  {book.completedDistinct}/{book.totalChapters}
                </span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bb-progress-gradient transition-all duration-300"
                  style={{ width: `${book.percent}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}