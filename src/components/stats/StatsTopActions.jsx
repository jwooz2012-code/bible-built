import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StatsTopActions() {
  const [showShareSummary, setShowShareSummary] = useState(false);
  const [showAccountability, setShowAccountability] = useState(false);
  const navigate = useNavigate();

  const handleShareMonthly = () => {
    setShowShareSummary(false);
    navigate(createPageUrl('ShareSummary') + '?mode=monthly');
  };

  const handleShareYearly = () => {
    setShowShareSummary(false);
    navigate(createPageUrl('ShareSummary') + '?mode=yearly');
  };

  return (
    <>
      <div className="flex gap-3 mb-8">
        <Button
          variant="outline"
          onClick={() => setShowShareSummary(true)}
          className="flex-1 h-10">
          Share Summary
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowAccountability(true)}
          className="flex-1 h-10">
          Log Accountability
        </Button>
      </div>

      {/* Share Summary Sheet */}
      <Sheet open={showShareSummary} onOpenChange={setShowShareSummary}>
        <SheetContent side="bottom" className="max-w-md mx-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Share Summary</SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={handleShareMonthly}
              className="w-full justify-start">
              Share Monthly Summary
            </Button>
            <Button
              variant="outline"
              onClick={handleShareYearly}
              className="w-full justify-start">
              Share Yearly Summary
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Accountability Sheet */}
      <Sheet open={showAccountability} onOpenChange={setShowAccountability}>
        <SheetContent side="bottom" className="max-w-md mx-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Accountability</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Accountability features coming soon.</p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}