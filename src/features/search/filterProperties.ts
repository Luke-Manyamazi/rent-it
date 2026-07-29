import type { Property } from '@/types/property'
import type { SearchFilters } from '@/features/search/types'

/**
 * Client-side filter/sort over an already-fetched batch of active listings.
 * Deliberate MVP choice: Firestore range filters only compose cleanly on one
 * field per query, and the stack has no dedicated search service (Algolia/
 * Typesense) — at Masvingo's current listing volume, fetching a bounded
 * batch (see usePublicProperties) and refining client-side is simpler than
 * juggling a matrix of composite indexes per filter combination, and it's
 * what makes "search-as-you-type" free (no extra reads per keystroke).
 * Revisit once listing volume makes a full batch fetch too expensive.
 */
export function filterProperties(properties: Property[], filters: SearchFilters): Property[] {
  const keyword = filters.keyword.trim().toLowerCase()
  const minPrice = Number(filters.minPrice)
  const maxPrice = Number(filters.maxPrice)
  const minBedrooms = Number(filters.minBedrooms)

  const filtered = properties.filter((property) => {
    if (keyword) {
      const haystack = [
        property.title,
        property.description,
        property.location.suburb,
        property.location.address,
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(keyword)) return false
    }
    if (filters.propertyType !== 'any' && property.propertyType !== filters.propertyType) {
      return false
    }
    if (filters.minPrice && Number.isFinite(minPrice) && property.rentAmount < minPrice) {
      return false
    }
    if (filters.maxPrice && Number.isFinite(maxPrice) && property.rentAmount > maxPrice) {
      return false
    }
    if (filters.minBedrooms && Number.isFinite(minBedrooms) && property.bedrooms < minBedrooms) {
      return false
    }
    return true
  })

  const sorted = [...filtered]
  if (filters.sort === 'price_asc') {
    sorted.sort((a, b) => a.rentAmount - b.rentAmount)
  } else if (filters.sort === 'price_desc') {
    sorted.sort((a, b) => b.rentAmount - a.rentAmount)
  } else {
    sorted.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
  }
  return sorted
}
