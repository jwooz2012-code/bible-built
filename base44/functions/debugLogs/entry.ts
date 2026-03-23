import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Try different approaches to read logs
  const byList = await base44.asServiceRole.entities.ReadingLog.list('-created_date', 5);
  const byFilter = await base44.asServiceRole.entities.ReadingLog.filter({}, '-created_date', 5);

  return Response.json({
    byListCount: byList.length,
    byFilterCount: byFilter.length,
    sampleByFilter: byFilter.slice(0, 2),
  });
});