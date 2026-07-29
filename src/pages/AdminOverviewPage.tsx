import { PlatformStatsCards } from '@/features/admin/components/PlatformStatsCards'

export function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          A snapshot of who's on RentIT Masvingo right now.
        </p>
      </div>
      <PlatformStatsCards />
    </div>
  )
}
