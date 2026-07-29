import { ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { VerificationStatus } from '@/types/user'

const STATUS_LABEL: Record<VerificationStatus, string> = {
  unverified: 'Not started',
  pending: 'Under review',
  verified: 'Verified',
  rejected: 'Rejected',
}

const STATUS_HINT: Record<VerificationStatus, string> = {
  unverified:
    'Verified agencies get a trust badge on every listing. Document upload for verification is coming soon.',
  pending: "We're reviewing your agency's documents.",
  verified: 'Your agency displays a Verified badge to tenants.',
  rejected: 'Your verification request needs attention. Contact support for details.',
}

export function AgencyVerificationCard({ status }: { status: VerificationStatus }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4.5" />
          Agency verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant={status === 'verified' ? 'default' : 'secondary'}>
          {STATUS_LABEL[status]}
        </Badge>
        <p className="text-muted-foreground mt-3 text-sm">{STATUS_HINT[status]}</p>
      </CardContent>
    </Card>
  )
}
