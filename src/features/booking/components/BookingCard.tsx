import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CalendarClock, Check, Loader2, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useProperty } from '@/features/property/api/properties'
import { BookingStatusBadge } from '@/features/booking/components/BookingStatusBadge'
import {
  confirmAvailability,
  confirmBooking,
  cancelBookingByOwner,
  cancelBookingByTenant,
  completeBooking,
} from '@/features/booking/api/bookings'
import type { Booking } from '@/types/booking'

function DeclineDialog({ onDecline }: { onDecline: (reason: string) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit() {
    setSubmitting(true)
    try {
      await onDecline(reason.trim() || 'Not available')
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <X className="size-3.5" />
          Decline
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Decline this viewing request?</DialogTitle>
          <DialogDescription>Let the tenant know why, if you'd like.</DialogDescription>
        </DialogHeader>
        <Textarea
          rows={2}
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <DialogFooter>
          <Button variant="destructive" onClick={onSubmit} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Decline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function BookingCard({ booking, viewAs }: { booking: Booking; viewAs: 'tenant' | 'owner' }) {
  const { firebaseUser } = useAuth()
  const { property } = useProperty(booking.propertyId)
  const [busy, setBusy] = useState(false)
  // Lazy initializer is the one place it's safe to read the clock during
  // render; refreshed periodically via effect rather than read fresh on
  // every render (which React's purity rules disallow).
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const viewingTime = booking.proposedViewingTime.toDate()
  const deadline = booking.confirmationDeadline.toDate()
  const deadlinePassed = now > deadline.getTime()

  async function withBusy(action: () => Promise<void>, successMessage: string) {
    setBusy(true)
    try {
      await action()
      toast.success(successMessage)
    } catch {
      toast.error("Couldn't update this booking. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {property ? (
              <Link
                to={`/listings/${property.id}`}
                className="truncate font-medium hover:underline"
              >
                {property.title}
              </Link>
            ) : (
              <p className="text-muted-foreground text-sm">Loading listing…</p>
            )}
            <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-sm">
              <CalendarClock className="size-3.5" />
              {viewingTime.toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        {booking.tenantNote && (
          <p className="text-muted-foreground text-sm italic">"{booking.tenantNote}"</p>
        )}

        {booking.status === 'confirmed' && (
          <div className="border-verified/30 bg-verified/5 rounded-lg border p-3 text-sm">
            <p className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="text-verified size-4" />
              Verified Before You Travel
            </p>
            <p className="text-muted-foreground mt-1">
              {viewAs === 'owner'
                ? deadlinePassed
                  ? 'Confirmation window has passed — this may auto-cancel soon.'
                  : `Confirm availability by ${deadline.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}, or this booking auto-cancels.`
                : `Waiting for the owner to reconfirm availability before ${deadline.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.`}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {viewAs === 'owner' && booking.status === 'pending' && (
            <>
              <Button
                size="sm"
                disabled={busy}
                onClick={() => withBusy(() => confirmBooking(booking), 'Viewing confirmed.')}
              >
                <Check className="size-3.5" />
                Confirm
              </Button>
              <DeclineDialog
                onDecline={(reason) =>
                  withBusy(() => cancelBookingByOwner(booking, reason), 'Request declined.')
                }
              />
            </>
          )}

          {viewAs === 'owner' && booking.status === 'confirmed' && firebaseUser && (
            <Button
              size="sm"
              disabled={busy}
              onClick={() =>
                withBusy(
                  () => confirmAvailability(booking, firebaseUser.uid),
                  'Availability confirmed — tenant notified.'
                )
              }
            >
              <ShieldCheck className="size-3.5" />
              Confirm availability
            </Button>
          )}

          {viewAs === 'owner' && booking.status === 'availability_confirmed' && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => withBusy(() => completeBooking(booking.id), 'Marked as completed.')}
            >
              Mark as completed
            </Button>
          )}

          {viewAs === 'tenant' &&
            ['pending', 'confirmed', 'availability_confirmed'].includes(booking.status) && (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  withBusy(() => cancelBookingByTenant(booking), 'Booking cancelled.')
                }
              >
                Cancel
              </Button>
            )}
        </div>
      </CardContent>
    </Card>
  )
}
