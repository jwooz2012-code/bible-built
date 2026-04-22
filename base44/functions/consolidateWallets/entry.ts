/**
 * consolidateWallets (admin only)
 * 
 * Fixes wallet proliferation by recomputing balances from XPTransactions
 * and consolidating to a single canonical wallet per user.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Load ALL wallets using list() — no filter, service role bypasses RLS
    const allWallets = await base44.asServiceRole.entities.UserWallet.list('-created_date', 500);
    console.log('[consolidate] total wallets loaded:', allWallets.length);

    if (allWallets.length === 0) {
      return Response.json({ success: true, usersProcessed: 0, results: [], note: 'No wallets found' });
    }

    // Group by userId
    const byUser = {};
    for (const w of allWallets) {
      const uid = w.userId;
      if (!uid) {
        console.log('[consolidate] wallet missing userId, skipping id:', w.id);
        continue;
      }
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
      console.log('[consolidate] userId:', userId, 'txns:', txns.length, 'wallets:', wallets.length);

      // Compute correct progressXpTotal from earn_progress_xp + adjustment transactions
      // Also load the user's legacy xp field as a floor
      const userRecords = await base44.asServiceRole.entities.User.filter({ 'data.id': userId });
      const legacyXp = userRecords.length > 0 ? (userRecords[0].xp ?? 0) : 0;

      const txnXp = txns
        .filter(t => t.type === 'earn_progress_xp' || t.type === 'adjustment')
        .reduce((sum, t) => sum + (t.amount ?? 0), 0);

      // Use the higher of transaction-derived XP or legacy user.xp (profile is source of truth)
      const progressXp = Math.max(txnXp, legacyXp);

      // Compute correct treasury balance from earn_currency + spend_currency
      const treasuryBalance = txns
        .filter(t => t.type === 'earn_currency' || t.type === 'spend_currency')
        .reduce((sum, t) => sum + (t.amount ?? 0), 0);

      const correctLevel = Math.floor(progressXp / 1000) + 1;
      const now = new Date().toISOString();

      console.log('[consolidate] computed for', userId, ': progressXp=', progressXp, 'treasuryBalance=', treasuryBalance, 'level=', correctLevel);

      if (wallets.length === 1) {
        // Single wallet — just correct the balances
        const w = wallets[0];
        await base44.asServiceRole.entities.UserWallet.update(w.id, {
          progressXpTotal: progressXp,
          treasuryCurrencyBalance: Math.max(0, treasuryBalance),
          level: correctLevel,
          updatedAt: now,
        });
        results.push({ userId, action: 'corrected_single', walletId: w.id, progressXp, treasuryBalance: Math.max(0, treasuryBalance), correctLevel });
        continue;
      }

      // Multiple wallets — keep oldest, delete rest, set correct values on canonical
      wallets.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      const canonical = wallets[0];
      const duplicates = wallets.slice(1);

      await base44.asServiceRole.entities.UserWallet.update(canonical.id, {
        progressXpTotal: progressXp,
        treasuryCurrencyBalance: Math.max(0, treasuryBalance),
        level: correctLevel,
        updatedAt: now,
      });

      let deletedCount = 0;
      for (const dup of duplicates) {
        try {
          await base44.asServiceRole.entities.UserWallet.delete(dup.id);
          deletedCount++;
        } catch(e) {
          console.log('[consolidate] failed to delete wallet:', dup.id, e.message);
        }
      }

      results.push({
        userId,
        action: 'consolidated',
        keptWalletId: canonical.id,
        deletedCount,
        progressXp,
        treasuryBalance: Math.max(0, treasuryBalance),
        correctLevel,
      });
    }

    return Response.json({ success: true, usersProcessed: Object.keys(byUser).length, results });
  } catch (error) {
    console.log('[consolidate] error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});