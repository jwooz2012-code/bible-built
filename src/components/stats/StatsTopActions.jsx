import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';

export default function StatsTopActions() {
  const [showShareSummary, setShowShareSummary] = useState(false);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const navigate = useNavigate();

  const handleOpenSheet = () => {
    setShowShareSummary(true);
  };

  const handleOpenPreview = (mode) => {
    setShowShareSummary(false);
    const now = new Date();
    let params;
    if (mode === 'monthly') {
      params = `?mode=monthly&year=${now.getFullYear()}&month=${now.getMonth() + 1}`;
    } else if (mode === 'weekly') {
      params = `?mode=weekly`;
    } else {
      params = `?mode=yearly&year=${now.getFullYear()}`;
    }
    navigate(createPageUrl('ShareSummary') + params);
  };

  return (
    <>
      <button
        onClick={handleOpenSheet}
        className="flex items-center justify-center gap-1.5 bg-card rounded-[8px] px-3.5 h-7 transition-colors hover:bg-accent text-[14px] font-medium text-foreground whitespace-nowrap min-w-[120px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Share Stats
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {/* Share Summary Selection Sheet */}
      <Sheet open={showShareSummary} onOpenChange={setShowShareSummary}>
        <SheetContent side="bottom" className="max-w-md mx-auto pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
          <SheetHeader className="mb-6">
            <SheetTitle>Share Summary</SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => handleOpenPreview('weekly')}
              className="w-full justify-start">
              Share Weekly Summary
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOpenPreview('monthly')}
              className="w-full justify-start">
              Share Monthly Summary
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOpenPreview('yearly')}
              className="w-full justify-start">
              Share Yearly Summary
            </Button>
          </div>
        </SheetContent>
      </Sheet>

    </>
  );
}