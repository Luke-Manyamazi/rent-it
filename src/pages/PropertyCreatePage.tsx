import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { PropertyForm } from '@/features/property/components/PropertyForm'
import type { PhotoItem } from '@/features/property/components/PhotoUploadManager'
import { createDraftProperty, setPropertyPhotos, publishProperty } from '@/features/property/api/properties'
import { uploadPropertyPhoto } from '@/features/property/api/photos'
import { checkAgencyListingLimit } from '@/features/subscription/api/subscription'
import type { PropertyFormInput, PropertyFormValues } from '@/features/property/schemas'

const EMPTY_VALUES: PropertyFormInput = {
  title: '',
  description: '',
  propertyType: 'house',
  bedrooms: 1,
  bathrooms: 1,
  sizeSqm: '',
  rentAmount: 0,
  currency: 'USD',
  rentFrequency: 'monthly',
  depositAmount: '',
  availableFrom: new Date().toISOString().slice(0, 10),
  amenities: [],
  address: '',
  suburb: '',
}

export function PropertyCreatePage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([])

  const isAgency = profile?.role === 'agency'
  const ownerId = isAgency ? profile?.agencyId : undefined
  const basePath = isAgency ? '/dashboard/agency/properties' : '/dashboard/landlord/properties'

  async function onSubmit(values: PropertyFormValues) {
    const resolvedOwnerId = isAgency ? ownerId : profile?.id
    if (!resolvedOwnerId || !profile) {
      toast.error('Your profile is still loading — try again in a moment.')
      return
    }
    const ownerType = isAgency ? 'agency' : 'landlord'

    if (isAgency) {
      const { allowed, limit } = await checkAgencyListingLimit(resolvedOwnerId)
      if (!allowed) {
        toast.error(
          `You've reached your plan's limit of ${limit} active listings. Upgrade to add more.`,
          {
            action: {
              label: 'Upgrade',
              onClick: () => navigate('/dashboard/agency/subscription'),
            },
          }
        )
        return
      }
    }

    try {
      const propertyId = await createDraftProperty({
        ...values,
        ownerId: resolvedOwnerId,
        ownerType,
      })

      const uploaded = await Promise.all(
        photoItems.map((item, index) => {
          if (item.kind === 'existing' && item.photo) return item.photo
          return uploadPropertyPhoto(ownerType, resolvedOwnerId, propertyId, item.file!, index)
        })
      )
      if (uploaded.length > 0) {
        await setPropertyPhotos(propertyId, uploaded)
      }

      await publishProperty(propertyId, resolvedOwnerId, ownerType)
      toast.success('Listing published.')
      navigate(basePath)
    } catch {
      toast.error("Couldn't create that listing. Please try again.")
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">New listing</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Fill in the details tenants need to know.
      </p>
      <div className="mt-6">
        <PropertyForm
          defaultValues={EMPTY_VALUES}
          photoItems={photoItems}
          onPhotoItemsChange={setPhotoItems}
          onSubmit={onSubmit}
          submitLabel="Publish listing"
        />
      </div>
    </div>
  )
}
