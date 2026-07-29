import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { updateFraudFlagStatus } from '@/features/admin/api/fraud-flags'
import type { FraudFlag, FraudFlagStatus } from '@/types/moderation'

const STATUS_VARIANT: Record<FraudFlagStatus, 'secondary' | 'default' | 'destructive'> = {
  open: 'destructive',
  reviewing: 'secondary',
  upheld: 'default',
  dismissed: 'secondary',
}

export function FraudFlagsList({ flags }: { flags: FraudFlag[] }) {
  const { firebaseUser } = useAuth()

  if (flags.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No fraud reports yet.
      </p>
    )
  }

  async function onUpdate(flagId: string, status: FraudFlagStatus) {
    if (!firebaseUser) return
    try {
      await updateFraudFlagStatus(flagId, status, firebaseUser.uid)
      toast.success('Report updated.')
    } catch {
      toast.error("Couldn't update that report.")
    }
  }

  return (
    <div className="divide-y">
      {flags.map((flag) => (
        <div key={flag.id} className="flex items-start justify-between gap-4 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_VARIANT[flag.status]} className="capitalize">
                {flag.status}
              </Badge>
              <span className="text-muted-foreground text-xs capitalize">
                {flag.targetType} · {flag.targetId}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-medium">{flag.reason}</p>
            {flag.description && (
              <p className="text-muted-foreground mt-0.5 text-sm">{flag.description}</p>
            )}
          </div>
          {flag.status !== 'upheld' && flag.status !== 'dismissed' && (
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdate(flag.id, 'upheld')}
              >
                Uphold
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdate(flag.id, 'dismissed')}
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
