/**
 * initUserWallet
 *
 * Creates a UserWallet for the current user if one doesn't exist.
 * Delegates all XP calculation to auditSingleUser — the single source of truth.
 *
 * Safe to call multiple times — fully idempotent.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.id;

    // If wallet already exists, return it immediately
    const wallets = await base44.asServiceRole.entities.UserWallet.filter({ 'data.userId': userId }, 'created_date', 5);
    if (wallets.length > 0) {
      return Response.json({ wallet: wallets[0], initialized: false });
    }

    // No wallet — delegate to auditSingleUser to compute correct XP and create the wallet
    const res = await base44.asServiceRole.functions.invoke('auditSingleUser', {
      userId,
      applyUpdate: true,
    });

    const data = res.data ?? res;

    // Fetch the freshly created wallet to return it
    const newWallets = await base44.asServiceRole.entities.UserWallet.filter({ 'data.userId': userId }, 'created_date', 5);
    const wallet = newWallets[0] ?? null;

    return Response.json({ wallet, initialized: true, xpBalance: data.finalXp, level: data.level });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});