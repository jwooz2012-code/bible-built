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

  const { memberIds } = await req.json();
  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    return Response.json({ logs: [] });
  }

  // Fetch logs for all members with rate limit retry
  const logsByMember = await Promise.all(
    memberIds.map(id =>
      fetchWithRetry(() =>
        base44.asServiceRole.entities.ReadingLog.filter({ userId: id }, '-created_date', 500)
      )
    )
  );

  const logs = logsByMember.flat();
  return Response.json({ logs });
});