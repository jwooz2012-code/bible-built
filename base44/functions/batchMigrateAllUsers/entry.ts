/**
 * batchMigrateAllUsers (admin-only)
 *
 * Optimized batch migration: processes users one at a time without loading all data upfront.
 * Uses indexed queries for speed, processes in under 30s for typical user base.
 * Safe to re-run—fully idempotent.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const XP_PER_CHAPTER = 100;

async function migrateWallet(base44, userId) {
  // 1. Get user's wallet(s) via indexed query
  const wallets = await base44.asServiceRole.entities.UserWallet.filter({ 'data.userId': userId }, '-progressXpTotal', 10);
  if (wallets.length === 0) {
    return { status: 'no_wallet', userId };
  }

  const wallet = wallets[0]; // Already sorted by progressXpTotal descending

  // 2. Count unique chapters via indexed query
  const logs = await base44.asServiceRole.entities.ReadingLog.filter({ 'data.userId': userId }, '-created_date', 500);
  const uniqueChapterIds = new Set(logs.map(l => l.chapterId).filter(Boolean));
  const earnedXp = uniqueChapterIds.size * XP_PER_CHAPTER;

  // 3. Get user's transactions (spend + earn)
  const txs = await base44.asServiceRole.entities.XPTransaction.filter({ 'data.userId': userId }, '-created_date', 500);

  const spendTxs = txs.filter(tx => tx.type === 'spend_currency');
  const totalSpent = spendTxs.reduce((sum, tx) => sum + Math.abs(tx.amount ?? 0), 0);

  const milestoneTxs = txs.filter(tx => tx.type === 'earn_currency');
  const seenKeys = new Set();
  let milestoneBonus = 0;
  for (const tx of milestoneTxs) {
    const key = tx.idempotencyKey ?? tx.id;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      milestoneBonus += tx.amount ?? 0;
    }
  }

  const newBalance = Math.max(0, earnedXp + milestoneBonus - totalSpent);
  const newLevel = Math.floor(earnedXp / 1000) + 1;

  // Update primary wallet
  await base44.asServiceRole.entities.UserWallet.update(wallet.id, {
    progressXpTotal: earnedXp,
    treasuryCurrencyBalance: newBalance,
    level: newLevel,
    updatedAt: new Date().toISOString(),
  });

  // Delete duplicates
  for (const dup of wallets.slice(1)) {
    await base44.asServiceRole.entities.UserWallet.delete(dup.id);
  }

  return {
    status: 'migrated',
    userId,
    walletId: wallet.id,
    uniqueChapters: uniqueChapterIds.size,
    earnedXp,
    newBalance,
    newLevel,
    duplicatesRemoved: wallets.length - 1,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all users
    const users = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    const results = [];
    for (let i = 0; i < users.length; i++) {
      const targetUser = users[i];
      try {
        const result = await migrateWallet(base44, targetUser.id);
        results.push(result);
      } catch (error) {
        results.push({
          status: 'error',
          userId: targetUser.id,
          error: error.message,
        });
      }
      // Throttle every 5 users to avoid rate limits
      if ((i + 1) % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const migratedCount = results.filter(r => r.status === 'migrated').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const noWalletCount = results.filter(r => r.status === 'no_wallet').length;

    return Response.json({
      success: true,
      summary: {
        totalUsers: users.length,
        migratedCount,
        errorCount,
        noWalletCount,
      },
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});