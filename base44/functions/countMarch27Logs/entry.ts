import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all logs for the suspected user to see what dateKeys they have
    const userLogs = await base44.asServiceRole.entities.ReadingLog.filter(
      { userId: '6960418eca6a62a7aea07f93' },
      '-created_date',
      100
    );

    // Count by dateKey
    const byDateKey = {};
    for (const log of userLogs) {
      const dk = log.dateKey || 'unknown';
      byDateKey[dk] = (byDateKey[dk] || 0) + 1;
    }

    // Also count ALL march 27 logs across all users
    const allMarch27 = await base44.asServiceRole.entities.ReadingLog.filter(
      { dateKey: '2026-03-27' },
      '-created_date',
      10000
    );

    const byUser = {};
    for (const log of allMarch27) {
      byUser[log.userId] = (byUser[log.userId] || 0) + 1;
    }

    return Response.json({
      userLogCount: userLogs.length,
      userLogsByDateKey: byDateKey,
      march27TotalCount: allMarch27.length,
      march27ByUser: byUser
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});