import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ONESIGNAL_APP_ID = '44cb7eb8-7aca-44c1-b180-40e871493808';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (user?.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

  const apiKey = Deno.env.get('ONESIGNAL_API_KEY');
  if (!apiKey) return Response.json({ error: 'OneSignal API key not configured' }, { status: 500 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { userIds, title, message, data } = body;
  if (!userIds || !Array.isArray(userIds) || !message) {
    return Response.json({ error: 'userIds (array) and message are required' }, { status: 400 });
  }

  const payload = {
    app_id: ONESIGNAL_APP_ID,
    include_external_user_ids: userIds,
    channel_for_external_user_ids: 'push',
    headings: { en: title || 'Bible Built' },
    contents: { en: message },
    ...(data ? { data } : {}),
  };

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok) {
    console.error('[sendPushNotification] OneSignal error:', result);
    return Response.json({ error: 'Failed to send notification', details: result }, { status: 500 });
  }

  return Response.json({ success: true, sent: userIds.length, result });
});
