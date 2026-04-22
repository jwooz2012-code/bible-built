/**
 * migrateXpToUnified (admin-only)
 *
 * Recalculates treasuryCurrencyBalance for a user as:
 *   (unique chapters × 100) + milestone bonuses − artifact purchases
 *
 * Safe to re-run — always recomputes from source of truth.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const XP_PER_CHAPTER = 100;

async function migrateWallet(base44, userId) {
  // 1. Find wallet — list all and filter in memory (asServiceRole bypasses RLS)
  const allWallets = await base44.asServiceRole.entities.UserWallet.list('-created_date', 500);
  const wallets = allWallets.filter(w => w.userId === userId);
  if (wallets.length === 0) return { error: 'no_wallet', userId, totalWallets: allWallets.length };

  // Pick the wallet with the highest progressXpTotal
  const wallet = wallets.sort((a, b) => (b.progressXpTotal ?? 0) - (a.progressXpTotal ?? 0))[0];

  // 2. Count unique chapters read
  const allLogs = await base44.asServiceRole.entities.ReadingLog.list('-created_date', 5000);
  const userLogs = allLogs.filter(l => l.userId === userId);
  const uniqueChapterIds = new Set(userLogs.map(l => l.chapterId).filter(Boolean));
  const earnedXp = uniqueChapterIds.size * XP_PER_CHAPTER;

  // 3. Total spent on artifacts
  const allSpendTxs = await base44.asServiceRole.entities.XPTransaction.list('-created_date', 500);
  const spendTxs = allSpendTxs.filter(tx => tx.userId === userId && tx.type === 'spend_currency');
  const totalSpent = spendTxs.reduce((sum, tx) => sum + Math.abs(tx.amount ?? 0), 0);

  // 4. Milestone bonuses (earn_currency transactions) — deduplicate by idempotencyKey
  const allMilestoneTxs = await base44.asServiceRole.entities.XPTransaction.list('-created_date', 1000);
  const milestoneTxs = allMilestoneTxs.filter(tx => tx.userId === userId && tx.type === 'earn_currency');
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

  const updated = await base44.asServiceRole.entities.UserWallet.update(wallet.id, {
    progressXpTotal: earnedXp,
    treasuryCurrencyBalance: newBalance,
    level: newLevel,
    updatedAt: new Date().toISOString(),
  });

  return { userId, walletId: wallet.id, uniqueChapters: uniqueChapterIds.size, earnedXp, milestoneBonus, totalSpent, newBalance };
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