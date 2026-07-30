import { z } from 'zod'

const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1, 'Firebase API key is required'),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  VITE_FIREBASE_APP_ID: z.string().min(1),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  VITE_FIREBASE_VAPID_KEY: z.string().optional(),
  VITE_SUPABASE_URL: z.url('Supabase project URL is required'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  VITE_APP_URL: z.url().default('http://localhost:5173'),
  /** The scheduled-jobs Vercel project — hosts the Paynow viewing-fee
   *  endpoints (see scheduled-jobs/README.md). Different origin from
   *  Firebase, so it's a separate base URL rather than a Firestore call. */
  VITE_PAYMENTS_API_BASE_URL: z.url('Payments backend URL is required'),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  const missing = parsed.error.issues.map((issue) => issue.path.join('.'))
  throw new Error(
    `Missing or invalid environment variables: ${missing.join(', ')}. ` +
      'Copy .env.example to .env.local and fill in your Firebase project config.'
  )
}

export const env = parsed.data
