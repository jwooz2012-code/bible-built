import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const logs = await base44.asServiceRole.entities.ReadingLog.list('-dateKey', 10000);
    const targetDate = '2026-03-25';
    const yesterday = logs.filter(log => log.dateKey === targetDate);

    return Response.json({
      totalChapters: yesterday.length,
      date: targetDate,
      sampleDates: [...new Set(logs.slice(0, 20).map(l => l.dateKey))]
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});