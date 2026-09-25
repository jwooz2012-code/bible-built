import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_USERS = 200;

// Recent cheers received by the given people, so feeds can show reaction counts and who reacted.
export async function handleGetCheers(base44: any, user: any, body: any) {
  const db = base44.asServiceRole;
  const ids = Array.isArray(body?.userIds) ? [...new Set(body.userIds.filter((id: unknown) => typeof id === 'string'))].slice(0, MAX_USERS) : [];
  const sinceDays = Math.min(Math.max(Number(body?.sinceDays) || 21, 1), 60);
  if (ids.length === 0) return { status: 200, body: { cheers: [] } };

  const since = Date.now() - sinceDays * DAY_MS;
  const lists = await Promise.all(ids.map((id) => db.entities.Cheer.filter({ toUserId: id }, '-created_date', 300)));
  const cheers = lists.flat().filter((c: any) => new Date(c.createdAt ?? c.created_date).getTime() >= since);

  const senderIds = [...new Set(cheers.map((c: any) => c.fromUserId))].slice(0, 150);
  const senders = await Promise.all(senderIds.map((id) => db.entities.User.filter({ id }).then((r: any[]) => r[0])));
  const names: Record<string, string> = {};
  senders.forEach((u: any) => { if (u) names[u.id] = u.displayName || u.full_name || 'Someone'; });

  return {
    status: 200,
    body: {
      cheers: cheers.map((c: any) => ({
        id: c.id,
        fromUserId: c.fromUserId,
        fromName: c.fromUserId === user.id ? 'You' : (names[c.fromUserId] ?? 'Someone'),
        toUserId: c.toUserId,
        kind: c.kind,
        targetKey: c.targetKey,
        createdAt: c.createdAt ?? c.created_date,
      })),
    },
  };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  try {
    const { status, body: out } = await handleGetCheers(base44, user, body);
    return Response.json(out, { status });
  } catch (err) {
    console.error('[getCheers] Error:', (err as Error)?.message);
    return Response.json({ error: (err as Error)?.message || 'Internal error' }, { status: 500 });
  }
});
