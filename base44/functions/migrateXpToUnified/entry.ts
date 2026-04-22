/**
 * migrateXpToUnified (admin-only)
 *
 * Recalculates wallet balances for a user as:
 *   progressXpTotal = unique chapters × 100
 *   treasuryCurrencyBalance = earnedXp + milestoneBonus − totalSpent
 *
 * Uses list() + in-memory filter since asServiceRole.filter() with nested
 * dot-notation keys is not supported.
 *
 * Safe to re-run — always recomputes from source of truth.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const XP_PER_CHAPTER = 100;

async function fetchAll(entity, limit = 2000) {
  return await entity.list('-created_date', limit);
}

async function migrateWallet(base44, userId) {
  // 1. Find wallet(s) for this user
  const allWallets = await fetchAll(base44.asServiceRole.entities.UserWallet, 1000);
  const wallets = allWallets.filter(w => w.userId === userId);

  if (wallets.length === 0) {
    return { error: 'no_wallet', userId, totalWalletsInDb: allWallets.length };
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
    userId,
    walletId: wallet.id,
    uniqueChapters: uniqueChapterIds.size,
    earnedXp,
    milestoneBonus,
    totalSpent,
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

    const body = await req.json().catch(() => ({}));
    const targetUserId = body.userId ?? user.id;

    const result = await migrateWallet(base44, targetUserId);
    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});