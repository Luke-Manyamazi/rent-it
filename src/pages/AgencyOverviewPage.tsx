import { Link } from 'react-router-dom'
import { Home, CalendarClock, ShieldCheck, Users, PlusCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAgency } from '@/features/agency/hooks/useAgency'
import { useAgencyMembers } from '@/features/agency/hooks/useAgencyMembers'
import { useBookingsForOwner } from '@/features/booking/api/bookings'

const PENDING_BOOKING_STATUSES = ['pending', 'confirmed']

export function AgencyOverviewPage() {
  const { profile } = useAuth()
  const { agency } = useAgency(profile?.agencyId ?? undefined)
  const { members } = useAgencyMembers(profile?.agencyId ?? undefined)
  const { bookings } = useBookingsForOwner(profile?.agencyId ?? undefined)
  const pendingBookingCount = bookings.filter((b) => PENDING_BOOKING_STATUSES.includes(b.status)).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {agency?.name ?? 'Welcome'}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Here's an overview of your agency's activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-lg">
              <Home className="size-4.5" />
            </span>
            <div>
              <p className="text-2xl font-semibold">
                {agency?.activeListingCount ?? 0}
              </p>
              <p className="text-muted-foreground text-xs">Active listings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-lg">
              <CalendarClock className="size-4.5" />
            </span>
            <div>
              <p className="text-2xl font-semibold">{pendingBookingCount}</p>
              <p className="text-muted-foreground text-xs">Pending viewing requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-lg">
              <Users className="size-4.5" />
            </span>
            <div>
              <p className="text-2xl font-semibold">{members.length}</p>
              <p className="text-muted-foreground text-xs">Team members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-lg">
              <ShieldCheck className="size-4.5" />
            </span>
            <div>
              <p className="text-2xl font-semibold">{agency?.trustScore ?? 0}</p>
              <p className="text-muted-foreground text-xs">Trust score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
            <Link to="/dashboard/agency/properties">
              <PlusCircle className="size-5" />
              List a property
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
            <Link to="/dashboard/agency/bookings">
              <CalendarClock className="size-5" />
              View bookings
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
            <Link to="/dashboard/agency/team">
              <Users className="size-5" />
              Manage team
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
            <Link to="/dashboard/agency/trust-score">
              <ShieldCheck className="size-5" />
              Trust score
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
