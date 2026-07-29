import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env'
import { auth } from '@/lib/firebase/config'

/**
 * Supabase is used for Storage only (property photos, avatars, verification
 * docs) — Auth and the database of record stay on Firebase. Firebase Auth is
 * registered as a Third-Party Auth provider in the Supabase dashboard
 * (Authentication > Sign In / Providers), which lets Storage RLS policies
 * trust the Firebase ID token directly via `auth.jwt()->>'sub'` — no
 * separate Supabase sign-in step, and no backend needed to bridge the two.
 */
export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  accessToken: async () => {
    const user = auth.currentUser
    return user ? await user.getIdToken() : null
  },
})
