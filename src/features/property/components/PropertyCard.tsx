import { Link } from 'react-router-dom'
import { BedDouble, Bath, MapPin, ShieldCheck, ImageOff } from 'lucide-react'
import { SaveButton } from '@/features/property/components/SaveButton'
import type { Property } from '@/types/property'

export function PropertyCard({ property }: { property: Property }) {
  const cover = property.photos[0]

  return (
    <Link
      to={`/listings/${property.id}`}
      className="group border-border block overflow-hidden rounded-2xl border transition-shadow hover:shadow-md"
    >
      <div className="bg-muted relative aspect-4/3 overflow-hidden">
        {cover ? (
          <img
            src={cover.url}
            alt={property.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center">
            <ImageOff className="size-8" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <SaveButton propertyId={property.id} />
        </div>
        {property.isVerified && (
          <div className="bg-verified text-verified-foreground absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium">
            <ShieldCheck className="size-3" />
            Verified
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold">
          {property.currency} {property.rentAmount.toLocaleString()}
          <span className="text-muted-foreground text-sm font-normal">
            {' '}
            / {property.rentFrequency === 'monthly' ? 'month' : 'week'}
          </span>
        </p>
        <p className="mt-1 truncate text-sm font-medium">{property.title}</p>
        <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
          <MapPin className="size-3" />
          {property.location.suburb}, {property.location.city}
        </p>
        <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <BedDouble className="size-3.5" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="size-3.5" />
            {property.bathrooms}
          </span>
        </div>
      </div>
    </Link>
  )
}
