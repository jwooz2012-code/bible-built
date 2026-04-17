/**
 * useWallet
 * 
 * Provides the current user's UserWallet data.
 * - Auto-initializes wallet (and backfills) on first call
 * - Returns { wallet, isLoading, grantMilestone }
 * - grantMilestone is idempotent — safe to call multiple times for the same event
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { getDateKey } from '@/components/bible/utils/dateUtils';

export function useWallet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['userWallet', user?.id],
    queryFn: async () => {
      // Try to read wallet directly first
      const wallets = await base44.entities.UserWallet.filter({ userId: user.id });
      if (wallets.length > 0) return wallets[0];
      
      // Wallet doesn't exist — init it (backfills from historical logs)
      const res = await base44.functions.invoke('initUserWallet', {});
      return res.data?.wallet ?? null;
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const grantMilestoneMutation = useMutation({
    mutationFn: async ({ milestoneKey, source, metadataJson }) => {
      const res = await base44.functions.invoke('grantMilestoneReward', {
        milestoneKey,
        source,
        metadataJson,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userWallet', user?.id] });
    },
  });

  return {
    wallet,
    isLoading,
    treasuryBalance: wallet?.treasuryCurrencyBalance ?? 0,
    progressXp: wallet?.progressXpTotal ?? 0,
    walletLevel: wallet?.level ?? 1,
    grantMilestone: grantMilestoneMutation.mutateAsync,
  };
}

/**
 * Build a milestone key for daily reading completion.
 * Safe to call — grantMilestoneReward is idempotent.
 */
export function dailyMilestoneKey(userId, dateKey, type) {
  return `${type}:${userId}:${dateKey}`;
}