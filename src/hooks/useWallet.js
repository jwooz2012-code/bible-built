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
    staleTime: 30_000,
  });

  // XPTransaction is the single source of truth
   const { data: txData = { totalXp: 0, progressXp: 0, spendableXp: 0 } } = useQuery({
     queryKey: ['xpTransactions', user?.id],
     queryFn: async () => {
       const transactions = await base44.entities.XPTransaction.filter({ 'data.userId': user.id });

       let progressXp = 0;
       let spendable = 0;

       for (const tx of transactions) {
         if (tx.type === 'earn_progress_xp') {
           progressXp += tx.amount ?? 0;
         } else if (tx.type === 'earn_currency') {
           spendable += tx.amount ?? 0;
         } else if (tx.type === 'spend_currency') {
           spendable += tx.amount ?? 0; // amount is negative
         }
       }

       const totalXp = Math.max(0, progressXp + spendable);

       return {
         totalXp,
         progressXp: Math.max(0, progressXp),
         spendableXp: Math.max(0, spendable),
       };
     },
     enabled: !!user?.id,
     staleTime: 30_000,
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
       queryClient.invalidateQueries({ queryKey: ['xpTransactions', user?.id] });
     },
   });

   const totalXp = txData.totalXp;
   const progressXpTotal = txData.progressXp;
   const spendableXp = txData.spendableXp;

   return {
     wallet,
     isLoading,
     totalXp,
     spendableXp,
     treasuryBalance: spendableXp,
     progressXp: progressXpTotal,
     progressXpTotal,
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