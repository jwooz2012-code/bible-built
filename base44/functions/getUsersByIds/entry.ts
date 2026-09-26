import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function fetchWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(r => setTimeout(r, delay));
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

  const { ids } = await req.json();
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Response.json({ users: [] });
  }

  // Explicit limits so nobody is missed if the default page size is smaller than the user base
  const allUsers = await fetchWithRetry(() => base44.asServiceRole.entities.User.list('-created_date', 5000));
  const allWallets = await fetchWithRetry(() => base44.asServiceRole.entities.UserWallet.list('-created_date', 5000));
  const walletMap = {};
  allWallets.forEach(w => { walletMap[w.userId] = w; });
  
  const filtered = allUsers
    .filter(u => ids.includes(u.id))
    .map(u => ({ 
      id: u.id, 
      full_name: u.full_name, 
      displayName: u.displayName, 
      email: u.email, 
      spendableXp: walletMap[u.id]?.spendableXp ?? 0, 
      avatarType: u.avatarType, 
      avatarPhotoUrl: u.avatarPhotoUrl, 
      avatarEmoji: u.avatarEmoji, 
      avatarDefaultId: u.avatarDefaultId,
      // Public badge counters so other people's profiles show their badges correctly
      cheersSent: u.cheersSent ?? 0,
      cheerRecipients: u.cheerRecipients ?? 0,
      challengeAttempts: u.challengeAttempts ?? 0,
      challengePerfects: u.challengePerfects ?? 0,
      statsSharedCount: u.statsSharedCount ?? 0,
      statsReceivedCount: u.statsReceivedCount ?? 0
    }));

  return Response.json({ users: filtered });
});