import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  collection,
  getCountFromServer,
  onSnapshot,
  orderBy,
  query,
  limit as fbLimit,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { PlatformAnalyticsRollup, OwnerAnalyticsRollup } from '@/types/analytics'
import type { PropertyStatus } from '@/types/property'
import type { BookingStatus } from '@/types/booking'

interface HistorySnapshot<T> {
  key: string
  rollups: T[]
}

/** Rollups are written newest-first-friendly (doc id = date), so this
 *  fetches the most recent `days` docs and reverses to chronological order
 *  for a left-to-right trend chart. */
export function usePlatformAnalyticsHistory(days = 30) {
  const [snapshot, setSnapshot] = useState<HistorySnapshot<PlatformAnalyticsRollup> | null>(null)
  const key = `platform:${days}`

  useEffect(() => {
    const q = query(collection(db, 'analyticsRollups'), orderBy('date', 'desc'), fbLimit(days))
    return onSnapshot(q, (snap) => {
      setSnapshot({
        key,
        rollups: snap.docs.map((d) => d.data() as PlatformAnalyticsRollup).reverse(),
      })
    })
  }, [days, key])

  const rollups = snapshot?.key === key ? snapshot.rollups : []
  const loading = snapshot?.key !== key

  return { rollups, loading }
}

export function useOwnerAnalyticsHistory(
  ownerType: 'landlord' | 'agency' | undefined,
  ownerId: string | undefined,
  days = 30
) {
  const [snapshot, setSnapshot] = useState<HistorySnapshot<OwnerAnalyticsRollup> | null>(null)
  const key = ownerType && ownerId ? `${ownerType}:${ownerId}:${days}` : undefined

  useEffect(() => {
    if (!ownerType || !ownerId) return
    const collectionName = ownerType === 'agency' ? 'agencies' : 'users'
    const q = query(
      collection(db, collectionName, ownerId, 'analyticsRollups'),
      orderBy('date', 'desc'),
      fbLimit(days)
    )
    return onSnapshot(q, (snap) => {
      setSnapshot({
        key: `${ownerType}:${ownerId}:${days}`,
        rollups: snap.docs.map((d) => d.data() as OwnerAnalyticsRollup).reverse(),
      })
    })
  }, [ownerType, ownerId, days])

  const rollups = key && snapshot?.key === key ? snapshot.rollups : []
  const loading = !!key && snapshot?.key !== key

  return { rollups, loading }
}

const PROPERTY_STATUSES: PropertyStatus[] = [
  'active',
  'pending_review',
  'draft',
  'rented',
  'suspended',
  'expired',
]

const BOOKING_STATUSES: BookingStatus[] = [
  'pending',
  'confirmed',
  'availability_confirmed',
  'completed',
  'cancelled_by_tenant',
  'cancelled_by_owner',
  'auto_cancelled_no_confirmation',
  'no_show',
]

/** Point-in-time categorical breakdowns — same `getCountFromServer` +
 *  TanStack Query technique as `usePlatformStats`, since Firestore's count
 *  aggregation is a one-shot read, not a live listener. */
export function usePropertyStatusBreakdown() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['property-status-breakdown'],
    queryFn: async () => {
      const propertiesRef = collection(db, 'properties')
      const counts = await Promise.all(
        PROPERTY_STATUSES.map((status) =>
          getCountFromServer(query(propertiesRef, where('status', '==', status)))
        )
      )
      return PROPERTY_STATUSES.map((status, i) => ({
        status,
        count: counts[i].data().count,
      }))
    },
  })

  return { breakdown: data ?? [], loading: isLoading, refresh: refetch }
}

export function useBookingStatusBreakdown() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['booking-status-breakdown'],
    queryFn: async () => {
      const bookingsRef = collection(db, 'bookings')
      const counts = await Promise.all(
        BOOKING_STATUSES.map((status) =>
          getCountFromServer(query(bookingsRef, where('status', '==', status)))
        )
      )
      return BOOKING_STATUSES.map((status, i) => ({
        status,
        count: counts[i].data().count,
      }))
    },
  })

  return { breakdown: data ?? [], loading: isLoading, refresh: refetch }
}
