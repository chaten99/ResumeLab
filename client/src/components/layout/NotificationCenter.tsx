import React from "react";
import { Bell, CheckCheck, Trash2, Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useUserNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "@/features/user/hooks/useUser";

export const NotificationCenter: React.FC = () => {
  const { data: notifData, isLoading } = useUserNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteNotifMutation = useDeleteNotification();

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotifMutation.mutate(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="size-4 text-amber-500 shrink-0" />;
      case "error":
        return <XCircle className="size-4 text-rose-500 shrink-0" />;
      default:
        return <Info className="size-4 text-primary shrink-0" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger
        className="relative size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors outline-none cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[9px] bg-primary text-primary-foreground font-bold rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 sm:w-96 p-0 font-sans shadow-lg border-border">
        <div className="p-3 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30 font-bold px-1.5 py-0">
                {unreadCount} Unread
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
              className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground gap-1"
            >
              <CheckCheck className="size-3" /> Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-border/60 bg-card">
          {isLoading ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center space-y-1">
              <Bell className="size-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs font-semibold text-foreground">All caught up!</p>
              <p className="text-[11px] text-muted-foreground">No new notifications.</p>
            </div>
          ) : (
            notifications.map((n: any) => (
              <div
                key={n._id}
                onClick={() => !n.read && handleMarkRead(n._id)}
                className={`p-3 text-xs flex items-start gap-2.5 transition-colors cursor-pointer group ${
                  n.read ? "bg-card hover:bg-muted/40 opacity-75" : "bg-primary/5 hover:bg-primary/10"
                }`}
              >
                {getIcon(n.type)}
                <div className="flex-1 space-y-0.5 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-bold text-foreground truncate text-[11px]">{n.title}</p>
                    <span className="text-[9px] text-muted-foreground shrink-0">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug break-words">{n.message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDelete(n._id, e)}
                  className="size-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
