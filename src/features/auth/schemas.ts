import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
export type SignupValues = z.infer<typeof signupSchema>

export const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+\d{9,15}$/, 'Enter a phone number in international format, e.g. +263771234567'),
})
export type PhoneValues = z.infer<typeof phoneSchema>

export const otpSchema = z.object({
  code: z.string().length(6, 'Enter the 6-digit code'),
})
export type OtpValues = z.infer<typeof otpSchema>
