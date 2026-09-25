import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MAX_BUDDIES = 3;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const reply = (status: number, body: Record<string, unknown>) => ({ status, body });
const nameOf = (u: any) => u?.displayName || u?.full_name || u?.email?.split('@')[0] || 'Someone';
const publicUser = (u: any) => u && ({
  id: u.id,
  displayName: u.displayName,
  full_name: u.full_name,
  avatarType: u.avatarType,
  avatarPhotoUrl: u.avatarPhotoUrl,
  avatarEmoji: u.avatarEmoji,
  avatarDefaultId: u.avatarDefaultId,
});

function shiftDate(key: string, days: number) {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// "Judges 6–7, Ruth 1" from a day's assignments.
export function describeAssignments(assignments: { bookName: string; chapter: number }[] = []) {
  const byBook = new Map<string, number[]>();
  assignments.forEach((a) => { byBook.set(a.bookName, [...(byBook.get(a.bookName) ?? []), a.chapter]); });
  return [...byBook.entries()].map(([book, chs]) => {
    const sorted = [...chs].sort((x, y) => x - y);
    return sorted.length > 1 && sorted[sorted.length - 1] - sorted[0] === sorted.length - 1
      ? `${book} ${sorted[0]}–${sorted[sorted.length - 1]}`
      : `${book} ${sorted.join(', ')}`;
  }).join(', ');
}

async function findUser(db: any, id: string) {
  return (await db.entities.User.filter({ id }))[0] ?? null;
}

async function pairBetween(db: any, a: string, b: string) {
  const [ab, ba] = await Promise.all([
    db.entities.ReadingBuddy.filter({ user1Id: a, user2Id: b }),
    db.entities.ReadingBuddy.filter({ user1Id: b, user2Id: a }),
  ]);
  return [...ab, ...ba];
}

async function buddiesOf(db: any, id: string) {
  const [sent, received] = await Promise.all([
    db.entities.ReadingBuddy.filter({ user1Id: id }),
    db.entities.ReadingBuddy.filter({ user2Id: id }),
  ]);
  return [...sent, ...received];
}

async function planProgress(db: any, userId: string, logs: any[], todayKey: string) {
  const plan = (await db.entities.ReadingPlan.filter({ userId }))[0];
  if (!plan || plan.scope === 'NONE') return null;
  const days = await db.entities.PlanDay.filter({ planId: plan.id }, 'date', 2000);
  const start = plan.startDate ?? '0000-00-00';
  const read = new Set(logs.filter((l) => (l.dateKey ?? '') >= start).map((l) => `${l.book}|${l.chapter}`));
  let total = 0;
  let done = 0;
  days.forEach((d: any) => (d.assignments ?? []).forEach((a: any) => {
    total += 1;
    if (read.has(`${a.bookName}|${a.chapter}`)) done += 1;
  }));
  const today = days.find((d: any) => d.date === todayKey);
  const todayAssignments = today?.assignments ?? [];
  return {
    name: plan.name || 'Reading plan',
    percent: total ? Math.round((done / total) * 100) : 0,
    todayLabel: todayAssignments.length ? describeAssignments(todayAssignments) : null,
    todayDone: todayAssignments.length > 0 && todayAssignments.every((a: any) => read.has(`${a.bookName}|${a.chapter}`)),
  };
}

async function buddyStats(db: any, meId: string, otherId: string, todayKey: string, sharedPlan: boolean) {
  const [myLogs, theirLogs] = await Promise.all([
    db.entities.ReadingLog.filter({ userId: meId }, '-created_date', 2000),
    db.entities.ReadingLog.filter({ userId: otherId }, '-created_date', 2000),
  ]);
  const myDays = new Set(myLogs.map((l: any) => l.dateKey));
  const theirDays = new Set(theirLogs.map((l: any) => l.dateKey));
  const week = Array.from({ length: 7 }, (_, i) => {
    const dateKey = shiftDate(todayKey, i - 6);
    return { dateKey, me: myDays.has(dateKey), them: theirDays.has(dateKey) };
  });

  // Days in a row you both read. Today only counts once you've both read; until then it doesn't break the streak.
  const both = (k: string) => myDays.has(k) && theirDays.has(k);
  let cursor = both(todayKey) ? todayKey : shiftDate(todayKey, -1);
  let streak = 0;
  while (both(cursor) && streak < 3650) { streak += 1; cursor = shiftDate(cursor, -1); }

  const plans = sharedPlan
    ? { me: await planProgress(db, meId, myLogs, todayKey), them: await planProgress(db, otherId, theirLogs, todayKey) }
    : null;

  return { week, streak, meToday: myDays.has(todayKey), themToday: theirDays.has(todayKey), plans };
}

export async function handleReadingBuddies(base44: any, user: any, body: any) {
  const db = base44.asServiceRole;
  const action = body?.action;
  const todayKey = DATE_RE.test(body?.todayKey ?? '') ? body.todayKey : new Date().toISOString().slice(0, 10);

  if (action === 'invite') {
    const { friendId, sharePlan } = body;
    if (!friendId || friendId === user.id) return reply(400, { error: 'friendId is required' });
    const [ab, ba] = await Promise.all([
      db.entities.Friendship.filter({ user1Id: user.id, user2Id: friendId, status: 'accepted' }),
      db.entities.Friendship.filter({ user1Id: friendId, user2Id: user.id, status: 'accepted' }),
    ]);
    if (!ab.length && !ba.length) return reply(403, { error: 'You can only invite friends' });
    if ((await pairBetween(db, user.id, friendId)).length) return reply(409, { error: 'Already buddies or invite pending' });
    const [mine, theirs] = await Promise.all([buddiesOf(db, user.id), buddiesOf(db, friendId)]);
    if (mine.length >= MAX_BUDDIES) return reply(409, { error: `You can have up to ${MAX_BUDDIES} reading buddies` });
    if (theirs.length >= MAX_BUDDIES) return reply(409, { error: 'Your friend already has the most buddies allowed' });

    let planId: string | undefined;
    let planName: string | undefined;
    if (sharePlan) {
      const plan = (await db.entities.ReadingPlan.filter({ userId: user.id }))[0];
      if (plan && plan.scope !== 'NONE') { planId = plan.id; planName = plan.name || 'my reading plan'; }
    }

    const now = new Date().toISOString();
    const buddy = await db.entities.ReadingBuddy.create({ user1Id: user.id, user2Id: friendId, status: 'pending', planId, planName, createdAt: now });
    const me = await findUser(db, user.id);
    await db.entities.Notification.create({
      userId: friendId,
      type: 'buddy_invite',
      message: `${nameOf(me ?? user)} wants to be your reading buddy${planName ? ` for "${planName}"` : ''} 📖`,
      relatedId: buddy.id,
      isRead: false,
      createdAt: now,
      payload: { fromUserId: user.id, planName: planName ?? null },
    });
    return reply(200, { buddy });
  }

  if (action === 'respond' || action === 'end' || action === 'getPlan') {
    const buddy = body?.buddyId ? (await db.entities.ReadingBuddy.filter({ id: body.buddyId }))[0] : null;
    if (!buddy) return reply(404, { error: 'Buddy invite not found' });
    const isParticipant = buddy.user1Id === user.id || buddy.user2Id === user.id;
    if (!isParticipant) return reply(403, { error: 'Not your buddy invite' });

    if (action === 'end') {
      await db.entities.ReadingBuddy.delete(buddy.id);
      return reply(200, { success: true });
    }

    if (action === 'getPlan') {
      if (buddy.status !== 'accepted' || !buddy.planId) return reply(404, { error: 'No shared plan' });
      const plan = (await db.entities.ReadingPlan.filter({ id: buddy.planId }))[0];
      if (!plan || plan.userId !== buddy.user1Id) return reply(404, { error: 'The shared plan is no longer available' });
      const days = await db.entities.PlanDay.filter({ planId: plan.id }, 'date', 2000);
      return reply(200, {
        plan: { name: plan.name, scope: plan.scope, startDate: plan.startDate, endDate: plan.endDate, chaptersPerDay: plan.chaptersPerDay },
        days: days.map((d: any) => ({ date: d.date, assignments: d.assignments ?? [] })).sort((a: any, b: any) => a.date.localeCompare(b.date)),
      });
    }

    // respond
    if (buddy.user2Id !== user.id || buddy.status !== 'pending') return reply(409, { error: 'This invite can no longer be answered' });
    if (!body.accept) {
      await db.entities.ReadingBuddy.delete(buddy.id);
      return reply(200, { success: true, declined: true });
    }
    const now = new Date().toISOString();
    const updated = await db.entities.ReadingBuddy.update(buddy.id, { status: 'accepted', acceptedAt: now });
    const me = await findUser(db, user.id);
    await db.entities.Notification.create({
      userId: buddy.user1Id,
      type: 'buddy_accepted',
      message: `${nameOf(me ?? user)} is now your reading buddy! 🤝`,
      relatedId: user.id,
      isRead: false,
      createdAt: now,
      payload: { buddyId: buddy.id },
    });
    return reply(200, { buddy: { ...buddy, ...updated, status: 'accepted' } });
  }

  if (action === 'status') {
    const list = await buddiesOf(db, user.id);
    const buddies = await Promise.all(list.map(async (b: any) => {
      const otherId = b.user1Id === user.id ? b.user2Id : b.user1Id;
      const other = publicUser(await findUser(db, otherId));
      const base = {
        id: b.id,
        status: b.status,
        direction: b.user1Id === user.id ? 'outgoing' : 'incoming',
        planName: b.planName ?? null,
        other: other ?? { id: otherId, displayName: 'Friend' },
      };
      if (b.status !== 'accepted') return base;
      return { ...base, stats: await buddyStats(db, user.id, otherId, todayKey, !!b.planId) };
    }));
    return reply(200, { buddies, max: MAX_BUDDIES });
  }

  return reply(400, { error: 'Unknown action' });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  try {
    const { status, body: out } = await handleReadingBuddies(base44, user, body);
    return Response.json(out, { status });
  } catch (err) {
    console.error('[readingBuddies] Error:', (err as Error)?.message);
    return Response.json({ error: (err as Error)?.message || 'Internal error' }, { status: 500 });
  }
});
