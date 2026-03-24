import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const logs = await base44.asServiceRole.entities.ReadingLog.filter(
      { dateKey: '2026-03-23' },
      '-timestamp',
      10000
    );
    
    return Response.json({ 
      totalChapters: logs.length,
      date: '2026-03-23'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});