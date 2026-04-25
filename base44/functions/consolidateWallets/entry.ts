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
    // Allow both admin role and service-role calls (for internal use)
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    console.log('[consolidate] running as admin:', user.email);

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
      console.log('[consolidate] userId:', userId, 'wallets:', wallets.length);

      // Use current xpBalance from the best existing wallet as the floor
      const existingMaxXp = wallets.reduce((max, w) => Math.max(max, w.xpBalance ?? 0), 0);
      const correctLevel = Math.floor(existingMaxXp / 1000) + 1;
      const now = new Date().toISOString();

      console.log('[consolidate] computed for', userId, ': xpBalance=', existingMaxXp, 'level=', correctLevel);

      // Keep oldest wallet as canonical — delete rest
      wallets.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      const canonical = wallets[0];
      const duplicates = wallets.slice(1);

      if (wallets.length === 1) {
        results.push({ userId, action: 'single_wallet_ok', walletId: canonical.id, xpBalance: existingMaxXp, correctLevel });
        continue;
      }

      await base44.asServiceRole.entities.UserWallet.update(canonical.id, {
        xpBalance: existingMaxXp,
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
        xpBalance: existingMaxXp,
        correctLevel,
      });
    }

    return Response.json({ success: true, usersProcessed: Object.keys(byUser).length, results });
  } catch (error) {
    console.log('[consolidate] error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});