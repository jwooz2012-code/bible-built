/**
 * auditAndFixAllUsersXp
 *
 * Admin-only. Recalculates every user's xpBalance by delegating to auditSingleUser
 * (the single source of truth for XP math) with applyUpdate=true.
 *
 * Supports pagination via batchOffset + batchSize for the frontend audit UI.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const batchOffset = body.batchOffset ?? 0;
    const batchSize = body.batchSize ?? 5;

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
    const totalUsers = allUsers.length;
    const batch = allUsers.slice(batchOffset, batchOffset + batchSize);

    let updated = 0;
    let errors = 0;
    const results = [];

    for (const currentUser of batch) {
      try {
        // Delegate all XP math to auditSingleUser — single source of truth
        const res = await base44.asServiceRole.functions.invoke('auditSingleUser', {
          userId: currentUser.id,
          applyUpdate: true,
        });

        const data = res.data ?? res;
        results.push({
          userId: currentUser.id,
          email: currentUser.email,
          xpBalance: data.finalXp,
          level: data.level,
          uniqueChapters: data.uniqueChapters,
          totalVerses: data.totalVerses,
          earnedXp: data.earnedXp,
          spent: data.finalSpent,
          multiplier: data.multiplier,
          bonusDays: data.bonusDays,
          walletAction: data.walletUpdateResult?.action,
          status: 'updated',
        });
        updated++;
      } catch (err) {
        errors++;
        results.push({ userId: currentUser.id, email: currentUser.email, status: 'error', error: err.message });
      }

      // Small delay between users to avoid rate limits
      if (batch.indexOf(currentUser) < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }

    const nextOffset = batchOffset + batchSize;
    const done = nextOffset >= totalUsers;

    return Response.json({ success: true, totalUsers, updated, errors, results, nextOffset: done ? null : nextOffset, done });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});