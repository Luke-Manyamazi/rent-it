import { z } from 'zod'

export const submitPaymentSchema = z.object({
  requestedTier: z.enum(['starter', 'professional']),
  paymentMethod: z.enum(['ecocash', 'bank']),
  referenceNumber: z.string().trim().min(3, 'Enter the payment reference number'),
})
export type SubmitPaymentValues = z.infer<typeof submitPaymentSchema>
