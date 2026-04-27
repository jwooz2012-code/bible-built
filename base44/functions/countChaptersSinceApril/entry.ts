import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Page through ALL ReadingLog records with dateKey >= 2026-04-01
  let total = 0;
  let skip = 0;
  const limit = 1000;
  const userCounts = {};
  const dateCounts = {};
  let sampleRecords = [];

  while (true) {
    const batch = await base44.asServiceRole.entities.ReadingLog.filter(
      { dateKey: { $gte: '2026-04-01' } },
      'dateKey',
      limit,
      skip
    );

    for (const record of batch) {
      total++;
      userCounts[record.userId] = (userCounts[record.userId] || 0) + 1;
      dateCounts[record.dateKey] = (dateCounts[record.dateKey] || 0) + 1;
      if (sampleRecords.length < 5) {
        sampleRecords.push({ userId: record.userId, book: record.book, chapter: record.chapter, dateKey: record.dateKey });
      }
    }

    if (batch.length < limit) break;
    skip += limit;
  }

  const uniqueUsers = Object.keys(userCounts).length;
  const avgPerUser = uniqueUsers > 0 ? (total / uniqueUsers).toFixed(1) : 0;
  const topUsers = Object.entries(userCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([uid, count]) => ({ userId: uid.slice(0, 8) + '...', count }));

  // Sort date counts
  const dailyBreakdown = Object.entries(dateCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));

  return Response.json({
    totalChapters: total,
    uniqueUsers,
    avgChaptersPerUser: avgPerUser,
    topUsers,
    sampleRecords,
    dailyBreakdown
  });
});