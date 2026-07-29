import { z } from 'zod'

export const editProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name'),
})
export type EditProfileValues = z.infer<typeof editProfileSchema>
