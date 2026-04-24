import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { receiverId } = body;
  if (!receiverId) return Response.json({ error: 'receiverId is required' }, { status: 400 });

  try {
    const senderName = user.full_name ?? user.displayName ?? 'Someone';
    await base44.asServiceRole.entities.Notification.create({
      userId: receiverId,
      type: 'nudge',
      message: `${senderName} sent you encouragement to keep reading! 🙏`,
      isRead: false,
      relatedId: user.id,
      createdAt: new Date().toISOString(),
    });
    return Response.json({ success: true });
  } catch (err) {
    console.error('[sendNudge] Error:', err?.message);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});