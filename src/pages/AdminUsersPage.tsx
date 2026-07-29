import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAllUsers } from '@/features/admin/api/users'
import { UsersTable } from '@/features/admin/components/UsersTable'

export function AdminUsersPage() {
  const { users, loading } = useAllUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage verification, trust scores, and suspensions.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <UsersTable users={users} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
