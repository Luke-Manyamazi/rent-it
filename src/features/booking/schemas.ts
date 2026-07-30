import { z } from 'zod'

export const bookingRequestSchema = z
  .object({
    proposedViewingTime: z
      .string()
      .min(1, 'Choose a date and time')
      .refine((value) => new Date(value).getTime() > Date.now(), {
        message: 'Choose a time in the future',
      }),
    tenantNote: z.string().trim().max(500).optional().or(z.literal('')),
    method: z.enum(['ecocash', 'paynow']),
    // Same international-format pattern as features/auth/schemas.ts's phoneSchema.
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+\d{9,15}$/, 'Enter a phone number in international format, e.g. +263771234567')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.method !== 'ecocash' || !!data.phoneNumber, {
    message: 'A phone number is required to pay with EcoCash',
    path: ['phoneNumber'],
  })
export type BookingRequestValues = z.infer<typeof bookingRequestSchema>
