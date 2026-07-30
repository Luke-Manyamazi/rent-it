import type { UserRole } from '@/types/user'
import type { AppNotification } from '@/types/notification'

/** Where clicking a notification should navigate — depends on both the
 *  notification's type/data and the viewer's role, since e.g. a
 *  booking-related notification opens a different dashboard for a tenant
 *  vs. a landlord/agency. */
export function notificationLink(notification: AppNotification, role: UserRole | undefined): string {
  const bookingsPath =
    role === 'tenant' ? '/dashboard/tenant/bookings' : `/dashboard/${role ?? 'landlord'}/bookings`
  const messagesPath =
    role === 'tenant' ? '/dashboard/tenant/messages' : `/dashboard/${role ?? 'landlord'}/messages`

  switch (notification.type) {
    case 'booking_request':
    case 'booking_confirmed':
    case 'booking_availability_confirmed':
    case 'booking_auto_cancelled':
    case 'booking_cancelled':
    case 'booking_reminder':
      return bookingsPath
    case 'new_message':
      return notification.data.conversationId
        ? `${messagesPath}/${notification.data.conversationId}`
        : messagesPath
    case 'listing_verified':
      return notification.data.propertyId ? `/listings/${notification.data.propertyId}` : '/'
    case 'trust_score_changed':
      return role === 'agency' ? '/dashboard/agency/trust-score' : '/dashboard/landlord/trust-score'
    case 'subscription_expiring':
      return '/dashboard/agency/agency-profile'
    case 'admin_alert':
      return '/dashboard/admin'
    default:
      return '/'
  }
}
