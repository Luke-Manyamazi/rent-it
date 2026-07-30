import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useNotifications, markAllNotificationsRead } from '@/features/notifications/api/notifications'
import { NotificationItem } from '@/features/notifications/components/NotificationItem'

export function NotificationBell() {
  const { firebaseUser, profile } = useAuth()
  const { notifications, loading, unreadCount } = useNotifications(firebaseUser?.uid)
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="end">
        <div className="flex items-center justify-between px-1 py-1">
          <p className="text-sm font-medium">Notifications</p>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAllNotificationsRead(notifications)}
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="mt-1 max-h-96 space-y-0.5 overflow-y-auto">
          {loading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              You're all caught up.
            </p>
          ) : (
            notifications
              .slice(0, 8)
              .map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  role={profile?.role}
                  onNavigate={() => setOpen(false)}
                />
              ))
          )}
        </div>
        {notifications.length > 0 && profile && (
          <div className="mt-1 border-t pt-1">
            <Link
              to={`/dashboard/${profile.role}/notifications`}
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground block px-2 py-1.5 text-center text-xs"
            >
              View all
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
