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

    // Check if code exists and is unused
    const codeRecord = await base44.asServiceRole.entities.EarlyAccessCode.filter({
      code: code.toUpperCase()
    });

    if (codeRecord.length === 0) {
      return Response.json({ error: 'Code not found' }, { status: 404 });
    }

    const earlyAccessCode = codeRecord[0];

    if (earlyAccessCode.isUsed) {
      return Response.json({ error: 'Code already used' }, { status: 400 });
    }

    // Mark code as used
    await base44.asServiceRole.entities.EarlyAccessCode.update(earlyAccessCode.id, {
      isUsed: true,
      usedByUserId: user.id,
      usedAt: new Date().toISOString()
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