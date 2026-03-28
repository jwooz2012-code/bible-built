import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all march 27 logs (up to 10000)
    const raw = await base44.asServiceRole.entities.ReadingLog.filter(
      { dateKey: '2026-03-27' },
      '-created_date',
      10000
    );
    const allMarch27 = Array.isArray(raw) ? raw : Object.values(raw);

    // Inspect first few bad records
    const sample = allMarch27.filter(log => !log.userId || log.userId === 'undefined').slice(0, 3);
    const badIds = allMarch27
      .filter(log => !log.userId || log.userId === 'undefined')
      .map(log => log.id || log._id || log.record_id);

    // Skip delete for now — just inspect

    return Response.json({
      totalMarch27: allMarch27.length,
      badRecordsFound: badIds.length,
      sampleBadRecords: sample,
      sampleIds: badIds.slice(0, 5)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});