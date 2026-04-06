import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const { targetUserId } = body;
  if (!targetUserId) return Response.json({ error: 'targetUserId is required' }, { status: 400 });
  if (targetUserId === user.id) return Response.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });

  try {
    // Check existing in both directions separately
    const [sent, received] = await Promise.all([
      base44.asServiceRole.entities.Friendship.filter({ user1Id: user.id, user2Id: targetUserId }),
      base44.asServiceRole.entities.Friendship.filter({ user1Id: targetUserId, user2Id: user.id }),
    ]);

    if (sent.length > 0 || received.length > 0) {
      return Response.json({ error: 'Friendship or request already exists' }, { status: 409 });
    }

    const friendship = await base44.asServiceRole.entities.Friendship.create({
      user1Id: user.id,
      user2Id: targetUserId,
      status: 'pending',
      requestedById: user.id,
    });

    return Response.json({ friendship });
  } catch (err) {
    console.error('[sendFriendRequest] Error:', err?.message, err);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});