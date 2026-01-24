import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function StatsTopActions() {
  const [showShareSummary, setShowShareSummary] = useState(false);
  const [showAccountability, setShowAccountability] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleShareMonthly = () => {
    setShowShareSummary(false);
    navigate(createPageUrl('ShareSummary') + '?mode=monthly');
  };

  const handleShareYearly = () => {
    setShowShareSummary(false);
    navigate(createPageUrl('ShareSummary') + '?mode=yearly');
  };

  const handleLogShared = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      const statsSharedCount = (user?.statsSharedCount || 0) + 1;
      await base44.auth.updateMe({ statsSharedCount });
      setShowAccountability(false);
      toast.success('Logged');
    } catch (error) {
      toast.error('Failed to log');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogReceived = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      const statsReceivedCount = (user?.statsReceivedCount || 0) + 1;
      await base44.auth.updateMe({ statsReceivedCount });
      setShowAccountability(false);
      toast.success('Logged');
    } catch (error) {
      toast.error('Failed to log');
    } finally {
      setIsLoading(false);
    }
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
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={handleLogShared}
              disabled={isLoading}
              className="w-full justify-start">
              I shared my stats with someone
            </Button>
            <Button
              variant="outline"
              onClick={handleLogReceived}
              disabled={isLoading}
              className="w-full justify-start">
              Someone shared their stats with me
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}