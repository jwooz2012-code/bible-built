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

    // Load ALL wallets — use filter with empty object to bypass RLS
    const allWallets = await base44.asServiceRole.entities.UserWallet.filter({}, '-created_date', 500);
    console.log('[consolidate] total wallets loaded:', allWallets.length);
    
    if (allWallets.length === 0) {
      return Response.json({ success: true, usersProcessed: 0, results: [], note: 'No wallets found' });
    }

    // Log first wallet structure to debug field access
    const sample = allWallets[0];
    console.log('[consolidate] sample wallet full object:', JSON.stringify(sample));

    // Group by userId — the SDK returns entity data fields directly on the object
    const byUser = {};
    for (const w of allWallets) {
      // Try all possible field locations
      const uid = w.userId ?? w['data.userId'] ?? w.data?.userId;
      console.log('[consolidate] wallet id:', w.id, 'userId found:', uid, 'raw userId field:', w.userId);
      if (!uid) continue;
      if (!byUser[uid]) byUser[uid] = [];
      byUser[uid].push(w);
    }
    console.log('[consolidate] users with wallets:', Object.keys(byUser).length);

    const results = [];

    for (const [userId, wallets] of Object.entries(byUser)) {
      // Load all XP transactions — source of truth
      const txns = await base44.asServiceRole.entities.XPTransaction.filter(
        { 'data.userId': userId }, '-created_date', 2000
      );
      console.log('[consolidate] userId:', userId, 'txns found:', txns.length, 'wallets:', wallets.length);
      if (txns.length > 0) console.log('[consolidate] sample txn:', JSON.stringify(txns[0]));

      // Compute correct progressXpTotal
      const progressXp = txns
        .filter(t => (t.type ?? t['data.type']) === 'earn_progress_xp' || (t.type ?? t['data.type']) === 'adjustment')
        .reduce((sum, t) => sum + ((t.amount ?? t['data.amount']) ?? 0), 0);

      // Compute correct treasury balance
      const treasuryBalance = txns
        .filter(t => (t.type ?? t['data.type']) === 'earn_currency' || (t.type ?? t['data.type']) === 'spend_currency')
        .reduce((sum, t) => sum + ((t.amount ?? t['data.amount']) ?? 0), 0);

      const correctLevel = Math.floor(progressXp / 1000) + 1;
      const now = new Date().toISOString();

      console.log('[consolidate] computed: progressXp=', progressXp, 'treasuryBalance=', treasuryBalance, 'level=', correctLevel);

      if (wallets.length === 1) {
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

      // Multiple wallets — keep oldest, delete rest
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
      let deletedCount = 0;
      for (const dup of duplicates) {
        try {
          await base44.asServiceRole.entities.UserWallet.delete(dup.id);
          deletedCount++;
          console.log('[consolidate] deleted duplicate wallet:', dup.id);
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
    console.log('[consolidate] top-level error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});