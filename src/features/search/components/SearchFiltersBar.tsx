import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { propertyTypeOptions } from '@/features/property/schemas'
import type { SearchFilters } from '@/features/search/types'

const BEDROOM_OPTIONS = ['1', '2', '3', '4', '5']

export function SearchFiltersBar({
  filters,
  onChange,
  onClear,
  hasActiveFilters,
}: {
  filters: SearchFilters
  onChange: (next: Partial<SearchFilters>) => void
  onClear: () => void
  hasActiveFilters: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={filters.keyword}
          onChange={(e) => onChange({ keyword: e.target.value })}
          placeholder="Search by suburb, title, or description..."
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.propertyType}
          onValueChange={(value) => onChange({ propertyType: value as SearchFilters['propertyType'] })}
        >
          <SelectTrigger size="sm" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any type</SelectItem>
            {propertyTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.minBedrooms || 'any'}
          onValueChange={(value) => onChange({ minBedrooms: value === 'any' ? '' : value })}
        >
          <SelectTrigger size="sm" className="w-32">
            <SelectValue placeholder="Bedrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any beds</SelectItem>
            {BEDROOM_OPTIONS.map((n) => (
              <SelectItem key={n} value={n}>
                {n}+ beds
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          min={0}
          value={filters.minPrice}
          onChange={(e) => onChange({ minPrice: e.target.value })}
          placeholder="Min price"
          className="h-7 w-28"
        />
        <Input
          type="number"
          min={0}
          value={filters.maxPrice}
          onChange={(e) => onChange({ maxPrice: e.target.value })}
          placeholder="Max price"
          className="h-7 w-28"
        />

        <Select
          value={filters.sort}
          onValueChange={(value) => onChange({ sort: value as SearchFilters['sort'] })}
        >
          <SelectTrigger size="sm" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price_asc">Price: low to high</SelectItem>
            <SelectItem value="price_desc">Price: high to low</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="size-3.5" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
