/**
 * removeChapterRead
 *
 * Deletes a ReadingLog and records a negative XP adjustment transaction
 * so the user's spendable XP and progress XP are correctly reduced.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { chapterId } = await req.json().catch(() => ({}));
    if (!chapterId) return Response.json({ error: 'chapterId is required' }, { status: 400 });

    const userId = user.id;

    // Find the reading log(s) for this chapter
    const logs = await base44.asServiceRole.entities.ReadingLog.filter({ 'data.userId': userId, 'data.chapterId': chapterId });
    if (logs.length === 0) return Response.json({ error: 'No matching log found' }, { status: 404 });

    const latestLog = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    const xpToDeduct = latestLog.xpEarned ?? 0;

    // Find the original earn transaction to know the exact XP to reverse
    const idempotencyKey = `chapter_read:${userId}:${chapterId}:${latestLog.dateKey}`;
    const removalKey = `chapter_remove:${userId}:${chapterId}:${latestLog.dateKey}`;

    // Idempotency: don't double-deduct
    const existingRemoval = await base44.asServiceRole.entities.XPTransaction.filter({
      'data.userId': userId,
      'data.idempotencyKey': removalKey,
    });
    if (existingRemoval.length > 0) {
      return Response.json({ success: true, alreadyRemoved: true });
    }

    // Get wallet (oldest = canonical, consistent with logChapterRead)
    const wallets = await base44.asServiceRole.entities.UserWallet.filter({ 'data.userId': userId }, 'created_date', 5);
    const wallet = wallets[0] ?? null;

    const now = new Date().toISOString();

    // Delete the reading log
    await base44.asServiceRole.entities.ReadingLog.delete(latestLog.id);

    // Find the original earn transaction to get the exact XP amount
    const earnTxs = await base44.asServiceRole.entities.XPTransaction.filter({
      'data.userId': userId,
      'data.idempotencyKey': idempotencyKey,
    });
    const originalXp = earnTxs.length > 0 ? (earnTxs[0].amount ?? xpToDeduct) : xpToDeduct;

    if (originalXp > 0 && wallet) {
      // Record negative XP adjustment (adjustment type is valid in the enum)
      await base44.asServiceRole.entities.XPTransaction.create({
        userId,
        type: 'adjustment',
        source: 'chapter_removed',
        amount: -originalXp,
        idempotencyKey: removalKey,
        metadataJson: JSON.stringify({ chapterId, dateKey: latestLog.dateKey, originalXp }),
        createdAt: now,
      });

      // Update the unified xpBalance (not the legacy progressXpTotal field)
      const newBalance = Math.max(0, (wallet.xpBalance ?? 0) - originalXp);
      const newLevel = Math.floor(newBalance / 1000) + 1;
      await base44.asServiceRole.entities.UserWallet.update(wallet.id, {
        xpBalance: newBalance,
        level: newLevel,
        updatedAt: now,
      });
    }

    return Response.json({
      success: true,
      deletedLogId: latestLog.id,
      xpDeducted: originalXp,
      dateKey: latestLog.dateKey,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});