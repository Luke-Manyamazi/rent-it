import { toast } from 'sonner'
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
import { setUserSuspension, setUserVerificationStatus } from '@/features/admin/api/users'
import type { UserProfile } from '@/types/user'

export function UsersTable({ users }: { users: UserProfile[] }) {
  if (users.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No users yet.</p>
  }

  async function onUnsuspend(uid: string) {
    try {
      await setUserSuspension(uid, false, null)
      toast.success('User unsuspended.')
    } catch {
      toast.error("Couldn't unsuspend that user.")
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Trust score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const initials = user.fullName
              ?.split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8">
                      <AvatarImage src={user.photoUrl ?? undefined} alt={user.fullName} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.fullName}</span>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell>
                  <VerificationStatusSelect
                    value={user.verificationStatus}
                    onChange={(status) => setUserVerificationStatus(user.id, status)}
                  />
                </TableCell>
                <TableCell>{user.trustScore}</TableCell>
                <TableCell>
                  {user.isSuspended ? (
                    <Badge variant="destructive">Suspended</Badge>
                  ) : (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {user.role === 'landlord' && (
                      <AdjustTrustScoreDialog
                        ownerType="landlord"
                        ownerId={user.id}
                        ownerName={user.fullName}
                      />
                    )}
                    {user.isSuspended ? (
                      <Button variant="outline" size="sm" onClick={() => onUnsuspend(user.id)}>
                        Unsuspend
                      </Button>
                    ) : (
                      <SuspendDialog
                        targetName={user.fullName}
                        onSuspend={(reason) => setUserSuspension(user.id, true, reason)}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
