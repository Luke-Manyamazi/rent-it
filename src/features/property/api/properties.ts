import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Property, PropertyPhoto } from '@/types/property'
import type { PropertyFormValues } from '@/features/property/schemas'
import { deletePropertyPhoto } from '@/features/property/api/photos'

export interface CreatePropertyInput extends PropertyFormValues {
  ownerId: string
  ownerType: 'landlord' | 'agency'
}

/** Creates the doc first (photos: [], status: 'draft') so a propertyId
 *  exists to scope the Supabase upload path, then the caller uploads
 *  photos and calls publishProperty() to go live. */
export async function createDraftProperty(input: CreatePropertyInput) {
  const ref = await addDoc(collection(db, 'properties'), {
    ownerId: input.ownerId,
    ownerType: input.ownerType,
    title: input.title,
    description: input.description,
    propertyType: input.propertyType,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    sizeSqm: input.sizeSqm === '' || input.sizeSqm === undefined ? null : input.sizeSqm,
    rentAmount: input.rentAmount,
    currency: input.currency,
    rentFrequency: input.rentFrequency,
    depositAmount:
      input.depositAmount === '' || input.depositAmount === undefined ? null : input.depositAmount,
    availableFrom: Timestamp.fromDate(new Date(input.availableFrom)),
    amenities: input.amenities,
    location: {
      address: input.address,
      suburb: input.suburb,
      city: 'Masvingo',
      citySlug: 'masvingo',
      geopoint: null,
    },
    photos: [],
    videoUrl: null,
    status: 'draft',
    isVerified: false,
    lastConfirmedAvailableAt: null,
    viewCount: 0,
    savedCount: 0,
    isFlagged: false,
    flagCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProperty(
  propertyId: string,
  input: PropertyFormValues
) {
  await updateDoc(doc(db, 'properties', propertyId), {
    title: input.title,
    description: input.description,
    propertyType: input.propertyType,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    sizeSqm: input.sizeSqm === '' || input.sizeSqm === undefined ? null : input.sizeSqm,
    rentAmount: input.rentAmount,
    currency: input.currency,
    rentFrequency: input.rentFrequency,
    depositAmount:
      input.depositAmount === '' || input.depositAmount === undefined ? null : input.depositAmount,
    availableFrom: Timestamp.fromDate(new Date(input.availableFrom)),
    amenities: input.amenities,
    location: {
      address: input.address,
      suburb: input.suburb,
      city: 'Masvingo',
      citySlug: 'masvingo',
      geopoint: null,
    },
    updatedAt: serverTimestamp(),
  })
}

export async function setPropertyPhotos(propertyId: string, photos: PropertyPhoto[]) {
  await updateDoc(doc(db, 'properties', propertyId), {
    photos,
    updatedAt: serverTimestamp(),
  })
}

export async function publishProperty(propertyId: string) {
  await updateDoc(doc(db, 'properties', propertyId), {
    status: 'active',
    updatedAt: serverTimestamp(),
  })
}

export async function setPropertyStatus(
  propertyId: string,
  status: Property['status']
) {
  await updateDoc(doc(db, 'properties', propertyId), {
    status,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteProperty(property: Property) {
  await Promise.all(property.photos.map((photo) => deletePropertyPhoto(photo.storagePath)))
  await deleteDoc(doc(db, 'properties', property.id))
}

interface OwnerPropertiesSnapshot {
  ownerId: string
  properties: Property[]
}

export function usePropertiesByOwner(ownerId: string | undefined) {
  const [snapshot, setSnapshot] = useState<OwnerPropertiesSnapshot | null>(null)

  useEffect(() => {
    if (!ownerId) return
    const q = query(
      collection(db, 'properties'),
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setSnapshot({
        ownerId,
        properties: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Property),
      })
    })
  }, [ownerId])

  const properties = ownerId && snapshot?.ownerId === ownerId ? snapshot.properties : []
  const loading = !!ownerId && snapshot?.ownerId !== ownerId

  return { properties, loading }
}

interface PublicPropertiesSnapshot {
  key: string
  properties: Property[]
}

/** Basic public grid — status == active, most recent first. Faceted
 *  search/filtering (suburb, price range, type) is Phase 10. */
export function usePublicProperties(rowLimit = 24) {
  const [snapshot, setSnapshot] = useState<PublicPropertiesSnapshot | null>(null)
  const key = `active:${rowLimit}`

  useEffect(() => {
    const q = query(
      collection(db, 'properties'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      fbLimit(rowLimit)
    )
    return onSnapshot(q, (snap) => {
      setSnapshot({
        key,
        properties: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Property),
      })
    })
  }, [rowLimit, key])

  const properties = snapshot?.key === key ? snapshot.properties : []
  const loading = snapshot?.key !== key

  return { properties, loading }
}

interface SingleSnapshot {
  propertyId: string
  property: Property | null
}

export function useProperty(propertyId: string | undefined) {
  const [snapshot, setSnapshot] = useState<SingleSnapshot | null>(null)

  useEffect(() => {
    if (!propertyId) return
    return onSnapshot(doc(db, 'properties', propertyId), (snap) => {
      setSnapshot({
        propertyId,
        property: snap.exists() ? ({ id: snap.id, ...snap.data() } as Property) : null,
      })
    })
  }, [propertyId])

  const property = propertyId && snapshot?.propertyId === propertyId ? snapshot.property : null
  const loading = !!propertyId && snapshot?.propertyId !== propertyId

  return { property, loading }
}

export async function getPropertyOnce(propertyId: string) {
  const snap = await getDoc(doc(db, 'properties', propertyId))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Property) : null
}
