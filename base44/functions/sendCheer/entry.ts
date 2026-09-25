import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const KINDS: Record<string, string> = {
  high_five: 'gave you a high five 🙌',
  keep_going: 'says keep going 🔥',
  praying: 'is praying for you 🙏',
  amen: 'sent you an amen ❤️',
};
const TARGET_TYPES = ['session', 'milestone', 'profile'];
const DAILY_LIMIT = 200;
const DAY_MS = 24 * 60 * 60 * 1000;

const reply = (status: number, body: Record<string, unknown>) => ({ status, body });

// Cheers are only allowed between friends, reading buddies, or members of a shared group.
export async function areConnected(db: any, a: string, b: string) {
  const [ab, ba] = await Promise.all([
    db.entities.Friendship.filter({ user1Id: a, user2Id: b, status: 'accepted' }),
    db.entities.Friendship.filter({ user1Id: b, user2Id: a, status: 'accepted' }),
  ]);
  if (ab.length || ba.length) return true;

  const [buddyAb, buddyBa] = await Promise.all([
    db.entities.ReadingBuddy.filter({ user1Id: a, user2Id: b, status: 'accepted' }),
    db.entities.ReadingBuddy.filter({ user1Id: b, user2Id: a, status: 'accepted' }),
  ]);
  if (buddyAb.length || buddyBa.length) return true;

  const groups = await db.entities.Group.list('-created_date', 1000);
  const inGroup = (g: any, id: string) => g.ownerId === id || (g.memberIds ?? []).includes(id);
  return groups.some((g: any) => inGroup(g, a) && inGroup(g, b));
}

export async function handleSendCheer(base44: any, user: any, body: any) {
  const db = base44.asServiceRole;
  const { toUserId, kind, targetType = 'session', targetKey } = body ?? {};
  const label = typeof body?.label === 'string' ? body.label.slice(0, 120) : '';

  if (!toUserId || typeof toUserId !== 'string') return reply(400, { error: 'toUserId is required' });
  if (toUserId === user.id) return reply(400, { error: 'Cannot cheer yourself' });
  if (!KINDS[kind]) return reply(400, { error: 'Unknown cheer kind' });
  if (!TARGET_TYPES.includes(targetType)) return reply(400, { error: 'Unknown target type' });
  if (!targetKey || typeof targetKey !== 'string' || targetKey.length > 200) return reply(400, { error: 'targetKey is required' });

  if (!(await areConnected(db, user.id, toUserId))) {
    return reply(403, { error: 'You can only cheer friends, buddies, and group members' });
  }

  const mine = await db.entities.Cheer.filter({ fromUserId: user.id }, '-created_date', 5000);
  const stats = (list: any[]) => ({ sent: list.length, recipients: new Set(list.map((c) => c.toUserId)).size });

  // One cheer per sender per item: tapping a different reaction switches it, same one is a no-op.
  const existing = mine.find((c: any) => c.targetKey === targetKey);
  if (existing) {
    if (existing.kind === kind) return reply(200, { cheer: existing, duplicate: true, stats: stats(mine) });
    const updated = await db.entities.Cheer.update(existing.id, { kind });
    return reply(200, { cheer: { ...existing, ...updated, kind }, changed: true, stats: stats(mine) });
  }

  const since = Date.now() - DAY_MS;
  const sentToday = mine.filter((c: any) => new Date(c.createdAt ?? c.created_date).getTime() >= since).length;
  if (sentToday >= DAILY_LIMIT) return reply(429, { error: 'Daily cheer limit reached' });

  const now = new Date().toISOString();
  const cheer = await db.entities.Cheer.create({
    fromUserId: user.id,
    toUserId,
    kind,
    targetType,
    targetKey,
    label,
    createdAt: now,
  });

  const senderProfile = (await db.entities.User.filter({ id: user.id }))[0];
  const senderName = senderProfile?.displayName || senderProfile?.full_name || user.full_name || user.email?.split('@')[0] || 'Someone';
  await db.entities.Notification.create({
    userId: toUserId,
    type: 'cheer',
    message: `${senderName} ${KINDS[kind]}${label ? ` · ${label}` : ''}`,
    relatedId: user.id,
    isRead: false,
    createdAt: now,
    payload: { kind, label, targetKey, targetType },
  });

  const newStats = stats([...mine, cheer]);
  try {
    await db.entities.User.update(user.id, { cheersSent: newStats.sent, cheerRecipients: newStats.recipients });
  } catch (err) {
    console.error('[sendCheer] Could not update cheer counts:', (err as Error)?.message);
  }

  return reply(200, { cheer, stats: newStats });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  try {
    const { status, body: out } = await handleSendCheer(base44, user, body);
    return Response.json(out, { status });
  } catch (err) {
    console.error('[sendCheer] Error:', (err as Error)?.message);
    return Response.json({ error: (err as Error)?.message || 'Internal error' }, { status: 500 });
  }
});
