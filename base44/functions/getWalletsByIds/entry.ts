import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { ids } = await req.json();
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Response.json({ wallets: [] });
  }

  const allWallets = await base44.asServiceRole.entities.UserWallet.list();
  const filtered = allWallets.filter(w => ids.includes(w.userId));

  return Response.json({ wallets: filtered });
});