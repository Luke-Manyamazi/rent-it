import { Home, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePublicProperties } from '@/features/property/api/properties'
import { PropertyCard } from '@/features/property/components/PropertyCard'
import { SearchFiltersBar } from '@/features/search/components/SearchFiltersBar'
import { useSearchFilters } from '@/features/search/useSearchFilters'
import { filterProperties } from '@/features/search/filterProperties'
import { EMPTY_FILTERS } from '@/features/search/types'

export function ListingsPage() {
  const { properties, loading } = usePublicProperties(60)
  const { filters, setFilters, clearFilters } = useSearchFilters()
  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS)
  const results = filterProperties(properties, filters)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Browse rentals</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Verified listings in Masvingo.
        </p>
      </div>

      <div className="mt-6">
        <SearchFiltersBar
          filters={filters}
          onChange={setFilters}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
            <Home className="size-5" />
          </span>
          <p className="font-medium">No listings yet</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Be the first to list a property in Masvingo — sign up as a
            landlord or agency to get started.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
            <SearchX className="size-5" />
          </span>
          <p className="font-medium">No listings match your search</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Try widening your price range or clearing a filter.
          </p>
          <Button variant="outline" size="sm" className="mt-2" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground mt-6 text-sm">
            {results.length} {results.length === 1 ? 'listing' : 'listings'}
          </p>
          <div className="mt-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
