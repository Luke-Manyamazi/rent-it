import { useQuery } from '@tanstack/react-query'
import { collection, getCountFromServer, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export interface PlatformStats {
  tenantCount: number
  landlordCount: number
  agencyCount: number
  pendingVerificationCount: number
  openFraudFlagCount: number
}

async function fetchPlatformStats(): Promise<PlatformStats> {
  const usersRef = collection(db, 'users')
  const [tenants, landlords, agencies, pendingVerification, openFlags] = await Promise.all([
    getCountFromServer(query(usersRef, where('role', '==', 'tenant'))),
    getCountFromServer(query(usersRef, where('role', '==', 'landlord'))),
    // Counts agency *entities*, not agency-role users — a multi-agent
    // agency would otherwise be counted once per team member.
    getCountFromServer(collection(db, 'agencies')),
    getCountFromServer(query(usersRef, where('verificationStatus', '==', 'pending'))),
    getCountFromServer(query(collection(db, 'fraudFlags'), where('status', '==', 'open'))),
  ])
  return {
    tenantCount: tenants.data().count,
    landlordCount: landlords.data().count,
    agencyCount: agencies.data().count,
    pendingVerificationCount: pendingVerification.data().count,
    openFraudFlagCount: openFlags.data().count,
  }
}

/**
 * Firestore's count aggregation is a point-in-time read, not a live
 * listener, so this is a one-shot fetch (with manual refetch) via
 * TanStack Query rather than an onSnapshot subscription like the rest of
 * the app's data hooks.
 */
export function usePlatformStats() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: fetchPlatformStats,
  })

  return { stats: data ?? null, loading: isLoading, refresh: refetch }
}
