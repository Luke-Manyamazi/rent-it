import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoleSelector } from '@/features/auth/components/RoleSelector'
import { completeGoogleProfile } from '@/features/auth/api/auth'
import { getAuthErrorMessage } from '@/features/auth/api/error-messages'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { FullPageSpinner } from '@/app/route-guards'
import type { UserRole } from '@/types/user'

/** Google sign-in gives us name/email/photo but not a role — this page
 *  finishes account setup for first-time Google sign-ins. */
export function ChooseRolePage() {
  const navigate = useNavigate()
  const { firebaseUser, profile, loading } = useAuth()
  const [role, setRole] = useState<Exclude<UserRole, 'admin'> | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <FullPageSpinner />
  if (!firebaseUser) {
    navigate('/login', { replace: true })
    return null
  }
  if (profile) {
    navigate('/dashboard', { replace: true })
    return null
  }

  async function onContinue() {
    if (!role || !firebaseUser) return
    setSubmitting(true)
    try {
      await completeGoogleProfile(firebaseUser, role)
      navigate('/verify-phone', { replace: true })
    } catch (error) {
      toast.error(getAuthErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">One more step</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Tell us what you're here to do, {firebaseUser.displayName?.split(' ')[0] ?? 'there'}.
      </p>
      <div className="mt-6">
        <RoleSelector value={role} onChange={setRole} />
      </div>
      <Button className="mt-6 w-full" disabled={!role || submitting} onClick={onContinue}>
        {submitting && <Loader2 className="size-4 animate-spin" />}
        Continue
      </Button>
    </div>
  )
}
