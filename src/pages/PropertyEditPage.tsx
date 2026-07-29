import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { PropertyForm } from '@/features/property/components/PropertyForm'
import type { PhotoItem } from '@/features/property/components/PhotoUploadManager'
import { useProperty, updateProperty, setPropertyPhotos } from '@/features/property/api/properties'
import { uploadPropertyPhoto, deletePropertyPhoto } from '@/features/property/api/photos'
import type { PropertyFormInput, PropertyFormValues } from '@/features/property/schemas'
import type { Property, PropertyPhoto } from '@/types/property'

function PropertyEditForm({ property, basePath }: { property: Property; basePath: string }) {
  const navigate = useNavigate()
  // Lazy initializer runs once at mount — no effect needed to seed this
  // from the loaded property.
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>(() =>
    property.photos.map((photo) => ({
      id: photo.storagePath,
      kind: 'existing' as const,
      previewUrl: photo.url,
      photo,
    }))
  )

  const defaultValues: PropertyFormInput = {
    title: property.title,
    description: property.description,
    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sizeSqm: property.sizeSqm ?? '',
    rentAmount: property.rentAmount,
    currency: property.currency,
    rentFrequency: property.rentFrequency,
    depositAmount: property.depositAmount ?? '',
    availableFrom: property.availableFrom.toDate().toISOString().slice(0, 10),
    amenities: property.amenities,
    address: property.location.address,
    suburb: property.location.suburb,
  }

  async function onSubmit(values: PropertyFormValues) {
    try {
      await updateProperty(property.id, values)

      const removedPhotos = property.photos.filter(
        (photo) => !photoItems.some((item) => item.kind === 'existing' && item.id === photo.storagePath)
      )
      await Promise.all(removedPhotos.map((photo) => deletePropertyPhoto(photo.storagePath)))

      const finalPhotos: PropertyPhoto[] = await Promise.all(
        photoItems.map((item, index) => {
          if (item.kind === 'existing' && item.photo) return { ...item.photo, order: index }
          return uploadPropertyPhoto(property.ownerType, property.ownerId, property.id, item.file!, index)
        })
      )
      await setPropertyPhotos(property.id, finalPhotos)

      toast.success('Listing updated.')
      navigate(basePath)
    } catch {
      toast.error("Couldn't update that listing. Please try again.")
    }
  }

  return (
    <PropertyForm
      defaultValues={defaultValues}
      photoItems={photoItems}
      onPhotoItemsChange={setPhotoItems}
      onSubmit={onSubmit}
      submitLabel="Save changes"
    />
  )
}

export function PropertyEditPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const { property, loading } = useProperty(id)

  const isAgency = profile?.role === 'agency'
  const basePath = isAgency ? '/dashboard/agency/properties' : '/dashboard/landlord/properties'

  if (loading || !property) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Edit listing</h1>
      <div className="mt-6">
        <PropertyEditForm key={property.id} property={property} basePath={basePath} />
      </div>
    </div>
  )
}
