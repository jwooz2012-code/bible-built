import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { receiverId, book, chapter } = body;

    if (!receiverId) return Response.json({ error: 'receiverId is required' }, { status: 400 });
    if (receiverId === user.id) return Response.json({ error: 'Cannot high five yourself' }, { status: 400 });

    // Fetch full user profile to get display name reliably
    const senderUsers = await base44.asServiceRole.entities.User.filter({ id: user.id });
    const senderProfile = senderUsers[0];
    const senderName = senderProfile?.full_name || senderProfile?.displayName || user.full_name || user.email?.split('@')[0] || 'Someone';
    const chapterText = book && chapter ? ` for reading ${book} ${chapter}` : '';
    const message = `${senderName} gave you a high five 🙌${chapterText}!`;

    await base44.asServiceRole.entities.Notification.create({
      userId: receiverId,
      type: 'high_five',
      message,
      relatedId: user.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});