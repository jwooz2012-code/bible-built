import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const allLogs = await base44.asServiceRole.entities.ReadingLog.list('-created_date', 10);
  const sample = allLogs.slice(0, 3);

  return Response.json({
    totalFetched: allLogs.length,
    sample,
  });
});