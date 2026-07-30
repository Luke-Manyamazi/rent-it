import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { CalendarClock, CheckCircle2, Loader2, Smartphone, XCircle } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { bookingRequestSchema, type BookingRequestValues } from '@/features/booking/schemas'
import { initiateViewingPayment, useViewingPayment } from '@/features/booking/api/payments'
import { VIEWING_FEE_USD } from '@/config/constants'
import type { Property } from '@/types/property'

function PaymentStatusStep({
  paymentId,
  onClose,
  onRetry,
}: {
  paymentId: string
  onClose: () => void
  onRetry: () => void
}) {
  const { payment, loading } = useViewingPayment(paymentId)

  if (loading || !payment || payment.status === 'pending') {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
        <p className="font-medium">Waiting for payment confirmation…</p>
        {payment?.method === 'ecocash' && (
          <p className="text-muted-foreground max-w-xs text-sm">
            Check your phone — approve the ${VIEWING_FEE_USD} EcoCash prompt with your PIN.
          </p>
        )}
      </div>
    )
  }

  if (payment.status === 'paid') {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <span className="bg-verified/10 text-verified flex size-12 items-center justify-center rounded-full">
          <CheckCircle2 className="size-6" />
        </span>
        <p className="font-medium">Viewing requested</p>
        <p className="text-muted-foreground max-w-xs text-sm">
          Your ${VIEWING_FEE_USD} fee was received — the owner will confirm your viewing time
          shortly.
        </p>
        <Button onClick={onClose}>Done</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <span className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
        <XCircle className="size-6" />
      </span>
      <p className="font-medium">Payment didn't go through</p>
      <p className="text-muted-foreground max-w-xs text-sm">
        It may have been cancelled or declined. You can try again.
      </p>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  )
}

export function BookingRequestDialog({ property }: { property: Property }) {
  const { firebaseUser, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [paymentId, setPaymentId] = useState<string | null>(null)

  const form = useForm<BookingRequestValues>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: { proposedViewingTime: '', tenantNote: '', method: 'ecocash', phoneNumber: '' },
  })
  const selectedMethod = useWatch({ control: form.control, name: 'method' })

  function resetAll() {
    form.reset()
    setPaymentId(null)
  }

  async function onSubmit(values: BookingRequestValues) {
    if (!firebaseUser) {
      toast.error('Log in as a tenant to book a viewing.')
      return
    }
    setSubmitting(true)
    try {
      const result = await initiateViewingPayment(firebaseUser, {
        propertyId: property.id,
        proposedViewingTime: values.proposedViewingTime,
        tenantNote: values.tenantNote,
        method: values.method,
        phoneNumber: values.method === 'ecocash' ? values.phoneNumber : undefined,
      })
      if (result.redirectUrl) {
        window.open(result.redirectUrl, '_blank', 'noopener,noreferrer')
      }
      setPaymentId(result.paymentId)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't start the payment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (profile && profile.role !== 'tenant') return null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetAll()
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full">
          <CalendarClock className="size-4" />
          Book a viewing — ${VIEWING_FEE_USD}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {paymentId ? (
          <>
            <DialogHeader>
              <DialogTitle>Confirm your viewing</DialogTitle>
            </DialogHeader>
            <PaymentStatusStep
              paymentId={paymentId}
              onClose={() => setOpen(false)}
              onRetry={() => setPaymentId(null)}
            />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request a viewing</DialogTitle>
              <DialogDescription>
                A ${VIEWING_FEE_USD} commitment fee books your viewing slot — refunded if you view
                and aren't interested, kept only if you go on to rent. The owner will confirm your
                requested time, then reconfirm availability before you travel.
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
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pay with</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ecocash">EcoCash</SelectItem>
                          <SelectItem value="paynow">Paynow (card / other)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {selectedMethod === 'ecocash' && (
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EcoCash number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Smartphone className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                            <Input className="pl-9" placeholder="+263771234567" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="size-4 animate-spin" />}
                    Pay ${VIEWING_FEE_USD} & send request
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
