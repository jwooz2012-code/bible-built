/**
 * removeChapterRead
 *
 * Deletes the most recent ReadingLog for a chapter and records a negative XP adjustment.
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

    // Find all reading logs for this chapter, pick the most recent
    const logs = await base44.asServiceRole.entities.ReadingLog.filter({ 'data.userId': userId, 'data.chapterId': chapterId });
    if (logs.length === 0) return Response.json({ error: 'No matching log found' }, { status: 404 });

    const latestLog = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    const xpToDeduct = latestLog.xpEarned ?? 0;

    // Use the log's ID for a unique removal idempotency key
    const removalKey = `chapter_remove:${userId}:${latestLog.id}`;

    // Idempotency: don't double-deduct
    const existingRemoval = await base44.asServiceRole.entities.XPTransaction.filter({
      'data.userId': userId,
      'data.idempotencyKey': removalKey,
    });
    if (existingRemoval.length > 0) {
      return Response.json({ success: true, alreadyRemoved: true });
    }

    // Get wallet
    const wallets = await base44.asServiceRole.entities.UserWallet.filter({ 'data.userId': userId }, 'created_date', 5);
    const wallet = wallets[0] ?? null;

    const now = new Date().toISOString();

    // Delete the reading log
    await base44.asServiceRole.entities.ReadingLog.delete(latestLog.id);

    if (xpToDeduct > 0 && wallet) {
      await base44.asServiceRole.entities.XPTransaction.create({
        userId,
        type: 'adjustment',
        source: 'chapter_removed',
        amount: -xpToDeduct,
        idempotencyKey: removalKey,
        metadataJson: JSON.stringify({ chapterId, dateKey: latestLog.dateKey, xpToDeduct }),
        createdAt: now,
      });

      const newBalance = Math.max(0, (wallet.xpBalance ?? 0) - xpToDeduct);
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
      xpDeducted: xpToDeduct,
      dateKey: latestLog.dateKey,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});