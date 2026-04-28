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
    const logs = await base44.asServiceRole.entities.ReadingLog.filter({ userId, chapterId });
    // If no logs exist, the chapter was already removed — treat as success
    if (logs.length === 0) return Response.json({ success: true, alreadyRemoved: true });

    // Delete ALL logs for this chapter and deduct all their XP
    const totalXpToDeduct = logs.reduce((sum, l) => sum + (l.xpEarned ?? 0), 0);
    const latestLog = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    // Get wallet
    const wallets = await base44.asServiceRole.entities.UserWallet.filter({ userId }, 'created_date', 5);
    const wallet = wallets[0] ?? null;

    const now = new Date().toISOString();

    // Delete all logs for this chapter using user-scoped client (RLS requires data.userId match)
    await Promise.all(logs.map(async (log) => {
      try {
        await base44.entities.ReadingLog.delete(log.id);
      } catch (deleteErr) {
        if (!deleteErr.message?.includes('not found') && !deleteErr.message?.includes('404')) throw deleteErr;
      }
    }));

    if (totalXpToDeduct > 0 && wallet) {
      const removalKey = `chapter_remove_all:${userId}:${chapterId}:${now}`;
      await base44.asServiceRole.entities.XPTransaction.create({
        userId,
        type: 'adjustment',
        source: 'chapter_removed',
        amount: -totalXpToDeduct,
        idempotencyKey: removalKey,
        metadataJson: JSON.stringify({ chapterId, dateKey: latestLog.dateKey, xpToDeduct: totalXpToDeduct, logsRemoved: logs.length }),
        createdAt: now,
      });

      const newBalance = Math.max(0, (wallet.xpBalance ?? 0) - totalXpToDeduct);
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
      xpDeducted: totalXpToDeduct,
      dateKey: latestLog.dateKey,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});