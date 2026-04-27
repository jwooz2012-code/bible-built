import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  let total = 0;
  let skip = 0;
  const limit = 1000;

  while (true) {
    const batch = await base44.asServiceRole.entities.ReadingLog.filter(
      { dateKey: { $gte: '2026-04-01' } },
      '-created_date',
      limit,
      skip
    );
    total += batch.length;
    if (batch.length < limit) break;
    skip += limit;
  }

  return Response.json({ total, message: `Total chapters marked complete since April 1, 2026: ${total}` });
});