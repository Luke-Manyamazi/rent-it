import { CalendarClock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBookingsForTenant } from '@/features/booking/api/bookings'
import { BookingCard } from '@/features/booking/components/BookingCard'

export function TenantBookingsPage() {
  const { firebaseUser } = useAuth()
  const { bookings, loading } = useBookingsForTenant(firebaseUser?.uid)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Your bookings</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Viewing requests you've made.
      </p>

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
            <CalendarClock className="size-5" />
          </span>
          <p className="font-medium">No bookings yet</p>
          <p className="text-muted-foreground max-w-xs text-sm">
            Request a viewing from any listing to see it here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} viewAs="tenant" />
          ))}
        </div>
      )}
    </div>
  )
}
