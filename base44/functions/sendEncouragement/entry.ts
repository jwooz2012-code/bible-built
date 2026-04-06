import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { recipientId } = body;
  if (!recipientId) return Response.json({ error: 'recipientId is required' }, { status: 400 });

  try {
    const allUsers = await base44.asServiceRole.entities.User.filter({ id: recipientId });
    const recipient = allUsers[0];
    if (!recipient) return Response.json({ error: 'Recipient not found' }, { status: 404 });

    const senderName = user.full_name ?? user.displayName ?? 'Someone';
    const recipientEmail = recipient.email;

    if (recipientEmail) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: recipientEmail,
        subject: `${senderName} is cheering you on! 🙏`,
        body: `<p>Hey ${recipient.full_name ?? 'friend'},</p><p><strong>${senderName}</strong> just encouraged you to keep reading! 🙏</p><p>Keep up the amazing streak — your circle is rooting for you!</p>`
      });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('[sendEncouragement] Error:', err?.message);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});