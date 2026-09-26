import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Only friends or members of a shared group can encourage each other.
async function areConnected(db: any, a: string, b: string) {
  const [ab, ba] = await Promise.all([
    db.entities.Friendship.filter({ user1Id: a, user2Id: b, status: 'accepted' }),
    db.entities.Friendship.filter({ user1Id: b, user2Id: a, status: 'accepted' }),
  ]);
  if (ab.length || ba.length) return true;
  const groups = await db.entities.Group.list('-created_date', 1000);
  const inGroup = (g: any, id: string) => g.ownerId === id || (g.memberIds ?? []).includes(id);
  return groups.some((g: any) => inGroup(g, a) && inGroup(g, b));
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { receiverId } = body;
  if (!receiverId) return Response.json({ error: 'receiverId is required' }, { status: 400 });
  if (receiverId === user.id) return Response.json({ error: 'Cannot nudge yourself' }, { status: 400 });

  try {
    if (!(await areConnected(base44.asServiceRole, user.id, receiverId))) {
      return Response.json({ error: 'You can only encourage friends and group members' }, { status: 403 });
    }
    // Fetch full user profile to get display name reliably
    const senderUsers = await base44.asServiceRole.entities.User.filter({ id: user.id });
    const senderProfile = senderUsers[0];
    const senderName = senderProfile?.full_name || senderProfile?.displayName || user.full_name || user.email?.split('@')[0] || 'Someone';
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