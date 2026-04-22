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
      const wallets = await base44.entities.UserWallet.filter({ 'data.userId': user.id });
      if (wallets.length > 0) {
        // Always use wallet with highest progress XP in case of duplicates
         const w = wallets.sort((a, b) => (b.progressXpTotal ?? 0) - (a.progressXpTotal ?? 0))[0];
         // Auto-patch if spendableXp is 0 but has reading history (not yet backfilled)
         if ((w.spendableXp ?? 0) === 0 && (w.progressXpTotal ?? 0) > 0) {
           try {
             const res = await base44.functions.invoke('initUserWallet', {});
             if (res.data?.wallet) return res.data.wallet;
           } catch (e) {
             console.log('[useWallet] backfill failed silently:', e.message);
           }
         }
         return w;
      }
      // Wallet doesn't exist — init it (includes XP + treasury backfill)
      const res = await base44.functions.invoke('initUserWallet', {});
      return res.data?.wallet ?? null;
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

  // spendableXp is the single unified XP number — what the user has to spend
  // progressXp is the lifetime progress XP (used for leveling)
  const spendableXp = wallet?.spendableXp ?? 0;
  const progressXpTotal = wallet?.progressXpTotal ?? 0;

  return {
    wallet,
    isLoading,
    spendableXp,
    treasuryBalance: spendableXp, // alias for backward compat
    progressXp: spendableXp,       // what the user can spend (Profile shows this)
    progressXpTotal,               // lifetime XP for leveling
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