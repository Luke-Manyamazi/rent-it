import { useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PLANS, PAYMENT_METHODS } from '@/config/plans'
import { submitPaymentSchema, type SubmitPaymentValues } from '@/features/subscription/schemas'
import { submitPaymentProof } from '@/features/subscription/api/subscription'
import { PlanPicker } from '@/features/subscription/components/PlanPicker'
import { PaymentInstructions } from '@/features/subscription/components/PaymentInstructions'

const MAX_FILE_SIZE_MB = 5

export function SubmitPaymentForm({ agencyId, uid }: { agencyId: string; uid: string }) {
  const [submitting, setSubmitting] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<SubmitPaymentValues>({
    resolver: zodResolver(submitPaymentSchema),
    defaultValues: { requestedTier: 'starter', paymentMethod: 'ecocash', referenceNumber: '' },
  })
  const selectedTier = useWatch({ control: form.control, name: 'requestedTier' })
  const selectedMethod = useWatch({ control: form.control, name: 'paymentMethod' })

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.')
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_FILE_SIZE_MB}MB.`)
      return
    }
    setProofFile(file)
  }

  async function onSubmit(values: SubmitPaymentValues) {
    setSubmitting(true)
    try {
      await submitPaymentProof(agencyId, uid, values, proofFile)
      toast.success('Payment submitted for review. An admin will confirm it shortly.')
      form.reset({ requestedTier: values.requestedTier, paymentMethod: values.paymentMethod, referenceNumber: '' })
      setProofFile(null)
    } catch {
      toast.error("Couldn't submit your payment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="requestedTier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choose a plan</FormLabel>
              <FormControl>
                <PlanPicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment method</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(PAYMENT_METHODS).map(([value, info]) => (
                    <SelectItem key={value} value={value}>
                      {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <PaymentInstructions method={selectedMethod} />

        <p className="text-muted-foreground text-sm">
          Pay ${PLANS[selectedTier].priceUsd} for the {PLANS[selectedTier].name} plan, then enter
          your payment reference below.
        </p>

        <FormField
          control={form.control}
          name="referenceNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment reference number</FormLabel>
              <FormControl>
                <Input placeholder="e.g. EcoCash transaction ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel className="mb-1.5">Proof of payment (optional)</FormLabel>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="size-4" />
            {proofFile ? proofFile.name : 'Attach a screenshot'}
          </Button>
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Submit for review
        </Button>
      </form>
    </Form>
  )
}
