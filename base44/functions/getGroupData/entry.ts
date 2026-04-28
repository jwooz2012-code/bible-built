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

  // Step 2: fetch users and wallets for members only, then reading logs
  const [memberUsers, memberWallets, allGraceDays] = await Promise.all([
    fetchWithRetry(() =>
      Promise.all(memberIds.map(id => base44.asServiceRole.entities.User.filter({ id })))
        .then(results => results.flat())
    ),
    fetchWithRetry(() =>
      Promise.all(memberIds.map(id => base44.asServiceRole.entities.UserWallet.filter({ userId: id })))
        .then(results => results.flat())
    ),
    fetchWithRetry(() => base44.asServiceRole.entities.GraceDay.filter({ userId: memberIds[0] })),
  ]);

  // Fetch remaining grace days for other members sequentially to avoid rate limit
  if (memberIds.length > 1) {
    for (let i = 1; i < memberIds.length; i++) {
      const graceDaysForMember = await fetchWithRetry(() =>
        base44.asServiceRole.entities.GraceDay.filter({ userId: memberIds[i] })
      );
      allGraceDays.push(...graceDaysForMember);
    }
  }

  // Fetch reading logs in batches to avoid rate limit
  const logs = [];
  for (const memberId of memberIds) {
    const memberLogs = await fetchWithRetry(() =>
      base44.asServiceRole.entities.ReadingLog.filter({ userId: memberId }, '-created_date', 500)
    );
    logs.push(...memberLogs);
  }

  // Build wallet map
  const getXp = (w) => Math.max(w.xpBalance || 0, w.spendableXp || 0, w.progressXpTotal || 0);
  const walletMap = {};
  memberWallets.forEach(w => {
    const existing = walletMap[w.userId];
    if (!existing || getXp(w) > getXp(existing)) {
      walletMap[w.userId] = w;
    }
  });

  // Calculate streak for each member from their logs and grace days
  const computeStreak = (userId) => {
    const userLogs = logs.filter(l => l.userId === userId);
    const userGraceDays = allGraceDays.filter(g => g.userId === userId);
    
    if (userLogs.length === 0) return 0;
    
    const dateSet = new Set(userLogs.map(l => l.dateKey));
    const sortedDates = Array.from(dateSet).sort().reverse();
    
    const today = new Date().toISOString().split('T')[0];
    const mostRecent = sortedDates[0];
    const daysSinceMostRecent = Math.floor((new Date(today) - new Date(mostRecent)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceMostRecent > 1) return 0; // Streak broken
    
    let currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const d1 = new Date(sortedDates[i - 1]);
      const d2 = new Date(sortedDates[i]);
      const diff = Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  };

  const members = memberUsers
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
      streak: computeStreak(u.id),
    }));

  return Response.json({ group, members, logs });
});