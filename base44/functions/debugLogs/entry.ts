import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const result = await base44.asServiceRole.entities.ReadingLog.filter(
    { dateKey: '2026-03-27' },
    '-created_date',
    10
  );
  return Response.json({
    type: typeof result,
    isArray: Array.isArray(result),
    keys: result && typeof result === 'object' ? Object.keys(result) : null,
    raw: result
  });
});