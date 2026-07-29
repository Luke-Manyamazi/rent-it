import type { PropertyType } from '@/types/property'

export type SortOption = 'newest' | 'price_asc' | 'price_desc'

export interface SearchFilters {
  /** Free-text match against title/description/suburb/address. */
  keyword: string
  propertyType: PropertyType | 'any'
  minPrice: string
  maxPrice: string
  minBedrooms: string
  sort: SortOption
}

export const EMPTY_FILTERS: SearchFilters = {
  keyword: '',
  propertyType: 'any',
  minPrice: '',
  maxPrice: '',
  minBedrooms: '',
  sort: 'newest',
}
