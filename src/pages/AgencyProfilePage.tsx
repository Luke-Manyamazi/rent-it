import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAgency } from '@/features/agency/hooks/useAgency'
import { AgencyLogoUploader } from '@/features/agency/components/AgencyLogoUploader'
import { AgencyProfileForm } from '@/features/agency/components/AgencyProfileForm'
import { AgencyVerificationCard } from '@/features/agency/components/AgencyVerificationCard'

export function AgencyProfilePage() {
  const { firebaseUser, profile } = useAuth()
  const { agency, loading } = useAgency(profile?.agencyId ?? undefined)

  if (loading || !agency) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const isOwner = firebaseUser?.uid === agency.ownerId

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Agency profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isOwner
            ? 'How your agency appears to tenants.'
            : 'Only the agency owner can edit these details.'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agency details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isOwner && <AgencyLogoUploader agency={agency} />}
              <AgencyProfileForm agency={agency} readOnly={!isOwner} />
            </CardContent>
          </Card>
        </div>

        <AgencyVerificationCard status={agency.verificationStatus} />
      </div>
    </div>
  )
}
