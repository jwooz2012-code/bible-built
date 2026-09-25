import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BOOK_CHAPTERS: Record<string, number> = {"Genesis":50,"Exodus":40,"Leviticus":27,"Numbers":36,"Deuteronomy":34,"Joshua":24,"Judges":21,"Ruth":4,"1 Samuel":31,"2 Samuel":24,"1 Kings":22,"2 Kings":25,"1 Chronicles":29,"2 Chronicles":36,"Ezra":10,"Nehemiah":13,"Esther":10,"Job":42,"Psalms":150,"Proverbs":31,"Ecclesiastes":12,"Song of Solomon":8,"Isaiah":66,"Jeremiah":52,"Lamentations":5,"Ezekiel":48,"Daniel":12,"Hosea":14,"Joel":3,"Amos":9,"Obadiah":1,"Jonah":4,"Micah":7,"Nahum":3,"Habakkuk":3,"Zephaniah":3,"Haggai":2,"Zechariah":14,"Malachi":4,"Matthew":28,"Mark":16,"Luke":24,"John":21,"Acts":28,"Romans":16,"1 Corinthians":16,"2 Corinthians":13,"Galatians":6,"Ephesians":6,"Philippians":4,"Colossians":4,"1 Thessalonians":5,"2 Thessalonians":3,"1 Timothy":6,"2 Timothy":4,"Titus":3,"Philemon":1,"Hebrews":13,"James":5,"1 Peter":5,"2 Peter":3,"1 John":5,"2 John":1,"3 John":1,"Jude":1,"Revelation":22};
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function shiftDate(key: string, days: number) {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// The most recent full Sunday–Saturday week before today.
export function lastFullWeek(todayKey: string) {
  const day = new Date(`${todayKey}T12:00:00Z`).getUTCDay();
  const weekEnd = shiftDate(todayKey, -(day + 1));
  return { weekStart: shiftDate(weekEnd, -6), weekEnd };
}

// Every time a reader completes all chapters of a book (first time or a reread).
export function bookCompletions(logs: any[]) {
  const sorted = [...logs].sort((a, b) => new Date(a.created_date ?? a.timestamp).getTime() - new Date(b.created_date ?? b.timestamp).getTime());
  const seen = new Map<string, Set<number>>();
  const events: { book: string; dateKey: string }[] = [];
  for (const l of sorted) {
    const total = BOOK_CHAPTERS[l.book];
    if (!total) continue;
    const set = seen.get(l.book) ?? new Set<number>();
    set.add(l.chapter);
    if (set.size >= total) { events.push({ book: l.book, dateKey: l.dateKey }); seen.set(l.book, new Set()); }
    else seen.set(l.book, set);
  }
  return events;
}

const nameOf = (u: any) => u?.displayName || u?.full_name || 'A member';

export async function handleWeeklyRecap(base44: any, _user: any, body: any) {
  const db = base44.asServiceRole;
  const todayKey = DATE_RE.test(body?.todayKey ?? '') ? body.todayKey : new Date().toISOString().slice(0, 10);
  const { weekStart, weekEnd } = DATE_RE.test(body?.weekEnd ?? '')
    ? { weekStart: shiftDate(body.weekEnd, -6), weekEnd: body.weekEnd }
    : lastFullWeek(todayKey);
  const inWeek = (k?: string) => !!k && k >= weekStart && k <= weekEnd;

  const groups = await db.entities.Group.list('-created_date', 1000);
  let sent = 0;
  let processed = 0;

  for (const group of groups) {
    const memberIds: string[] = [...new Set([group.ownerId, ...(group.memberIds ?? [])].filter(Boolean))];
    if (memberIds.length === 0) continue;

    const members = await Promise.all(memberIds.map(async (id) => {
      const [user] = await db.entities.User.filter({ id });
      const logs = await db.entities.ReadingLog.filter({ userId: id }, '-created_date', 2000);
      const cheers = await db.entities.Cheer.filter({ fromUserId: id }, '-created_date', 500);
      return { id, name: nameOf(user), logs, cheers };
    }));

    const stats = members.map((m) => {
      const weekLogs = m.logs.filter((l: any) => inWeek(l.dateKey));
      const cheersToGroup = m.cheers.filter((c: any) => memberIds.includes(c.toUserId) && inWeek(String(c.createdAt ?? c.created_date).slice(0, 10))).length;
      return {
        id: m.id,
        name: m.name,
        chapters: weekLogs.length,
        days: new Set(weekLogs.map((l: any) => l.dateKey)).size,
        cheers: cheersToGroup,
        books: bookCompletions(m.logs).filter((e) => inWeek(e.dateKey)).map((e) => e.book),
      };
    });

    const totalChapters = stats.reduce((n, s) => n + s.chapters, 0);
    if (totalChapters === 0) continue;
    processed += 1;

    const byChapters = [...stats].sort((a, b) => b.chapters - a.chapters);
    const byCheers = [...stats].sort((a, b) => b.cheers - a.cheers);
    const payload = {
      groupId: group.id,
      groupName: group.name,
      weekStart,
      weekEnd,
      memberCount: memberIds.length,
      totalChapters,
      readers: stats.filter((s) => s.chapters > 0).length,
      topReader: { id: byChapters[0].id, name: byChapters[0].name, count: byChapters[0].chapters },
      topEncourager: byCheers[0].cheers > 0 ? { id: byCheers[0].id, name: byCheers[0].name, count: byCheers[0].cheers } : null,
      booksFinished: stats.flatMap((s) => s.books.map((book) => ({ id: s.id, name: s.name, book }))).slice(0, 6),
      everyDay: stats.filter((s) => s.days === 7).map((s) => ({ id: s.id, name: s.name })).slice(0, 8),
    };
    const message = `${group.name} read ${totalChapters} chapters together this week! ${payload.topReader.name} led the way with ${payload.topReader.count}. 🏆`;

    for (const userId of memberIds) {
      const existing = await db.entities.Notification.filter({ userId, type: 'weekly_recap', relatedId: group.id });
      if (existing.some((n: any) => n.payload?.weekEnd === weekEnd)) continue;
      await db.entities.Notification.create({
        userId,
        type: 'weekly_recap',
        message,
        relatedId: group.id,
        isRead: false,
        createdAt: new Date().toISOString(),
        payload,
      });
      sent += 1;
    }
  }

  return { status: 200, body: { success: true, weekStart, weekEnd, groupsProcessed: processed, notificationsSent: sent } };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  try {
    const { status, body: out } = await handleWeeklyRecap(base44, user, body);
    return Response.json(out, { status });
  } catch (err) {
    console.error('[generateWeeklyGroupRecap] Error:', (err as Error)?.message);
    return Response.json({ error: (err as Error)?.message }, { status: 500 });
  }
});
