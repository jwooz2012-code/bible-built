import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useNotifications } from './useNotifications';
import NotificationsSheet from './NotificationsSheet';

export default function NotificationsBell({ defaultOpen = false, onChange }) {
  const { user } = useAuth();
  const { notifications, unreadCount, refetch, markRead, markAllRead, remove, patch } = useNotifications(user?.id);
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => { if (defaultOpen) setOpen(true); }, [defaultOpen]);

  return (
    <>
      <button
        onClick={() => { setOpen(true); refetch(); }}
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        className="relative h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
      >
        <Bell className="w-6 h-6 text-foreground" />
        {unreadCount > 0 && (
          <span
            className="absolute top-0 right-0 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: '#EF4444', boxShadow: '0 0 0 2px hsl(var(--background))' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <NotificationsSheet
        open={open}
        onClose={() => setOpen(false)}
        notifications={notifications}
        markRead={markRead}
        markAllRead={markAllRead}
        remove={remove}
        patch={patch}
        onChange={onChange}
      />
    </>
  );
}
