import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAgency } from '@/features/agency/hooks/useAgency'
import { useAgencyMembers } from '@/features/agency/hooks/useAgencyMembers'
import { useAgencyInvites } from '@/features/agency/api/invites'
import { MembersList } from '@/features/agency/components/MembersList'
import { PendingInvitesList } from '@/features/agency/components/PendingInvitesList'
import { InviteMemberDialog } from '@/features/agency/components/InviteMemberDialog'

export function AgencyTeamPage() {
  const { firebaseUser, profile } = useAuth()
  const agencyId = profile?.agencyId ?? undefined
  const { agency, loading: agencyLoading } = useAgency(agencyId)
  const { members, loading: membersLoading } = useAgencyMembers(agencyId)
  const { invites } = useAgencyInvites(agencyId)

  const isOwner = !!agency && !!firebaseUser && agency.ownerId === firebaseUser.uid
  const loading = agencyLoading || membersLoading

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Everyone with access to {agency?.name ?? 'your agency'}'s account.
          </p>
        </div>
        {isOwner && agencyId && firebaseUser && (
          <InviteMemberDialog agencyId={agencyId} invitedByUid={firebaseUser.uid} />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <MembersList members={members} canManage={isOwner} />
          )}
          {isOwner && <PendingInvitesList invites={invites} />}
        </CardContent>
      </Card>
    </div>
  )
}
