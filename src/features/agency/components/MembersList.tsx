import { toast } from 'sonner'
import { Crown, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useUserPublicProfile } from '@/features/account/hooks/useUserPublicProfile'
import { removeAgencyMember } from '@/features/agency/api/members'
import type { AgencyMember } from '@/types/agency'

function MemberRow({
  member,
  canRemove,
}: {
  member: AgencyMember
  canRemove: boolean
}) {
  const { profile } = useUserPublicProfile(member.userId)
  const initials = profile?.fullName
    ?.split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')

  async function onRemove() {
    try {
      await removeAgencyMember(member.agencyId, member.userId)
      toast.success('Team member removed.')
    } catch {
      toast.error("Couldn't remove that team member.")
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarImage src={profile?.photoUrl ?? undefined} alt={profile?.fullName} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{profile?.fullName ?? 'Loading…'}</p>
          <p className="text-muted-foreground text-xs capitalize">{member.role}</p>
        </div>
      </div>
      {member.role === 'owner' ? (
        <Badge variant="secondary" className="gap-1">
          <Crown className="size-3" />
          Owner
        </Badge>
      ) : (
        canRemove && (
          <Button variant="ghost" size="icon-sm" onClick={onRemove} title="Remove from agency">
            <X className="size-4" />
          </Button>
        )
      )}
    </div>
  )
}

export function MembersList({
  members,
  canManage,
}: {
  members: AgencyMember[]
  canManage: boolean
}) {
  if (members.length === 0) {
    return <p className="text-muted-foreground py-6 text-center text-sm">No team members yet.</p>
  }

  return (
    <div className="divide-y">
      {members.map((member) => (
        <MemberRow key={member.userId} member={member} canRemove={canManage} />
      ))}
    </div>
  )
}
