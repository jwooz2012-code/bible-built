import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const logs = await base44.asServiceRole.entities.ReadingLog.list('-dateKey', 10000);
    const yesterday = logs.filter(log => log.dateKey === '2026-03-23');
    
    return Response.json({ 
      totalChapters: yesterday.length,
      date: '2026-03-23',
      sampleDates: logs.slice(0, 10).map(l => l.dateKey)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});