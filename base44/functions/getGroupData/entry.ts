import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function fetchWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.status === 429 && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      } else {
        throw err;
      }
    }
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { groupId } = await req.json();
  if (!groupId) return Response.json({ error: 'groupId required' }, { status: 400 });

  // Step 1: fetch the group
  const groups = await fetchWithRetry(() =>
    base44.asServiceRole.entities.Group.filter({ id: groupId })
  );
  const group = groups[0];
  if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });

  const memberIds = group.memberIds ?? [];
  if (memberIds.length === 0) {
    return Response.json({ group, members: [], logs: [], graceDays: [] });
  }

  // Step 2: fetch everything in parallel — users, wallets, grace days, and all member logs
  const [allUsers, allWallets, allGraceDays, ...logsByMember] = await Promise.all([
    fetchWithRetry(() => base44.asServiceRole.entities.User.list()),
    fetchWithRetry(() => base44.asServiceRole.entities.UserWallet.list()),
    fetchWithRetry(() => base44.asServiceRole.entities.GraceDay.list()),
    ...memberIds.map(id =>
      fetchWithRetry(() =>
        base44.asServiceRole.entities.ReadingLog.filter({ userId: id }, '-created_date', 500)
      )
    ),
  ]);

  // Build wallet map: for each userId, pick the wallet with the highest XP
  const getXp = (w) => Math.max(w.xpBalance || 0, w.spendableXp || 0, w.progressXpTotal || 0);
  const walletMap = {};
  allWallets.forEach(w => {
    const existing = walletMap[w.userId];
    if (!existing || getXp(w) > getXp(existing)) {
      walletMap[w.userId] = w;
    }
  });

  const members = allUsers
    .filter(u => memberIds.includes(u.id))
    .map(u => ({
      id: u.id,
      full_name: u.full_name,
      displayName: u.displayName,
      email: u.email,
      xpBalance: getXp(walletMap[u.id] ?? {}),
      avatarType: u.avatarType,
      avatarPhotoUrl: u.avatarPhotoUrl,
      avatarEmoji: u.avatarEmoji,
      avatarDefaultId: u.avatarDefaultId,
      streak: u.streak,
    }));

  const graceDays = allGraceDays.filter(g => memberIds.includes(g.userId));
  const logs = logsByMember.flat();

  return Response.json({ group, members, logs, graceDays });
});