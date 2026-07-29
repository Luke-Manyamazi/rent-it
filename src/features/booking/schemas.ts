import { z } from 'zod'

export const bookingRequestSchema = z.object({
  proposedViewingTime: z
    .string()
    .min(1, 'Choose a date and time')
    .refine((value) => new Date(value).getTime() > Date.now(), {
      message: 'Choose a time in the future',
    }),
  tenantNote: z.string().trim().max(500).optional().or(z.literal('')),
})
export type BookingRequestValues = z.infer<typeof bookingRequestSchema>
