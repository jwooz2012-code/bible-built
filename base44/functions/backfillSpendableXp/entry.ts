/**
 * backfillSpendableXp (admin-only)
 *
 * Recalculates spendableXp for all users based on:
 *   spendableXp = (chapters × 100) + (milestone bonuses) − (total XP spent on artifacts)
 *
 * Chunks processing to avoid rate limits.
 * Idempotent — safe to re-run.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const XP_PER_CHAPTER = 100;

async function migrateUser(base44, userId) {
  try {
    // 1. Count unique chapters (earned XP)
    const allLogs = await base44.asServiceRole.entities.ReadingLog.list('-created_date', 5000);
    const userLogs = allLogs.filter(l => l.userId === userId);
    const uniqueChapterIds = new Set(userLogs.map(l => l.chapterId).filter(Boolean));
    const earnedXp = uniqueChapterIds.size * XP_PER_CHAPTER;

    // 2. Milestone bonuses (deduplicated by idempotencyKey)
    const allTxs = await base44.asServiceRole.entities.XPTransaction.list('-created_date', 2000);
    const userTxs = allTxs.filter(tx => tx.userId === userId);
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

    // 3. Total XP spent on artifacts
    const purchaseHistory = await base44.asServiceRole.entities.ArtifactPurchaseHistory.list('-created_date', 1000);
    const userPurchases = purchaseHistory.filter(p => p.userId === userId);
    const totalSpent = userPurchases.reduce((sum, p) => sum + (p.xpSpent ?? 0), 0);

    const newSpendableXp = Math.max(0, earnedXp + milestoneBonus - totalSpent);

    // 4. Update wallet
    const wallets = await base44.asServiceRole.entities.UserWallet.list('-created_date', 100);
    const userWallets = wallets.filter(w => w.userId === userId);
    if (userWallets.length === 0) {
      return { status: 'no_wallet', userId };
    }

    const wallet = userWallets[0];
    await base44.asServiceRole.entities.UserWallet.update(wallet.id, {
      spendableXp: newSpendableXp,
      updatedAt: new Date().toISOString(),
    });

    return {
      status: 'success',
      userId,
      uniqueChapters: uniqueChapterIds.size,
      earnedXp,
      milestoneBonus,
      totalSpent,
      newSpendableXp,
    };
  } catch (error) {
    return { status: 'error', userId, error: error.message };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all users
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    const results = [];
    for (let i = 0; i < allUsers.length; i++) {
      const targetUser = allUsers[i];
      const result = await migrateUser(base44, targetUser.id);
      results.push(result);

      // Throttle every 10 to avoid rate limits
      if ((i + 1) % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const noWalletCount = results.filter(r => r.status === 'no_wallet').length;

    return Response.json({
      success: true,
      summary: {
        totalUsers: allUsers.length,
        successCount,
        errorCount,
        noWalletCount,
      },
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});