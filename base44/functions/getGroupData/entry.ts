import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Everything the group page needs in one call: the group, its members (with XP), and
// their reading history. Only the group's own members are looked up; nothing app-wide
// is downloaded, so opening a group stays quick however large the app grows.

const LOGS_PER_MEMBER = 2000;
const PARALLEL = 8; // lookups in flight at once, to stay under Base44's rate limit

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

// A member can have more than one wallet from older versions; the one with the most XP counts.
const xpOf = (w: any) => Math.max(w?.xpBalance || 0, w?.spendableXp || 0, w?.progressXpTotal || 0);

export async function handleGetGroupData(base44: any, _user: any, body: any) {
  const db = base44.asServiceRole.entities;
  const groupId = body?.groupId;
  if (!groupId) return { status: 400, body: { error: 'groupId required' } };

  const [group] = await readWithRetry(() => db.Group.filter({ id: groupId }));
  if (!group) return { status: 404, body: { error: 'Group not found' } };

  const memberIds: string[] = [...new Set<string>((group.memberIds ?? []).filter((id: unknown) => typeof id === 'string' && id))];
  if (memberIds.length === 0) return { status: 200, body: { group, members: [], logs: [], graceDays: [] } };

  // Per member: their profile, their wallet(s), and their reading history.
  const perMember = await runLimited(memberIds.flatMap((id) => [
    () => readWithRetry(() => db.User.filter({ id })),
    () => readWithRetry(() => db.UserWallet.filter({ userId: id })),
    () => readWithRetry(() => db.ReadingLog.filter({ userId: id }, '-created_date', LOGS_PER_MEMBER)),
  ]), PARALLEL);

  const members: any[] = [];
  const logs: any[] = [];
  memberIds.forEach((id, i) => {
    const [userRows, walletRows, memberLogs] = perMember.slice(i * 3, i * 3 + 3) as any[][];
    logs.push(...(memberLogs ?? []));
    const u = (userRows ?? []).find((row: any) => row.id === id);
    if (!u) return; // account no longer exists
    const best = (walletRows ?? []).reduce((top: any, w: any) => (!top || xpOf(w) > xpOf(top) ? w : top), null);
    members.push({
      id: u.id,
      full_name: u.full_name,
      displayName: u.displayName,
      email: u.email,
      xpBalance: xpOf(best ?? {}),
      avatarType: u.avatarType,
      avatarPhotoUrl: u.avatarPhotoUrl,
      avatarEmoji: u.avatarEmoji,
      avatarDefaultId: u.avatarDefaultId,
      streak: u.streak,
    });
  });

  // graceDays stays in the reply for older app versions; the group page doesn't use it.
  return { status: 200, body: { group, members, logs, graceDays: [] } };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  try {
    const { status, body: out } = await handleGetGroupData(base44, user, body);
    return Response.json(out, { status });
  } catch (err) {
    console.error('[getGroupData] Error:', (err as Error)?.message);
    return Response.json({ error: 'Could not load the group' }, { status: 500 });
  }
});
