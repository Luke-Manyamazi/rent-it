import type { GeoPoint, Timestamp } from 'firebase/firestore'

export type PropertyType =
  | 'house'
  | 'apartment'
  | 'cottage'
  | 'room'
  | 'commercial'
  | 'land'

export type RentFrequency = 'monthly' | 'weekly'

export type PropertyStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'rented'
  | 'suspended'
  | 'expired'

export type PropertyAmenity =
  | 'borehole'
  | 'solar_backup'
  | 'zesa_backup_generator'
  | 'prepaid_meter'
  | 'wifi'
  | 'parking'
  | 'security_guard'
  | 'precast_wall'
  | 'electric_fence'
  | 'furnished'
  | 'water_tank'
  | 'garden'

export interface PropertyPhoto {
  url: string
  storagePath: string
  order: number
}

export interface PropertyLocation {
  address: string
  suburb: string
  city: string
  /** Slug for the city-scoped platform instance, e.g. 'masvingo'. Enables the
   *  RentIT Bulawayo / Harare / Zimbabwe expansion to filter by market without
   *  a schema change. */
  citySlug: string
  geopoint: GeoPoint | null
}

export interface Property {
  id: string
  ownerId: string
  ownerType: 'landlord' | 'agency'
  title: string
  description: string
  propertyType: PropertyType
  bedrooms: number
  bathrooms: number
  sizeSqm: number | null
  rentAmount: number
  currency: 'USD' | 'ZWL'
  rentFrequency: RentFrequency
  depositAmount: number | null
  availableFrom: Timestamp
  amenities: PropertyAmenity[]
  location: PropertyLocation
  photos: PropertyPhoto[]
  videoUrl: string | null
  status: PropertyStatus
  /** Platform has physically/administratively verified this listing is genuine. */
  isVerified: boolean
  /** Last time the owner confirmed the property is still available —
   *  independent of a specific booking; refreshed by the Verified Before You
   *  Travel confirmation flow. */
  lastConfirmedAvailableAt: Timestamp | null
  viewCount: number
  savedCount: number
  isFlagged: boolean
  flagCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

/** Stored at `users/{userId}/savedProperties/{propertyId}` — existence = saved. */
export interface SavedProperty {
  propertyId: string
  savedAt: Timestamp
}
