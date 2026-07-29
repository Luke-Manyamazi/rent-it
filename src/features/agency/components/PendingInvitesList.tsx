import { toast } from 'sonner'
import { Mail, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { revokeAgencyInvite } from '@/features/agency/api/invites'
import type { AgencyInvite } from '@/types/agency'

export function PendingInvitesList({ invites }: { invites: AgencyInvite[] }) {
  const pending = invites.filter((invite) => invite.status === 'pending')

  async function onRevoke(email: string) {
    try {
      await revokeAgencyInvite(email)
      toast.success('Invite revoked.')
    } catch {
      toast.error("Couldn't revoke that invite.")
    }
  }

  if (pending.length === 0) return null

  return (
    <div className="mt-4 space-y-2">
      <p className="text-muted-foreground text-xs font-medium">Pending invites</p>
      {pending.map((invite) => (
        <div
          key={invite.email}
          className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
        >
          <div className="flex items-center gap-2 text-sm">
            <Mail className="text-muted-foreground size-4" />
            {invite.email}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Pending</Badge>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onRevoke(invite.email)}
              title="Revoke invite"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
