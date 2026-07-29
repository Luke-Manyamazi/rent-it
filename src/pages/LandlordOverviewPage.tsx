import { Link } from 'react-router-dom'
import { Home, CalendarClock, ShieldCheck, PlusCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function LandlordOverviewPage() {
  const { profile } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {profile?.fullName?.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Here's an overview of your properties and bookings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-lg">
              <Home className="size-4.5" />
            </span>
            <div>
              <p className="text-2xl font-semibold">0</p>
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
              <p className="text-2xl font-semibold">0</p>
              <p className="text-muted-foreground text-xs">Pending viewing requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-lg">
              <ShieldCheck className="size-4.5" />
            </span>
            <div>
              <p className="text-2xl font-semibold">{profile?.trustScore ?? 0}</p>
              <p className="text-muted-foreground text-xs">Trust score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
            <Link to="/dashboard/landlord/properties">
              <PlusCircle className="size-5" />
              List a property
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
            <Link to="/dashboard/landlord/bookings">
              <CalendarClock className="size-5" />
              View bookings
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
            <Link to="/dashboard/landlord/trust-score">
              <ShieldCheck className="size-5" />
              Trust score
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
