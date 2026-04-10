import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return Response.json({ error: 'Invalid code format' }, { status: 400 });
    }

    // Check if code exists and usage limit not reached (case-insensitive)
    const allCodes = await base44.asServiceRole.entities.EarlyAccessCode.list();
    const codeRecord = allCodes.filter(c => c.code.toUpperCase() === code.toUpperCase());

    if (codeRecord.length === 0) {
      return Response.json({ error: 'Code not found' }, { status: 404 });
    }

    const earlyAccessCode = codeRecord[0];
    const usageCount = earlyAccessCode.usageCount || 0;
    const usageLimit = earlyAccessCode.usageLimit || 10;

    if (usageCount >= usageLimit) {
      return Response.json({ error: 'Code usage limit reached' }, { status: 400 });
    }

    // Increment usage count
    await base44.asServiceRole.entities.EarlyAccessCode.update(earlyAccessCode.id, {
      usageCount: usageCount + 1
    });

    // Grant early access to user
    await base44.auth.updateMe({
      hasEarlyAccess: true
    });

    return Response.json({ success: true, message: 'Early access granted!' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});