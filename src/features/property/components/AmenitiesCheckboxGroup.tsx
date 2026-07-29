import { Checkbox } from '@/components/ui/checkbox'
import { amenityOptions } from '@/features/property/schemas'
import type { PropertyAmenity } from '@/types/property'

export function AmenitiesCheckboxGroup({
  value,
  onChange,
}: {
  value: PropertyAmenity[]
  onChange: (amenities: PropertyAmenity[]) => void
}) {
  function toggle(amenity: PropertyAmenity, checked: boolean) {
    onChange(checked ? [...value, amenity] : value.filter((a) => a !== amenity))
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {amenityOptions.map((option) => (
        <label key={option.value} className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={value.includes(option.value)}
            onCheckedChange={(checked) => toggle(option.value, checked === true)}
          />
          {option.label}
        </label>
      ))}
    </div>
  )
}
