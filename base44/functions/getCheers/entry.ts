import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_USERS = 200;

// Base44 answers 429 when too many requests arrive at once; back off and try again.
export async function fetchWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if ((err as any)?.status === 429 && i < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
      } else {
        throw err;
      }
    }
  }
}

// People the caller may see cheers for: themselves, friends, and members of their groups.
async function circleOf(db: any, userId: string) {
  const [sent, received, groups] = await Promise.all([
    fetchWithRetry(() => db.entities.Friendship.filter({ user1Id: userId, status: 'accepted' })),
    fetchWithRetry(() => db.entities.Friendship.filter({ user2Id: userId, status: 'accepted' })),
    fetchWithRetry(() => db.entities.Group.list('-created_date', 1000)),
  ]);
  const circle = new Set<string>([userId]);
  sent.forEach((f: any) => circle.add(f.user2Id));
  received.forEach((f: any) => circle.add(f.user1Id));
  groups
    .filter((g: any) => g.ownerId === userId || (g.memberIds ?? []).includes(userId))
    .forEach((g: any) => [g.ownerId, ...(g.memberIds ?? [])].forEach((id: string) => id && circle.add(id)));
  return circle;
}

// Run async work over a list a few at a time, so big feeds don't trip the rate limit.
async function inBatches<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>) {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) out.push(...await Promise.all(items.slice(i, i + size).map(fn)));
  return out;
}

// Recent cheers received by people in the caller's circle, so feeds can show reaction counts and who reacted.
export async function handleGetCheers(base44: any, user: any, body: any) {
  const db = base44.asServiceRole;
  const requested = Array.isArray(body?.userIds) ? [...new Set(body.userIds.filter((id: unknown) => typeof id === 'string'))].slice(0, MAX_USERS) : [];
  const sinceDays = Math.min(Math.max(Number(body?.sinceDays) || 21, 1), 60);
  if (requested.length === 0) return { status: 200, body: { cheers: [] } };

  const circle = await circleOf(db, user.id);
  const ids = requested.filter((id) => circle.has(id as string)) as string[];
  const since = Date.now() - sinceDays * DAY_MS;
  const lists = await inBatches(ids, 5, (id) => fetchWithRetry(() => db.entities.Cheer.filter({ toUserId: id }, '-created_date', 300)));

  // Newest first, so if a double tap ever saved two cheers for one item, only the latest counts.
  const seen = new Set<string>();
  const cheers = lists.flat()
    .filter((c: any) => new Date(c.createdAt ?? c.created_date).getTime() >= since)
    .sort((a: any, b: any) => new Date(b.createdAt ?? b.created_date).getTime() - new Date(a.createdAt ?? a.created_date).getTime())
    .filter((c: any) => {
      const key = `${c.fromUserId}|${c.targetKey}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  const senderIds = [...new Set(cheers.map((c: any) => c.fromUserId as string))].slice(0, 150);
  const senders = await inBatches(senderIds, 5, (id) => fetchWithRetry(() => db.entities.User.filter({ id })).then((r: any[]) => r[0]));
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
