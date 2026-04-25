/**
 * consolidateWallets (admin only)
 *
 * Fixes wallet proliferation by delegating all XP recalculation to
 * auditSingleUser (the single source of truth), which also deduplicates
 * wallets as part of its applyUpdate path.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Find all distinct userIds that have wallets
    const allWallets = await base44.asServiceRole.entities.UserWallet.list('-created_date', 500);
    const userIds = [...new Set(allWallets.map(w => w.userId).filter(Boolean))];

    const results = [];

    for (const userId of userIds) {
      try {
        const res = await base44.asServiceRole.functions.invoke('auditSingleUser', {
          userId,
          applyUpdate: true,
        });
        const data = res.data ?? res;
        results.push({
          userId,
          status: 'ok',
          xpBalance: data.finalXp,
          level: data.level,
          walletAction: data.walletUpdateResult?.action,
        });
      } catch (err) {
        results.push({ userId, status: 'error', error: err.message });
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    return Response.json({ success: true, usersProcessed: userIds.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});