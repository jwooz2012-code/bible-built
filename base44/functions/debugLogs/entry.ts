import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get recent logs across all users, look at date distribution
    const logs = await base44.asServiceRole.entities.ReadingLog.list('-created_date', 200);
    
    const dateCounts = {};
    for (const log of logs) {
      dateCounts[log.dateKey] = (dateCounts[log.dateKey] || 0) + 1;
    }

    // Also check the requesting user's own logs
    const myLogs = await base44.entities.ReadingLog.list('-created_date', 50);
    const myDates = myLogs.map(l => ({ dateKey: l.dateKey, book: l.book, chapter: l.chapter, created_date: l.created_date }));

    return Response.json({ 
      recentDateDistribution: dateCounts,
      myRecentLogs: myDates,
      totalRecentLogs: logs.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});