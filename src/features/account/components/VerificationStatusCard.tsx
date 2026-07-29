import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CheckCircle2, CircleDashed, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { usePrivateContact } from '@/features/account/hooks/usePrivateContact'
import { sendEmailVerificationLink } from '@/features/account/api/verification'
import { getAuthErrorMessage } from '@/features/auth/api/error-messages'
import type { VerificationStatus } from '@/types/user'

const STATUS_LABEL: Record<VerificationStatus, string> = {
  unverified: 'Not started',
  pending: 'Under review',
  verified: 'Verified',
  rejected: 'Rejected',
}

function StatusRow({
  verified,
  label,
  action,
}: {
  verified: boolean
  label: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        {verified ? (
          <CheckCircle2 className="text-verified size-4.5" />
        ) : (
          <CircleDashed className="text-muted-foreground size-4.5" />
        )}
        {label}
      </div>
      {action}
    </div>
  )
}

export function VerificationStatusCard() {
  const { firebaseUser, profile, refreshFirebaseUser } = useAuth()
  const { contact } = usePrivateContact(firebaseUser?.uid)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)

  if (!firebaseUser || !profile) return null

  async function onResendEmail() {
    if (!firebaseUser) return
    setSendingEmail(true)
    try {
      await sendEmailVerificationLink(firebaseUser)
      toast.success('Verification email sent — check your inbox.')
    } catch (error) {
      toast.error(getAuthErrorMessage(error))
    } finally {
      setSendingEmail(false)
    }
  }

  async function onRecheckEmail() {
    setCheckingEmail(true)
    try {
      await refreshFirebaseUser()
      toast(
        firebaseUser?.emailVerified
          ? 'Email verified!'
          : "Not verified yet — click the link in the email we sent you."
      )
    } finally {
      setCheckingEmail(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4.5" />
          Verification status
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        <StatusRow
          verified={firebaseUser.emailVerified}
          label="Email verified"
          action={
            firebaseUser.emailVerified ? undefined : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onRecheckEmail}
                  disabled={checkingEmail}
                >
                  {checkingEmail && <Loader2 className="size-3.5 animate-spin" />}
                  I've verified
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onResendEmail}
                  disabled={sendingEmail}
                >
                  {sendingEmail && <Loader2 className="size-3.5 animate-spin" />}
                  Resend
                </Button>
              </div>
            )
          }
        />
        <StatusRow
          verified={contact?.phoneVerified ?? false}
          label="Phone verified"
          action={
            contact?.phoneVerified ? undefined : (
              <Button size="sm" variant="outline" asChild>
                <Link to="/verify-phone">Verify</Link>
              </Button>
            )
          }
        />
        <div className="flex items-center justify-between py-2">
          <span className="text-sm">Identity verification</span>
          <Badge variant={profile.verificationStatus === 'verified' ? 'default' : 'secondary'}>
            {STATUS_LABEL[profile.verificationStatus]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
