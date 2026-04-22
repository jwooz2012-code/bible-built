/**
 * batchMigrateAllUsers (admin-only)
 *
 * Batch reconciles wallet balances for ALL users at once.
 * Recalculates progressXpTotal and treasuryCurrencyBalance from source of truth.
 * Returns detailed summary with success/error counts.
 *
 * Safe to re-run—fully idempotent.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const XP_PER_CHAPTER = 100;

async function fetchAll(entity, limit = 5000) {
  return await entity.list('-created_date', limit);
}

async function migrateWallet(base44, userId) {
  // 1. Find wallet(s) for this user
  const allWallets = await fetchAll(base44.asServiceRole.entities.UserWallet, 1000);
  const wallets = allWallets.filter(w => w.userId === userId);

  if (wallets.length === 0) {
    return { status: 'no_wallet', userId };
  }

  // Pick the wallet with the highest progressXpTotal
  const wallet = wallets.sort((a, b) => (b.progressXpTotal ?? 0) - (a.progressXpTotal ?? 0))[0];

  // 2. Count unique chapters read by this user
  const allLogs = await fetchAll(base44.asServiceRole.entities.ReadingLog, 5000);
  const userLogs = allLogs.filter(l => l.userId === userId);
  const uniqueChapterIds = new Set(userLogs.map(l => l.chapterId).filter(Boolean));
  const earnedXp = uniqueChapterIds.size * XP_PER_CHAPTER;

  // 3. Total currency spent on artifacts
  const allTxs = await fetchAll(base44.asServiceRole.entities.XPTransaction, 2000);
  const userTxs = allTxs.filter(tx => tx.userId === userId);

  const spendTxs = userTxs.filter(tx => tx.type === 'spend_currency');
  const totalSpent = spendTxs.reduce((sum, tx) => sum + Math.abs(tx.amount ?? 0), 0);

  // 4. Milestone bonuses — deduplicate by idempotencyKey
  const milestoneTxs = userTxs.filter(tx => tx.type === 'earn_currency');
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

  await base44.asServiceRole.entities.UserWallet.update(wallet.id, {
    progressXpTotal: earnedXp,
    treasuryCurrencyBalance: newBalance,
    level: newLevel,
    updatedAt: new Date().toISOString(),
  });

  // Delete any duplicate wallets for this user
  const duplicates = wallets.filter(w => w.id !== wallet.id);
  for (const dup of duplicates) {
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
    duplicatesRemoved: duplicates.length,
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
    const allUsers = await fetchAll(base44.asServiceRole.entities.User, 5000);

    const results = [];
    for (const targetUser of allUsers) {
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
    }

    const migratedCount = results.filter(r => r.status === 'migrated').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const noWalletCount = results.filter(r => r.status === 'no_wallet').length;

    return Response.json({
      success: true,
      summary: {
        totalUsers: allUsers.length,
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