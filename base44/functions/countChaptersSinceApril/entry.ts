import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Count by dateKey >= 2026-04-01
  let totalByDateKey = 0;
  let skip = 0;
  const limit = 1000;
  while (true) {
    const batch = await base44.asServiceRole.entities.ReadingLog.filter(
      { dateKey: { $gte: '2026-04-01' } },
      '-created_date',
      limit,
      skip
    );
    totalByDateKey += batch.length;
    if (batch.length < limit) break;
    skip += limit;
  }

  // Count by created_date >= 2026-04-01T00:00:00Z
  let totalByCreatedDate = 0;
  skip = 0;
  while (true) {
    const batch = await base44.asServiceRole.entities.ReadingLog.filter(
      { created_date: { $gte: '2026-04-01T00:00:00Z' } },
      '-created_date',
      limit,
      skip
    );
    totalByCreatedDate += batch.length;
    if (batch.length < limit) break;
    skip += limit;
  }

  return Response.json({ 
    totalByDateKey, 
    totalByCreatedDate,
    message: `dateKey filter: ${totalByDateKey} | created_date filter: ${totalByCreatedDate}`
  });
});