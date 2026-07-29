import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EMPTY_FILTERS, type SearchFilters, type SortOption } from '@/features/search/types'
import type { PropertyType } from '@/types/property'

const VALID_SORTS: SortOption[] = ['newest', 'price_asc', 'price_desc']
const VALID_TYPES: PropertyType[] = [
  'house',
  'apartment',
  'cottage',
  'room',
  'commercial',
  'land',
]

/** Filters live in the URL (not just component state) so results are
 *  shareable/bookmarkable and so Phase 4's hero search — which already
 *  navigates to /listings?location=..&type=..&maxPrice=.. — lands on a
 *  pre-filled results page. */
export function useSearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<SearchFilters>(() => {
    const type = searchParams.get('type')
    const sort = searchParams.get('sort')
    return {
      keyword: searchParams.get('location') ?? EMPTY_FILTERS.keyword,
      propertyType: type && VALID_TYPES.includes(type as PropertyType) ? (type as PropertyType) : 'any',
      minPrice: searchParams.get('minPrice') ?? EMPTY_FILTERS.minPrice,
      maxPrice: searchParams.get('maxPrice') ?? EMPTY_FILTERS.maxPrice,
      minBedrooms: searchParams.get('minBedrooms') ?? EMPTY_FILTERS.minBedrooms,
      sort: sort && VALID_SORTS.includes(sort as SortOption) ? (sort as SortOption) : 'newest',
    }
  }, [searchParams])

  const setFilters = useCallback(
    (next: Partial<SearchFilters>) => {
      const merged = { ...filters, ...next }
      const params = new URLSearchParams()
      if (merged.keyword.trim()) params.set('location', merged.keyword.trim())
      if (merged.propertyType !== 'any') params.set('type', merged.propertyType)
      if (merged.minPrice) params.set('minPrice', merged.minPrice)
      if (merged.maxPrice) params.set('maxPrice', merged.maxPrice)
      if (merged.minBedrooms) params.set('minBedrooms', merged.minBedrooms)
      if (merged.sort !== 'newest') params.set('sort', merged.sort)
      setSearchParams(params, { replace: true })
    },
    [filters, setSearchParams]
  )

  const clearFilters = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams])

  return { filters, setFilters, clearFilters }
}
