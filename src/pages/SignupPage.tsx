import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RoleSelector } from '@/features/auth/components/RoleSelector'
import { GoogleIcon } from '@/features/auth/components/GoogleIcon'
import { signupSchema, type SignupValues } from '@/features/auth/schemas'
import { signUpWithEmail, signInWithGoogle } from '@/features/auth/api/auth'
import { getAuthErrorMessage } from '@/features/auth/api/error-messages'
import type { UserRole } from '@/types/user'

const PRESELECTABLE_ROLES: Exclude<UserRole, 'admin'>[] = ['tenant', 'landlord', 'agency']

export function SignupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('role')
  const preselectedRole = PRESELECTABLE_ROLES.find((r) => r === roleParam) ?? null
  const [role, setRole] = useState<Exclude<UserRole, 'admin'> | null>(preselectedRole)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(values: SignupValues) {
    if (!role) {
      toast.error('Choose an account type first.')
      return
    }
    setSubmitting(true)
    try {
      await signUpWithEmail(values.fullName, values.email, values.password, role)
      toast.success('Account created — check your email to verify it.')
      navigate('/verify-phone', { replace: true })
    } catch (error) {
      toast.error(getAuthErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  async function onGoogleClick() {
    if (!role) {
      toast.error('Choose an account type first.')
      return
    }
    setGoogleLoading(true)
    try {
      const { isNewProfile } = await signInWithGoogle()
      // If this Google account already has a profile, they should have used
      // "Log in" — but routing to the dashboard is a friendlier failure mode
      // than an error message.
      navigate(isNewProfile ? '/choose-role' : '/dashboard', { replace: true })
    } catch (error) {
      toast.error(getAuthErrorMessage(error))
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Join RentIT Masvingo — verified listings, no viewing fees.
        </p>

        <div className="mt-6">
          <RoleSelector value={role} onChange={setRole} />
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-6 w-full"
          onClick={onGoogleClick}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GoogleIcon className="size-4" />
          )}
          Continue with Google
        </Button>

        <div className="text-muted-foreground my-6 flex items-center gap-3 text-xs">
          <span className="bg-border h-px flex-1" />
          or
          <span className="bg-border h-px flex-1" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Create account
            </Button>
          </form>
        </Form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-foreground font-medium underline underline-offset-4">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
