import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { useAuth } from '@/features/auth/hooks/useAuth'
import { usePrivateContact } from '@/features/account/hooks/usePrivateContact'
import { updateFullName } from '@/features/account/api/profile'
import { editProfileSchema, type EditProfileValues } from '@/features/account/schemas'

export function EditProfileForm() {
  const { firebaseUser, profile } = useAuth()
  const { contact } = usePrivateContact(firebaseUser?.uid)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    values: { fullName: profile?.fullName ?? '' },
  })

  async function onSubmit(values: EditProfileValues) {
    if (!firebaseUser) return
    setSubmitting(true)
    try {
      await updateFullName(firebaseUser, values.fullName)
      toast.success('Profile updated.')
    } catch {
      toast.error("Couldn't update your profile. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-1.5">
          <label className="text-sm leading-none font-medium">Email</label>
          <Input value={contact?.email ?? ''} disabled />
          <p className="text-muted-foreground text-xs">
            Contact support to change your email address.
          </p>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </form>
    </Form>
  )
}
