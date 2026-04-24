/**
 * useWallet
 *
 * Provides the current user's UserWallet data.
 * Single source of truth: xpBalance from UserWallet entity.
 * Returns { wallet, isLoading, xpBalance, level }
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export function useWallet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['userWallet', user?.id],
    queryFn: async () => {
      const wallets = await base44.entities.UserWallet.filter({ 'data.userId': user.id });
      // Pick the wallet with the highest effective XP (handles duplicates & legacy field names)
      const getXp = (w) => Math.max(w.xpBalance || 0, w.spendableXp || 0, w.progressXpTotal || 0);
      let w = wallets.length > 0
        ? wallets.reduce((best, cur) => getXp(cur) > getXp(best) ? cur : best)
        : null;

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

  const xpBalance = wallet?.xpBalance ?? wallet?.spendableXp ?? wallet?.progressXpTotal ?? 0;
  const level = wallet?.level ?? 1;

  return {
    wallet,
    isLoading,
    xpBalance,
    // Legacy aliases so existing UI doesn't break
    totalXp: xpBalance,
    spendableXp: xpBalance,
    treasuryBalance: xpBalance,
    progressXp: xpBalance,
    progressXpTotal: xpBalance,
    walletLevel: level,
    grantMilestone: grantMilestoneMutation.mutateAsync,
  };
}

export function dailyMilestoneKey(userId, dateKey, type) {
  return `${type}:${userId}:${dateKey}`;
}