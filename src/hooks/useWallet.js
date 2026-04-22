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
      // Create or get wallet
      const wallets = await base44.entities.UserWallet.filter({ 'data.userId': user.id });
      let w = wallets.length > 0 ? wallets[0] : null;

      if (!w) {
        try {
          const res = await base44.functions.invoke('initUserWallet', {});
          w = res.data?.wallet ?? null;
        } catch (e) {
          console.log('[useWallet] init failed:', e.message);
        }
      }

      return w;
    },
    enabled: !!user?.id,
    staleTime: 0,
  });

  // Calculate spendableXp dynamically: (chapters × 100) - artifacts spent
  const { data: chaptersRead = 0 } = useQuery({
    queryKey: ['chaptersRead', user?.id],
    queryFn: async () => {
      const logs = await base44.entities.ReadingLog.filter({ 'data.userId': user.id });
      return logs.length; // count of chapters read
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const { data: artifactSpent = 0 } = useQuery({
    queryKey: ['artifactSpent', user?.id],
    queryFn: async () => {
      const purchases = await base44.entities.ArtifactPurchaseHistory.filter({ 'data.userId': user.id });
      return purchases.reduce((sum, p) => sum + (p.xpSpent ?? 0), 0);
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

  // Calculate spendable XP: (chapters read × 100) - artifacts purchased
  const spendableXp = Math.max(0, chaptersRead * 100 - artifactSpent);

  return {
    wallet,
    isLoading,
    spendableXp,
    treasuryBalance: spendableXp,
    progressXp: spendableXp,
    progressXpTotal: chaptersRead * 100,
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