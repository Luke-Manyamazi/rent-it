import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
import { loginSchema, type LoginValues } from '@/features/auth/schemas'
import {
  signInWithEmail,
  signInWithGoogle,
  requestPasswordReset,
} from '@/features/auth/api/auth'
import { getAuthErrorMessage } from '@/features/auth/api/error-messages'
import { GoogleIcon } from '@/features/auth/components/GoogleIcon'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginValues) {
    setSubmitting(true)
    try {
      await signInWithEmail(values.email, values.password)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      toast.error(getAuthErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  async function onGoogleClick() {
    setGoogleLoading(true)
    try {
      const { isNewProfile } = await signInWithGoogle()
      navigate(isNewProfile ? '/choose-role' : redirectTo, { replace: true })
    } catch (error) {
      toast.error(getAuthErrorMessage(error))
    } finally {
      setGoogleLoading(false)
    }
  }

  async function onForgotPassword() {
    const email = form.getValues('email')
    if (!email) {
      toast.error('Enter your email above first, then click "Forgot password?"')
      return
    }
    try {
      await requestPasswordReset(email)
      toast.success('Password reset email sent — check your inbox.')
    } catch (error) {
      toast.error(getAuthErrorMessage(error))
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Log in to continue to RentIT Masvingo.
        </p>

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
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Log in
            </Button>
          </form>
        </Form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-foreground font-medium underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
