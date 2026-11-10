import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Everything the Friends page needs in one call: your friends, pending friend requests,
// your groups, and recent reading for you, your friends and your group members.
// Only the people involved are looked up; nothing app-wide is downloaded.
// Returns the same data the page used to collect with many separate requests.

const FEED_LOGS_PER_PERSON = 500;   // same as before for the activity feed
const STREAK_LOGS_PER_FRIEND = 2000; // a friend's streak looks further back
const PARALLEL = 8;                  // lookups in flight at once, to stay under Base44's rate limit
const IN_CHUNK = 50;

const statusOf = (err: any) => err?.status ?? err?.response?.status;
const pause = (attempt: number) => new Promise((r) => setTimeout(r, 400 * 2 ** attempt + Math.random() * 250));

// Reads are safe to repeat, so retry when Base44 is busy (429), errors (5xx) or drops the request.
async function readWithRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      const status = statusOf(err);
      const transient = status === 429 || status === undefined || status >= 500;
      if (!transient || i >= tries - 1) throw err;
      await pause(i);
    }
  }
}

// Runs the tasks with at most `limit` in flight, keeping results in order.
async function runLimited<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

const chunk = <T,>(list: T[], size: number) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));
const timeOf = (row: any) => new Date(row?.created_date ?? 0).getTime();
const isMemberOf = (g: any, id: string) => g?.ownerId === id || (g?.memberIds ?? []).includes(id);

/**
 * Rows of `entity` whose `field` is one of `ids`. Asks for them in one go ($in) and checks the
 * answer; if Base44 doesn't honour $in, falls back to one lookup per id. Either way only the
 * matching rows come back.
 */
export async function rowsWhereIn(db: any, entity: string, field: string, ids: string[]) {
  if (ids.length === 0) return [];
  const wanted = new Set(ids);
  const out: any[] = [];
  for (const part of chunk(ids, IN_CHUNK)) {
    let rows: any[] | null = null;
    try {
      const got = await readWithRetry(() => db[entity].filter({ [field]: { $in: part } }, '-created_date', 5000));
      // Trust it only if every row matches and nothing came back unasked for.
      if (Array.isArray(got) && got.every((r: any) => part.includes(r?.[field]))) rows = got;
    } catch {
      rows = null;
    }
    if (rows === null || (rows.length === 0 && part.length > 0)) {
      // Unsupported, or genuinely nothing: confirm one id at a time.
      const each = await runLimited(part.map((id) => () => readWithRetry(() => db[entity].filter({ [field]: id }, '-created_date', 5000))), PARALLEL);
      rows = each.flat();
    }
    out.push(...rows.filter((r: any) => wanted.has(r?.[field])));
  }
  return out;
}

/**
 * The groups someone belongs to (as owner or member), newest first. Asks only for their groups;
 * if Base44 can't answer that reliably, falls back to scanning the group list as before.
 */
export async function groupsOf(db: any, userId: string) {
  try {
    const [asMember, asOwner] = await Promise.all([
      readWithRetry(() => db.Group.filter({ memberIds: userId }, '-created_date', 1000)),
      readWithRetry(() => db.Group.filter({ ownerId: userId }, '-created_date', 1000)),
    ]);
    const memberOf = (asMember ?? []).filter((g: any) => isMemberOf(g, userId));
    const owned = (asOwner ?? []).filter((g: any) => g?.ownerId === userId);
    // Owners are always members too, so every owned group must show up in the member answer.
    const consistent = memberOf.length > 0 && owned.every((g: any) => memberOf.some((m: any) => m.id === g.id));
    if (consistent) {
      const byId = new Map<string, any>();
      [...memberOf, ...owned].forEach((g: any) => byId.set(g.id, g));
      return [...byId.values()].sort((a, b) => timeOf(b) - timeOf(a));
    }
  } catch {
    /* fall back below */
  }
  const all = await readWithRetry(() => db.Group.filter({}, '-created_date', 1000));
  return (all ?? []).filter((g: any) => isMemberOf(g, userId));
}

// The same public profile fields the app has always received for friends and group members.
const publicProfile = (u: any, wallet: any) => ({
  id: u.id,
  full_name: u.full_name,
  displayName: u.displayName,
  email: u.email,
  spendableXp: wallet?.spendableXp ?? 0,
  avatarType: u.avatarType,
  avatarPhotoUrl: u.avatarPhotoUrl,
  avatarEmoji: u.avatarEmoji,
  avatarDefaultId: u.avatarDefaultId,
  cheersSent: u.cheersSent ?? 0,
  cheerRecipients: u.cheerRecipients ?? 0,
  challengeAttempts: u.challengeAttempts ?? 0,
  challengePerfects: u.challengePerfects ?? 0,
  statsSharedCount: u.statsSharedCount ?? 0,
  statsReceivedCount: u.statsReceivedCount ?? 0,
});

export async function handleGetFriendsPage(base44: any, user: any) {
  const db = base44.asServiceRole.entities;
  const me = user.id;

  const [sent, received, pending, groups] = await Promise.all([
    readWithRetry(() => db.Friendship.filter({ user1Id: me, status: 'accepted' })),
    readWithRetry(() => db.Friendship.filter({ user2Id: me, status: 'accepted' })),
    readWithRetry(() => db.Friendship.filter({ user2Id: me, status: 'pending' })),
    groupsOf(db, me),
  ]);

  const friendIds = [...new Set<string>([...sent, ...received].map((f: any) => (f.user1Id === me ? f.user2Id : f.user1Id)).filter(Boolean))];
  const groupMemberIds = groups.flatMap((g: any) => [g.ownerId, ...(g.memberIds ?? [])]);
  const socialIds = [...new Set<string>([...friendIds, ...groupMemberIds])].filter((id) => id && id !== me);
  const requesterIds = pending.map((f: any) => f.requestedById).filter(Boolean);
  const profileIds = [...new Set<string>([me, ...socialIds, ...requesterIds])];
  const friendSet = new Set(friendIds);

  // Profiles and wallets for everyone shown; reading for you and your circle.
  const readerIds = socialIds.length ? [me, ...socialIds] : [];
  const [users, wallets, logLists] = await Promise.all([
    rowsWhereIn(db, 'User', 'id', profileIds),
    rowsWhereIn(db, 'UserWallet', 'userId', profileIds),
    runLimited(readerIds.map((id) => () => readWithRetry(() => db.ReadingLog.filter(
      { userId: id }, '-created_date', friendSet.has(id) ? STREAK_LOGS_PER_FRIEND : FEED_LOGS_PER_PERSON,
    ))), PARALLEL),
  ]);

  // As before: newest accounts first, and the oldest wallet when someone has more than one.
  const walletByUser: Record<string, any> = {};
  [...wallets].sort((a, b) => timeOf(b) - timeOf(a)).forEach((w: any) => { walletByUser[w.userId] = w; });
  const profiles = [...users].sort((a, b) => timeOf(b) - timeOf(a)).map((u: any) => publicProfile(u, walletByUser[u.id]));
  const profileById = Object.fromEntries(profiles.map((p) => [p.id, p]));

  const logs: any[] = [];
  const readDays: Record<string, string[]> = {};
  readerIds.forEach((id, i) => {
    const list = logLists[i] ?? [];
    logs.push(...list.slice(0, FEED_LOGS_PER_PERSON));
    if (friendSet.has(id)) readDays[id] = [...new Set<string>(list.map((l: any) => l.dateKey).filter(Boolean))];
  });

  const inOrder = (ids: Set<string>) => profiles.filter((p) => ids.has(p.id));
  return {
    status: 200,
    body: {
      friends: inOrder(friendSet),
      pending,
      pendingUsers: Object.fromEntries(requesterIds.filter((id: string) => profileById[id]).map((id: string) => [id, profileById[id]])),
      groups,
      // Everyone in the activity feed (you, friends and group members), newest accounts first.
      people: socialIds.length ? inOrder(new Set([me, ...socialIds])) : [],
      logs,
      readDays,
    },
  };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { status, body } = await handleGetFriendsPage(base44, user);
    return Response.json(body, { status });
  } catch (err) {
    console.error('[getFriendsPage] Error:', (err as Error)?.message);
    return Response.json({ error: 'Could not load your friends' }, { status: 500 });
  }
});
