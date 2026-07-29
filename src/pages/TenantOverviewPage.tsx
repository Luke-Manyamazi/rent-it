import { Link } from 'react-router-dom'
import { Heart, CalendarClock, MessageCircle, Search, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSavedProperties } from '@/features/tenant/api/saved-properties'
import { VerificationStatusCard } from '@/features/account/components/VerificationStatusCard'

export function TenantOverviewPage() {
  const { firebaseUser, profile } = useAuth()
  const { saved } = useSavedProperties(firebaseUser?.uid)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {profile?.fullName?.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Here's what's happening with your rental search.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-lg">
              <Heart className="size-4.5" />
            </span>
            <div>
              <p className="text-2xl font-semibold">{saved.length}</p>
              <p className="text-muted-foreground text-xs">Saved listings</p>
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
              <p className="text-muted-foreground text-xs">Upcoming viewings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-lg">
              <TrendingUp className="size-4.5" />
            </span>
            <div>
              <p className="text-2xl font-semibold">{profile?.trustScore ?? 0}</p>
              <p className="text-muted-foreground text-xs">Trust score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <Link to="/listings">
                  <Search className="size-5" />
                  Browse rentals
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <Link to="/dashboard/tenant/bookings">
                  <CalendarClock className="size-5" />
                  My bookings
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <Link to="/dashboard/tenant/messages">
                  <MessageCircle className="size-5" />
                  Messages
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <VerificationStatusCard />
      </div>
    </div>
  )
}
