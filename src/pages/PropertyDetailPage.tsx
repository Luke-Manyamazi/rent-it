import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  BedDouble,
  Bath,
  Ruler,
  MapPin,
  ShieldCheck,
  CalendarClock,
  MessageCircle,
  Loader2,
  ImageOff,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useProperty } from '@/features/property/api/properties'
import { useAgency } from '@/features/agency/hooks/useAgency'
import { useUserPublicProfile } from '@/features/account/hooks/useUserPublicProfile'
import { SaveButton } from '@/features/property/components/SaveButton'
import { amenityOptions } from '@/features/property/schemas'
import { NotFoundPage } from '@/pages/NotFoundPage'

function OwnerCard({ ownerType, ownerId }: { ownerType: 'landlord' | 'agency'; ownerId: string }) {
  const { profile } = useUserPublicProfile(ownerType === 'landlord' ? ownerId : undefined)
  const { agency } = useAgency(ownerType === 'agency' ? ownerId : undefined)

  const name = ownerType === 'agency' ? agency?.name : profile?.fullName
  const photoUrl = ownerType === 'agency' ? agency?.logoUrl : profile?.photoUrl
  const trustScore = ownerType === 'agency' ? agency?.trustScore : profile?.trustScore
  const verified =
    (ownerType === 'agency' ? agency?.verificationStatus : profile?.verificationStatus) === 'verified'

  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        <Avatar className="size-11">
          <AvatarImage src={photoUrl ?? undefined} alt={name} />
          <AvatarFallback>{name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{name ?? 'Loading…'}</p>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <span className="capitalize">{ownerType}</span>
            {verified && (
              <span className="text-verified flex items-center gap-0.5">
                <ShieldCheck className="size-3" />
                Verified
              </span>
            )}
            <span>· Trust score {trustScore ?? 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { property, loading } = useProperty(id)

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    )
  }

  if (!property) return <NotFoundPage />

  function onComingSoon(feature: string) {
    toast(`${feature} is coming in a later phase.`)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-muted relative aspect-video overflow-hidden rounded-2xl">
        {property.photos[0] ? (
          <img
            src={property.photos[0].url}
            alt={property.title}
            className="size-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center">
            <ImageOff className="size-10" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <SaveButton propertyId={property.id} />
        </div>
      </div>

      {property.photos.length > 1 && (
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {property.photos.slice(1).map((photo) => (
            <img
              key={photo.storagePath}
              src={photo.url}
              alt=""
              className="aspect-square rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="flex items-center gap-2">
              {property.isVerified && (
                <Badge className="bg-verified text-verified-foreground gap-1">
                  <ShieldCheck className="size-3" />
                  Verified
                </Badge>
              )}
              <Badge variant="outline" className="capitalize">
                {property.propertyType}
              </Badge>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{property.title}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
              <MapPin className="size-3.5" />
              {property.location.address}, {property.location.suburb}, {property.location.city}
            </p>
          </div>

          <div className="flex items-center gap-6 border-y py-4 text-sm">
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-4" />
              {property.bedrooms} bed
            </span>
            <span className="flex items-center gap-1.5">
              <Bath className="size-4" />
              {property.bathrooms} bath
            </span>
            {property.sizeSqm && (
              <span className="flex items-center gap-1.5">
                <Ruler className="size-4" />
                {property.sizeSqm} m²
              </span>
            )}
          </div>

          <div>
            <h2 className="font-medium">Description</h2>
            <p className="text-muted-foreground mt-2 text-sm whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {property.amenities.length > 0 && (
            <div>
              <h2 className="font-medium">Amenities</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary">
                    {amenityOptions.find((a) => a.value === amenity)?.label ?? amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-semibold">
                {property.currency} {property.rentAmount.toLocaleString()}
                <span className="text-muted-foreground text-sm font-normal">
                  {' '}
                  / {property.rentFrequency === 'monthly' ? 'month' : 'week'}
                </span>
              </p>
              {property.depositAmount != null && (
                <p className="text-muted-foreground mt-1 text-sm">
                  Deposit: {property.currency} {property.depositAmount.toLocaleString()}
                </p>
              )}
              <div className="mt-4 space-y-2">
                <Button className="w-full" onClick={() => onComingSoon('Booking a viewing')}>
                  <CalendarClock className="size-4" />
                  Book a viewing
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onComingSoon('Messaging')}
                >
                  <MessageCircle className="size-4" />
                  Message {property.ownerType === 'agency' ? 'agency' : 'owner'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <OwnerCard ownerType={property.ownerType} ownerId={property.ownerId} />
        </div>
      </div>
    </div>
  )
}
