import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { CalendarClock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { bookingRequestSchema, type BookingRequestValues } from '@/features/booking/schemas'
import { createBooking } from '@/features/booking/api/bookings'
import type { Property } from '@/types/property'

export function BookingRequestDialog({ property }: { property: Property }) {
  const { firebaseUser, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<BookingRequestValues>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: { proposedViewingTime: '', tenantNote: '' },
  })

  async function onSubmit(values: BookingRequestValues) {
    if (!firebaseUser) {
      toast.error('Log in as a tenant to book a viewing.')
      return
    }
    setSubmitting(true)
    try {
      await createBooking(firebaseUser.uid, property, values)
      toast.success('Viewing requested — the owner will confirm shortly.')
      form.reset()
      setOpen(false)
    } catch {
      toast.error("Couldn't request that viewing. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (profile && profile.role !== 'tenant') return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <CalendarClock className="size-4" />
          Book a viewing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a viewing</DialogTitle>
          <DialogDescription>
            The owner will confirm your requested time. Before your visit,
            they must reconfirm the property is still available — if they
            don't, your booking auto-cancels and you're notified before you
            travel.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="proposedViewingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred date and time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tenantNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Anything the owner should know?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Send request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
