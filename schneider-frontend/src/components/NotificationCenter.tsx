import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { useEcho } from '@/hooks/useEcho';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export const NotificationCenter = () => {
  const { notifications, unreadCount, addNotification, markAsRead, markAllAsRead } = useNotificationStore();
  const { user } = useAuthStore();
  const { echo } = useEcho();

  useEffect(() => {
    if (!user?.id) return;

    const channel = echo.private(`user.${user.id}`);

    channel.listen('.notification.created', (e: any) => {
      addNotification({
        title: e.notification.title,
        body: e.notification.body,
      });

      toast(e.notification.title, {
        description: e.notification.body,
      });
    });

    return () => {
      channel.stopListening('.notification.created');
      echo.leave(`user.${user.id}`);
    };
  }, [user?.id, echo, addNotification]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-0 text-xs text-primary hover:bg-transparent">
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-20" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`flex flex-col gap-1 p-4 transition-colors hover:bg-muted/50 cursor-pointer ${notif.isRead ? 'opacity-60' : 'bg-primary/5'}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{notif.title}</p>
                    {!notif.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{notif.body}</p>
                  <span className="text-xs text-muted-foreground/70">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
