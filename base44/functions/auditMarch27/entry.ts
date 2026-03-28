import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch ALL logs using service role, sorted by created_date desc
  const allLogs = await base44.asServiceRole.entities.ReadingLog.list('-created_date', 5000);

  // Count by dateKey
  const byDate = {};
  for (const log of allLogs) {
    const dk = log.dateKey || 'unknown';
    byDate[dk] = (byDate[dk] || 0) + 1;
  }

  // Sort dates descending
  const sortedDates = Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0]));

  // Specifically pull March 27 logs
  const march27Logs = allLogs.filter(l => l.dateKey === '2026-03-27').map(l => ({
    id: l.id,
    userId: l.userId,
    book: l.book,
    chapter: l.chapter,
    dateKey: l.dateKey,
    timestamp: l.timestamp,
    created_date: l.created_date,
  }));

  // Also check logs created on March 27 UTC (regardless of dateKey)
  const createdOnMarch27 = allLogs.filter(l => {
    const d = new Date(l.created_date);
    return d.getUTCFullYear() === 2026 && d.getUTCMonth() === 2 && d.getUTCDate() === 27;
  }).map(l => ({
    id: l.id,
    userId: l.userId,
    book: l.book,
    chapter: l.chapter,
    dateKey: l.dateKey,
    timestamp: l.timestamp,
    created_date: l.created_date,
  }));

  return Response.json({
    totalLogs: allLogs.length,
    byDate: sortedDates.slice(0, 30),
    march27LogsByDateKey: march27Logs,
    march27LogsByCreatedDate: createdOnMarch27,
  });
});