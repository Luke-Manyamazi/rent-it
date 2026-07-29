import { toast } from 'sonner'
import { Building2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { VerificationStatusSelect } from '@/features/admin/components/VerificationStatusSelect'
import { SuspendDialog } from '@/features/admin/components/SuspendDialog'
import { AdjustTrustScoreDialog } from '@/features/admin/components/AdjustTrustScoreDialog'
import { setAgencySuspension, setAgencyVerificationStatus } from '@/features/admin/api/agencies'
import type { Agency } from '@/types/agency'

export function AgenciesTable({ agencies }: { agencies: Agency[] }) {
  if (agencies.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No agencies yet.</p>
  }

  async function onUnsuspend(agencyId: string) {
    try {
      await setAgencySuspension(agencyId, false, null)
      toast.success('Agency unsuspended.')
    } catch {
      toast.error("Couldn't unsuspend that agency.")
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agency</TableHead>
            <TableHead>Listings</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Trust score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agencies.map((agency) => (
            <TableRow key={agency.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-8 rounded-md">
                    <AvatarImage src={agency.logoUrl ?? undefined} alt={agency.name} />
                    <AvatarFallback className="rounded-md">
                      <Building2 className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{agency.name}</span>
                </div>
              </TableCell>
              <TableCell>{agency.activeListingCount}</TableCell>
              <TableCell>
                <VerificationStatusSelect
                  value={agency.verificationStatus}
                  onChange={(status) => setAgencyVerificationStatus(agency.id, status)}
                />
              </TableCell>
              <TableCell>{agency.trustScore}</TableCell>
              <TableCell>
                {agency.isSuspended ? (
                  <Badge variant="destructive">Suspended</Badge>
                ) : (
                  <Badge variant="secondary">Active</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <AdjustTrustScoreDialog
                    ownerType="agency"
                    ownerId={agency.id}
                    ownerName={agency.name}
                  />
                  {agency.isSuspended ? (
                    <Button variant="outline" size="sm" onClick={() => onUnsuspend(agency.id)}>
                      Unsuspend
                    </Button>
                  ) : (
                    <SuspendDialog
                      targetName={agency.name}
                      onSuspend={(reason) => setAgencySuspension(agency.id, true, reason)}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
