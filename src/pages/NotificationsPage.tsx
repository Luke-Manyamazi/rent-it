import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useNotifications, markAllNotificationsRead } from '@/features/notifications/api/notifications'
import { NotificationItem } from '@/features/notifications/components/NotificationItem'

export function NotificationsPage() {
  const { firebaseUser, profile } = useAuth()
  const { notifications, loading, unreadCount } = useNotifications(firebaseUser?.uid, 200)

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Bookings, messages, and updates about your account.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllNotificationsRead(notifications)}>
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="mt-6 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
            <Bell className="size-5" />
          </span>
          <p className="font-medium">No notifications yet</p>
          <p className="text-muted-foreground max-w-xs text-sm">
            Updates about your bookings and messages will show up here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-1">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} role={profile?.role} />
          ))}
        </div>
      )}
    </div>
  )
}
