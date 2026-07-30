import { Link } from 'react-router-dom'
import {
  CalendarClock,
  MessageCircle,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Bell,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { notificationLink } from '@/features/notifications/deep-link'
import { markNotificationRead } from '@/features/notifications/api/notifications'
import type { AppNotification } from '@/types/notification'
import type { UserRole } from '@/types/user'

const ICONS: Record<AppNotification['type'], LucideIcon> = {
  booking_request: CalendarClock,
  booking_confirmed: CalendarClock,
  booking_availability_confirmed: ShieldCheck,
  booking_auto_cancelled: CalendarClock,
  booking_cancelled: CalendarClock,
  booking_reminder: CalendarClock,
  new_message: MessageCircle,
  listing_verified: ShieldCheck,
  trust_score_changed: TrendingUp,
  subscription_expiring: AlertTriangle,
  admin_alert: AlertTriangle,
}

export function NotificationItem({
  notification,
  role,
  onNavigate,
}: {
  notification: AppNotification
  role: UserRole | undefined
  onNavigate?: () => void
}) {
  const Icon = ICONS[notification.type] ?? Bell

  function onClick() {
    if (!notification.isRead) markNotificationRead(notification.id)
    onNavigate?.()
  }

  return (
    <Link
      to={notificationLink(notification, role)}
      onClick={onClick}
      className={cn(
        'hover:bg-muted/50 flex items-start gap-3 rounded-lg px-3 py-2.5',
        !notification.isRead && 'bg-primary/5'
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
          notification.isRead ? 'bg-muted text-muted-foreground' : 'bg-brand/10 text-brand'
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm', !notification.isRead && 'font-medium')}>
          {notification.title}
        </p>
        <p className="text-muted-foreground truncate text-xs">{notification.body}</p>
        {notification.createdAt && (
          <p className="text-muted-foreground mt-0.5 text-[11px]">
            {notification.createdAt.toDate().toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
      {!notification.isRead && (
        <span className="bg-brand mt-1.5 size-2 shrink-0 rounded-full" />
      )}
    </Link>
  )
}
