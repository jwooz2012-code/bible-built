/**
 * migrateXpToUnified (admin-only)
 *
 * For the calling user: recalculates treasuryCurrencyBalance as
 *   (unique chapters × 100) + milestone bonuses − artifact purchases
 *
 * For all users: the useWallet hook's initUserWallet path handles
 * self-correction on next app open.
 *
 * Safe to re-run — always recomputes from source of truth.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const XP_PER_CHAPTER = 100;

async function migrateWallet(base44, userId) {
  // 1. Find wallet
  const wallets = await base44.asServiceRole.entities.UserWallet.filter({ 'data.userId': userId }, '-created_date', 5);
  if (wallets.length === 0) return null;
  const wallet = wallets.sort((a, b) => (b.progressXpTotal ?? 0) - (a.progressXpTotal ?? 0))[0];

  // 2. Count unique chapters
  const allLogs = await base44.asServiceRole.entities.ReadingLog.filter({ 'data.userId': userId }, '-created_date', 5000);
  const uniqueChapterIds = new Set(allLogs.map(l => l.chapterId).filter(Boolean));
  const earnedXp = uniqueChapterIds.size * XP_PER_CHAPTER;

  // 3. Total spent on artifacts
  const spendTxs = await base44.asServiceRole.entities.XPTransaction.filter({ 'data.userId': userId, 'data.type': 'spend_currency' }, '-created_date', 500);
  const totalSpent = spendTxs.reduce((sum, tx) => sum + Math.abs(tx.amount ?? 0), 0);

  // 4. Milestone bonuses (earn_currency transactions)
  const milestoneTxs = await base44.asServiceRole.entities.XPTransaction.filter({ 'data.userId': userId, 'data.type': 'earn_currency' }, '-created_date', 1000);
  const milestoneBonus = milestoneTxs.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);

  const newBalance = Math.max(0, earnedXp + milestoneBonus - totalSpent);
  const newLevel = Math.floor(earnedXp / 1000) + 1;

  const updated = await base44.asServiceRole.entities.UserWallet.update(wallet.id, {
    progressXpTotal: earnedXp,
    treasuryCurrencyBalance: newBalance,
    level: newLevel,
    updatedAt: new Date().toISOString(),
  });

  return { userId, uniqueChapters: uniqueChapterIds.size, earnedXp, milestoneBonus, totalSpent, newBalance, updated };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    // If specific userId provided, migrate just that user; otherwise migrate self
    const targetUserId = body.userId ?? user.id;

    const result = await migrateWallet(base44, targetUserId);
    if (!result) return Response.json({ error: 'No wallet found for user' }, { status: 404 });

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});