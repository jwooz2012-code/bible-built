import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const groups = await base44.asServiceRole.entities.Group.list();
    const allLogs = await base44.asServiceRole.entities.ReadingLog.list('-created_date', 5000);
    const allUsers = await base44.asServiceRole.entities.User.list();
    const userMap = {};
    allUsers.forEach(u => { userMap[u.id] = u; });

    const weekLogs = allLogs.filter(l => new Date(l.created_date) >= weekStart);

    for (const group of groups) {
      const memberIds = group.memberIds ?? [];
      if (memberIds.length === 0) continue;

      const memberLogs = weekLogs.filter(l => memberIds.includes(l.userId));
      const totalChapters = new Set(memberLogs.map(l => `${l.userId}-${l.chapterId}`)).size;

      // Find MVP by XP
      const xpMap = {};
      memberIds.forEach(id => { xpMap[id] = userMap[id]?.xp ?? 0; });
      const mvpId = memberIds.reduce((best, id) => (xpMap[id] > (xpMap[best] ?? 0) ? id : best), memberIds[0]);
      const mvpName = userMap[mvpId]?.full_name ?? userMap[mvpId]?.displayName ?? 'A member';
      const mvpXp = xpMap[mvpId] ?? 0;

      const message = `Amazing week, ${group.name}! Together you read ${totalChapters} chapters. ${mvpName} was the MVP with ${mvpXp.toLocaleString()} XP! 🏆`;

      // Notify all members
      await Promise.all(memberIds.map(userId =>
        base44.asServiceRole.entities.Notification.create({
          userId,
          type: 'league_promotion',
          message,
          isRead: false,
          relatedId: group.id,
          createdAt: new Date().toISOString(),
        })
      ));
    }

    return Response.json({ success: true, groupsProcessed: groups.length });
  } catch (err) {
    console.error('[generateWeeklyGroupRecap] Error:', err?.message);
    return Response.json({ error: err?.message }, { status: 500 });
  }
});