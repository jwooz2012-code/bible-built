import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StatsTopActions() {
  const [showShareSummary, setShowShareSummary] = useState(false);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const navigate = useNavigate();

  const handleOpenPreview = (mode) => {
    setSelectedMode(mode);
    setShowShareSummary(false);
    setShowSharePreview(true);
  };

  const handleProceedToSummary = () => {
    setShowSharePreview(false);
    const now = new Date();
    const params = selectedMode === 'monthly' 
      ? `?mode=monthly&year=${now.getFullYear()}&month=${now.getMonth() + 1}`
      : `?mode=yearly&year=${now.getFullYear()}`;
    navigate(createPageUrl('ShareSummary') + params);
  };

  return (
    <>
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => setShowShareSummary(true)}
          className="w-full h-10">
          Share Summary
        </Button>
      </div>

      {/* Share Summary Selection Sheet */}
      <Sheet open={showShareSummary} onOpenChange={setShowShareSummary}>
        <SheetContent side="bottom" className="max-w-md mx-auto pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
          <SheetHeader className="mb-6">
            <SheetTitle>Share Summary</SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
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

      {/* Share Preview/Explainer Sheet */}
      <Sheet open={showSharePreview} onOpenChange={setShowSharePreview}>
        <SheetContent side="bottom" className="max-w-md mx-auto pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
          <SheetHeader className="mb-6">
            <SheetTitle>Screenshot & Share</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground pt-2">
              This summary is designed to be screenshotted and shared.
            </SheetDescription>
          </SheetHeader>
          <Button
            onClick={handleProceedToSummary}
            className="w-full">
            View Summary
          </Button>
        </SheetContent>
      </Sheet>
    </>
  );
}