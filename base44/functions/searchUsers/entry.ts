import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { query } = body;
  if (!query?.trim()) return Response.json({ users: [] });

  try {
    const allUsers = await base44.asServiceRole.entities.User.list();
    const q = query.trim().toLowerCase();
    const results = allUsers
      .filter(u => u.id !== user.id)
      .filter(u => {
        const fullName = (u.full_name ?? '').toLowerCase();
        const displayName = (u.displayName ?? '').toLowerCase();
        const email = (u.email ?? '').toLowerCase();
        return fullName.includes(q) || displayName.includes(q) || email.includes(q);
      })
      .slice(0, 10)
      .map(u => ({ id: u.id, full_name: u.full_name, displayName: u.displayName, email: u.email }));

    return Response.json({ users: results });
  } catch (err) {
    console.error('[searchUsers] Error:', err?.message);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});