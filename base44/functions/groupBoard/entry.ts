import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Group boards: reading takeaways and prayer requests inside a group.
// Posts are server-only data, so members only ever see what this function sends them
// (anonymous prayers never carry their author's details to anyone but the author).

export const BOARDS = ['takeaway', 'prayer'];
export const MAX_TEXT = 1000;
export const MAX_PASSAGE = 60;
export const DAILY_POSTS = 20;
const LIST_LIMIT = 100;
const DAY_MS = 24 * 60 * 60 * 1000;

const reply = (status: number, body: Record<string, unknown>) => ({ status, body });
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

// Writes are only repeated on 429 (rejected before anything was saved), so nothing is saved twice.
async function writeWithRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (statusOf(err) !== 429 || i >= tries - 1) throw err;
      await pause(i);
    }
  }
}

const isMember = (group: any, userId: string) => group?.ownerId === userId || (group?.memberIds ?? []).includes(userId);
const timeOf = (row: any) => new Date(row?.createdAt ?? row?.created_date ?? 0).getTime();

// Trim, cap blank lines, and enforce the length limit. Returns null when empty or too long.
export function cleanText(value: unknown) {
  if (typeof value !== 'string') return null;
  const text = value.replace(/\r\n?/g, '\n').replace(/[^\S\n]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!text || text.length > MAX_TEXT) return null;
  return text;
}

// Optional passage reference. Returns '' when not given, null when invalid.
export function cleanPassage(value: unknown) {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string') return null;
  const passage = value.replace(/\s+/g, ' ').trim();
  if (passage.length > MAX_PASSAGE) return null;
  return passage;
}

const publicProfile = (u: any) => u && ({
  id: u.id,
  displayName: u.displayName,
  full_name: u.full_name,
  avatarType: u.avatarType,
  avatarEmoji: u.avatarEmoji,
  avatarPhotoUrl: u.avatarPhotoUrl,
  avatarDefaultId: u.avatarDefaultId,
});

// What a member is allowed to see of a post.
export function present(post: any, meId: string, group: any, authors: Record<string, any>) {
  const mine = post.authorId === meId;
  const reactorIds: string[] = post.reactorIds ?? [];
  const hideAuthor = post.anonymous && !mine;
  return {
    id: post.id,
    board: post.board,
    text: post.text,
    passage: post.passage || '',
    anonymous: !!post.anonymous,
    answered: !!post.answered,
    answeredAt: post.answeredAt ?? null,
    createdAt: post.createdAt ?? post.created_date,
    editedAt: post.editedAt ?? null,
    count: reactorIds.length,
    reacted: reactorIds.includes(meId),
    mine,
    canDelete: mine || group?.ownerId === meId,
    author: hideAuthor ? null : publicProfile(authors[post.authorId]) ?? null,
  };
}

async function loadAuthors(db: any, ids: string[]) {
  const unique = [...new Set(ids)];
  const out: Record<string, any> = {};
  for (let i = 0; i < unique.length; i += 5) {
    const rows = await Promise.all(unique.slice(i, i + 5).map((id) => readWithRetry(() => db.entities.User.filter({ id }))));
    rows.forEach((list: any[]) => { if (list?.[0]) out[list[0].id] = list[0]; });
  }
  return out;
}

async function loadGroup(db: any, groupId: unknown) {
  if (!groupId || typeof groupId !== 'string') return null;
  const [group] = await readWithRetry(() => db.entities.Group.filter({ id: groupId }));
  return group ?? null;
}

// Loads a post and its group, and checks the caller is (still) a member of that group.
async function loadPostForMember(db: any, postId: unknown, userId: string): Promise<any> {
  if (!postId || typeof postId !== 'string') return { error: reply(400, { error: 'postId is required' }) };
  const [post] = await readWithRetry(() => db.entities.GroupPost.filter({ id: postId }));
  if (!post) return { error: reply(404, { error: 'Post not found' }) };
  const group = await loadGroup(db, post.groupId);
  if (!group || !isMember(group, userId)) return { error: reply(403, { error: 'Only group members can do that' }) };
  return { post, group };
}

async function presentOne(db: any, post: any, userId: string, group: any) {
  const authors = await loadAuthors(db, [post.authorId]);
  return present(post, userId, group, authors);
}

export async function handleGroupBoard(base44: any, user: any, body: any) {
  const db = base44.asServiceRole;
  const action = body?.action;

  if (action === 'list') {
    const { groupId, board } = body;
    if (!BOARDS.includes(board)) return reply(400, { error: 'Unknown board' });
    const group = await loadGroup(db, groupId);
    if (!group) return reply(404, { error: 'Group not found' });
    if (!isMember(group, user.id)) return reply(403, { error: 'Only group members can see this board' });
    const rows = await readWithRetry(() => db.entities.GroupPost.filter({ groupId: group.id, board }, '-created_date', LIST_LIMIT));
    const sorted = [...rows].sort((a: any, b: any) => timeOf(b) - timeOf(a));
    const authors = await loadAuthors(db, sorted.filter((p: any) => !p.anonymous || p.authorId === user.id).map((p: any) => p.authorId));
    return reply(200, { posts: sorted.map((p: any) => present(p, user.id, group, authors)) });
  }

  if (action === 'create') {
    const { groupId, board } = body;
    if (!BOARDS.includes(board)) return reply(400, { error: 'Unknown board' });
    const text = cleanText(body.text);
    if (text === null) return reply(400, { error: `Write something (up to ${MAX_TEXT} characters)` });
    const passage = cleanPassage(body.passage);
    if (passage === null) return reply(400, { error: 'Passage is too long' });
    const group = await loadGroup(db, groupId);
    if (!group) return reply(404, { error: 'Group not found' });
    if (!isMember(group, user.id)) return reply(403, { error: 'Only group members can post here' });

    const recent = await readWithRetry(() => db.entities.GroupPost.filter({ authorId: user.id }, '-created_date', DAILY_POSTS + 5));
    const since = Date.now() - DAY_MS;
    if (recent.filter((p: any) => timeOf(p) >= since).length >= DAILY_POSTS) {
      return reply(429, { error: 'Daily post limit reached' });
    }

    const now = new Date().toISOString();
    const post = await writeWithRetry(() => db.entities.GroupPost.create({
      groupId: group.id,
      authorId: user.id,
      board,
      text,
      passage,
      anonymous: board === 'prayer' && body.anonymous === true,
      answered: false,
      reactorIds: [],
      notifiedIds: [],
      createdAt: now,
    }));

    // Lets the Groups list show a "new" dot. The post is saved either way.
    try {
      await writeWithRetry(() => db.entities.Group.update(group.id, { boardActivity: { ...(group.boardActivity ?? {}), [board]: now } }));
    } catch (err) {
      console.error('[groupBoard] Could not mark board activity:', (err as Error)?.message);
    }

    return reply(200, { post: await presentOne(db, post, user.id, group) });
  }

  if (action === 'edit') {
    const found = await loadPostForMember(db, body.postId, user.id);
    if (found.error) return found.error;
    const { post, group } = found;
    if (post.authorId !== user.id) return reply(403, { error: 'Only the author can edit this' });
    const text = cleanText(body.text);
    if (text === null) return reply(400, { error: `Write something (up to ${MAX_TEXT} characters)` });
    const passage = body.passage === undefined ? (post.passage ?? '') : cleanPassage(body.passage);
    if (passage === null) return reply(400, { error: 'Passage is too long' });
    const changes = { text, passage, editedAt: new Date().toISOString() };
    await writeWithRetry(() => db.entities.GroupPost.update(post.id, changes));
    return reply(200, { post: await presentOne(db, { ...post, ...changes }, user.id, group) });
  }

  if (action === 'delete') {
    const found = await loadPostForMember(db, body.postId, user.id);
    if (found.error) return found.error;
    const { post, group } = found;
    if (post.authorId !== user.id && group.ownerId !== user.id) return reply(403, { error: 'Only the author or group owner can remove this' });
    await writeWithRetry(() => db.entities.GroupPost.delete(post.id));
    return reply(200, { deleted: post.id });
  }

  if (action === 'answered') {
    const found = await loadPostForMember(db, body.postId, user.id);
    if (found.error) return found.error;
    const { post, group } = found;
    if (post.board !== 'prayer') return reply(400, { error: 'Only prayer requests can be marked answered' });
    if (post.authorId !== user.id) return reply(403, { error: 'Only the author can mark this answered' });
    const answered = body.answered !== false;
    const changes = { answered, answeredAt: answered ? new Date().toISOString() : null };
    await writeWithRetry(() => db.entities.GroupPost.update(post.id, changes));
    return reply(200, { post: await presentOne(db, { ...post, ...changes }, user.id, group) });
  }

  if (action === 'react') {
    const found = await loadPostForMember(db, body.postId, user.id);
    if (found.error) return found.error;
    const { post, group } = found;
    const reactorIds: string[] = post.reactorIds ?? [];
    const adding = !reactorIds.includes(user.id);
    // The app sends what the tap meant, so a double tap or a retry can't undo itself.
    if (typeof body.on === 'boolean' && body.on !== adding) {
      return reply(200, { post: await presentOne(db, post, user.id, group) });
    }
    const nextReactors = adding ? [...reactorIds, user.id] : reactorIds.filter((id) => id !== user.id);

    // A prayer notifies its author and counts toward the Prayer Warrior badge once per person per post.
    const notifiedIds: string[] = post.notifiedIds ?? [];
    const firstPrayer = adding && post.board === 'prayer' && post.authorId !== user.id && !notifiedIds.includes(user.id);
    const changes: Record<string, unknown> = { reactorIds: nextReactors };
    if (firstPrayer) changes.notifiedIds = [...notifiedIds, user.id];
    await writeWithRetry(() => db.entities.GroupPost.update(post.id, changes));

    let prayersPrayed: number | undefined;
    if (firstPrayer) {
      const [me] = await readWithRetry(() => db.entities.User.filter({ id: user.id })).catch(() => []);
      prayersPrayed = (me?.prayersPrayed ?? 0) + 1;
      try {
        await writeWithRetry(() => db.entities.User.update(user.id, { prayersPrayed }));
      } catch (err) {
        console.error('[groupBoard] Could not update prayer count:', (err as Error)?.message);
        prayersPrayed = undefined;
      }
      const name = me?.displayName || me?.full_name || user.full_name || 'Someone';
      try {
        await writeWithRetry(() => db.entities.Notification.create({
          userId: post.authorId,
          type: 'group_prayer',
          message: `${name} prayed for your request in ${group.name} 🙏`,
          relatedId: group.id,
          isRead: false,
          createdAt: new Date().toISOString(),
          payload: { postId: post.id, board: 'prayer' },
        }));
      } catch (err) {
        console.error('[groupBoard] Could not create notification:', (err as Error)?.message);
      }
    }

    const presented = await presentOne(db, { ...post, ...changes }, user.id, group);
    return reply(200, { post: presented, ...(prayersPrayed !== undefined ? { prayersPrayed } : {}) });
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
    const { status, body: out } = await handleGroupBoard(base44, user, body);
    return Response.json(out, { status });
  } catch (err) {
    console.error('[groupBoard] Error:', (err as Error)?.message);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
});
