/**
 * consolidateWallets (admin only)
 * 
 * Fixes the wallet proliferation bug by:
 * 1. Finding all users with multiple wallets
 * 2. For each user: merging progressXpTotal (from XPTransactions), 
 *    treasuryCurrencyBalance (summing spend/earn transactions), level
 * 3. Keeping the oldest wallet record (canonical), updating it with correct values
 * 4. Deleting the duplicate wallets
 * 
 * Recomputes balances from XPTransactions — the source of truth.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Load ALL wallets
    const allWallets = await base44.asServiceRole.entities.UserWallet.list('-created_date', 500);

    console.log('[consolidate] total wallets loaded:', allWallets.length);
    if (allWallets.length > 0) console.log('[consolidate] sample wallet keys:', Object.keys(allWallets[0]));

    // Group by userId — wallets store userId in data.userId
    const byUser = {};
    for (const w of allWallets) {
      const uid = w.userId || w['data.userId'];
      if (!uid) continue;
      if (!byUser[uid]) byUser[uid] = [];
      byUser[uid].push(w);
    }
    console.log('[consolidate] users with wallets:', Object.keys(byUser).length);

    const results = [];

    for (const [userId, wallets] of Object.entries(byUser)) {
      // Load all XP transactions for this user — source of truth
      const txns = await base44.asServiceRole.entities.XPTransaction.filter(
        { 'data.userId': userId }, '-created_date', 2000
      );

      // Compute correct progressXpTotal from earn_progress_xp transactions
      const progressXp = txns
        .filter(t => t.type === 'earn_progress_xp' || t.type === 'adjustment')
        .reduce((sum, t) => sum + (t.amount ?? 0), 0);

      // Compute correct treasury balance from earn_currency + spend_currency
      const treasuryBalance = txns
        .filter(t => t.type === 'earn_currency' || t.type === 'spend_currency')
        .reduce((sum, t) => sum + (t.amount ?? 0), 0);

      const correctLevel = Math.floor(progressXp / 1000) + 1;
      const now = new Date().toISOString();

      if (wallets.length === 1) {
        // Only one wallet — just make sure values are correct
        const w = wallets[0];
        const needsUpdate = 
          w.progressXpTotal !== progressXp || 
          Math.abs((w.treasuryCurrencyBalance ?? 0) - Math.max(0, treasuryBalance)) > 0.01 ||
          w.level !== correctLevel;

        if (needsUpdate) {
          await base44.asServiceRole.entities.UserWallet.update(w.id, {
            progressXpTotal: progressXp,
            treasuryCurrencyBalance: Math.max(0, treasuryBalance),
            level: correctLevel,
            updatedAt: now,
          });
          results.push({ userId, action: 'corrected_single', walletId: w.id, progressXp, treasuryBalance: Math.max(0, treasuryBalance), correctLevel });
        } else {
          results.push({ userId, action: 'ok', walletId: w.id });
        }
        continue;
      }

      // Multiple wallets — keep oldest (first created), delete rest
      wallets.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      const canonical = wallets[0];
      const duplicates = wallets.slice(1);

      // Update canonical with correct values
      await base44.asServiceRole.entities.UserWallet.update(canonical.id, {
        progressXpTotal: progressXp,
        treasuryCurrencyBalance: Math.max(0, treasuryBalance),
        level: correctLevel,
        updatedAt: now,
      });

      // Delete duplicates
      for (const dup of duplicates) {
        await base44.asServiceRole.entities.UserWallet.delete(dup.id);
      }

      results.push({
        userId,
        action: 'consolidated',
        keptWalletId: canonical.id,
        deletedCount: duplicates.length,
        progressXp,
        treasuryBalance: Math.max(0, treasuryBalance),
        correctLevel,
      });
    }

    return Response.json({ success: true, usersProcessed: Object.keys(byUser).length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});