import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch ALL logs across all users using service role
  const allLogs = await base44.asServiceRole.entities.ReadingLog.list('-created_date', 10000);

  // Count by dateKey
  const byDate = {};
  for (const log of allLogs) {
    const dk = log.dateKey || 'unknown';
    byDate[dk] = (byDate[dk] || 0) + 1;
  }

  // Sort dates descending
  const sortedDates = Object.entries(byDate)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 30);

  // Yesterday in Chicago time (UTC-5 or UTC-6 depending on DST)
  // March 28 2026 - CDT is UTC-5
  const nowUTC = new Date();
  const chicagoOffset = -5 * 60; // CDT
  const chicagoNow = new Date(nowUTC.getTime() + chicagoOffset * 60000);
  const yyyy = chicagoNow.getUTCFullYear();
  const mm = String(chicagoNow.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(chicagoNow.getUTCDate() - 1).padStart(2, '0');
  const yesterday = `${yyyy}-${mm}-${dd}`;

  const yesterdayCount = byDate[yesterday] || 0;
  const yesterdayLogs = allLogs.filter(l => l.dateKey === yesterday).map(l => ({
    userId: l.userId,
    book: l.book,
    chapter: l.chapter,
    dateKey: l.dateKey,
    created_date: l.created_date,
  }));

  return Response.json({
    totalLogsInDB: allLogs.length,
    yesterday,
    chaptersReadYesterday: yesterdayCount,
    yesterdayLogs,
    recentDates: sortedDates,
  });
});