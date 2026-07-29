import { z } from 'zod'

export const agencyProfileSchema = z.object({
  name: z.string().trim().min(2, 'Enter an agency name'),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  contactPhone: z.string().trim().min(1, 'Enter a contact phone number'),
  contactEmail: z.email('Enter a valid email address'),
  website: z.url('Enter a valid URL').optional().or(z.literal('')),
  address: z.string().trim().optional().or(z.literal('')),
  licenseNumber: z.string().trim().optional().or(z.literal('')),
})
export type AgencyProfileValues = z.infer<typeof agencyProfileSchema>

export const inviteMemberSchema = z.object({
  email: z.email('Enter a valid email address'),
})
export type InviteMemberValues = z.infer<typeof inviteMemberSchema>
