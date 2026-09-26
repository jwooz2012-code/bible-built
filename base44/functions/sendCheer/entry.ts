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

// Base44 answers 429 when too many requests arrive at once; back off and try again.
async function fetchWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
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

// Cheers are only allowed between friends or members of a shared group.
export async function areConnected(db: any, a: string, b: string) {
  const [ab, ba] = await Promise.all([
    fetchWithRetry(() => db.entities.Friendship.filter({ user1Id: a, user2Id: b, status: 'accepted' })),
    fetchWithRetry(() => db.entities.Friendship.filter({ user1Id: b, user2Id: a, status: 'accepted' })),
  ]);
  if (ab.length || ba.length) return true;

  const groups = await fetchWithRetry(() => db.entities.Group.list('-created_date', 1000));
  const inGroup = (g: any, id: string) => g.ownerId === id || (g.memberIds ?? []).includes(id);
  return groups.some((g: any) => inGroup(g, a) && inGroup(g, b));
}

const DATE = '\\d{4}-\\d{2}-\\d{2}';
const BOOK = '[1-3A-Za-z ]{2,30}';
const SESSION_KEY = new RegExp(`^s:([^:]+):(${DATE}):(${BOOK})$`);
const BOOK_KEY = new RegExp(`^m:book:([^:]+):(${BOOK}):(${DATE})$`);
const STREAK_KEY = new RegExp(`^m:streak:([^:]+):(\\d{1,4}):(${DATE})$`);
const PROFILE_KEY = new RegExp(`^p:([^:]+):(${DATE})$`);
const REPLY_KEY = /^hb:([A-Za-z0-9_-]{1,64})$/;
const ENCOURAGEMENT_TYPES = ['cheer', 'high_five', 'nudge'];

/**
 * The text shown in the recipient's notification is built here from the item's key,
 * never taken as-is from the app, so nobody can slip their own words into it.
 * Returns null when the key doesn't match its type or points at someone else.
 */
export function labelFor(targetType: string, targetKey: string, toUserId: string, clientLabel: unknown) {
  if (targetType === 'profile') {
    const p = targetKey.match(PROFILE_KEY);
    if (p) return p[1] === toUserId ? '' : null;
    return REPLY_KEY.test(targetKey) ? '' : null;
  }
  let m = targetType === 'session' ? targetKey.match(SESSION_KEY) : null;
  if (m) {
    if (m[1] !== toUserId) return null;
    const book = m[3];
    const escaped = book.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const chapters = new RegExp(`^${escaped} \\d[\\d–, ]{0,40}$`);
    return typeof clientLabel === 'string' && chapters.test(clientLabel) ? clientLabel : book;
  }
  if (targetType !== 'milestone') return null;
  m = targetKey.match(BOOK_KEY);
  if (m) return m[1] === toUserId ? `Finished ${m[2]}` : null;
  m = targetKey.match(STREAK_KEY);
  if (m) return m[1] === toUserId ? `${Number(m[2])}-day streak` : null;
  return null;
}

export async function handleSendCheer(base44: any, user: any, body: any) {
  const db = base44.asServiceRole;
  const { toUserId, kind, targetType = 'session', targetKey } = body ?? {};

  if (!toUserId || typeof toUserId !== 'string') return reply(400, { error: 'toUserId is required' });
  if (toUserId === user.id) return reply(400, { error: 'Cannot cheer yourself' });
  if (typeof kind !== 'string' || !Object.prototype.hasOwnProperty.call(KINDS, kind)) return reply(400, { error: 'Unknown cheer kind' });
  if (!TARGET_TYPES.includes(targetType)) return reply(400, { error: 'Unknown target type' });
  if (!targetKey || typeof targetKey !== 'string' || targetKey.length > 200) return reply(400, { error: 'targetKey is required' });
  const label = labelFor(targetType, targetKey, toUserId, body?.label);
  if (label === null) return reply(400, { error: 'Invalid item' });

  // A "High five back" must answer a real encouragement you received from this person,
  // and replies can't be answered again (no endless ping-pong). Whether a notification was
  // itself a reply is checked against the server-only Cheer records, which users can't edit.
  const replyTo = targetKey.match(REPLY_KEY);
  if (replyTo) {
    const [original] = await fetchWithRetry(() => db.entities.Notification.filter({ id: replyTo[1] }));
    const valid = original && original.userId === user.id && original.relatedId === toUserId
      && ENCOURAGEMENT_TYPES.includes(original.type);
    if (!valid) return reply(400, { error: 'Invalid item' });
    const theirs = await fetchWithRetry(() => db.entities.Cheer.filter({ fromUserId: toUserId, toUserId: user.id }, '-created_date', 500));
    const originalAt = original.createdAt ?? original.created_date;
    if (original.payload?.reply || theirs.some((c: any) => String(c.targetKey).startsWith('hb:') && (c.createdAt ?? c.created_date) === originalAt)) {
      return reply(400, { error: 'Invalid item' });
    }
  }

  const [connected, senderRows, existingRows, recent] = await Promise.all([
    areConnected(db, user.id, toUserId),
    fetchWithRetry(() => db.entities.User.filter({ id: user.id })),
    fetchWithRetry(() => db.entities.Cheer.filter({ fromUserId: user.id, targetKey })),
    fetchWithRetry(() => db.entities.Cheer.filter({ fromUserId: user.id }, '-created_date', 1000)),
  ]);
  if (!connected) return reply(403, { error: 'You can only cheer friends and group members' });
  const senderProfile = senderRows[0];

  // Badge totals are recounted from the sender's recent cheers every time, so a missed update
  // corrects itself; they never go below what's already stored (the recount window is capped).
  const stored = { sent: senderProfile?.cheersSent ?? 0, recipients: senderProfile?.cheerRecipients ?? 0 };
  const countOf = (list: any[], isNew = false) => ({
    sent: Math.max(list.length, stored.sent + (isNew ? 1 : 0)),
    recipients: Math.max(new Set(list.map((c: any) => c.toUserId)).size, stored.recipients),
  });

  // One cheer per sender per item: tapping a different reaction switches it, same one is a no-op.
  const existing = existingRows[0];
  if (existing) {
    if (existing.kind === kind) return reply(200, { cheer: existing, duplicate: true, stats: countOf(recent) });
    const updated = await db.entities.Cheer.update(existing.id, { kind });
    return reply(200, { cheer: { ...existing, ...updated, kind }, changed: true, stats: countOf(recent) });
  }

  const since = Date.now() - DAY_MS;
  const sentToday = recent.filter((c: any) => new Date(c.createdAt ?? c.created_date).getTime() >= since).length;
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

  const senderName = senderProfile?.displayName || senderProfile?.full_name || user.full_name || user.email?.split('@')[0] || 'Someone';
  await db.entities.Notification.create({
    userId: toUserId,
    type: 'cheer',
    message: `${senderName} ${KINDS[kind]}${label ? ` · ${label}` : ''}`,
    relatedId: user.id,
    isRead: false,
    createdAt: now,
    payload: { kind, label, targetKey, targetType, ...(replyTo ? { reply: true } : {}) },
  });

  const newStats = countOf([cheer, ...recent], true);
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
