import { supabase } from '@/lib/supabase/config'
import { STORAGE_BUCKETS, propertyPhotoPath } from '@/lib/supabase/storage'
import type { PropertyPhoto } from '@/types/property'

export async function uploadPropertyPhoto(
  ownerType: 'landlord' | 'agency',
  ownerId: string,
  propertyId: string,
  file: File,
  order: number
): Promise<PropertyPhoto> {
  const extension = file.name.split('.').pop() ?? 'jpg'
  const storagePath = propertyPhotoPath(
    ownerType,
    ownerId,
    propertyId,
    `${order}-${Date.now()}.${extension}`
  )

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.propertyPhotos)
    .upload(storagePath, file, { contentType: file.type })
  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKETS.propertyPhotos).getPublicUrl(storagePath)

  return { url: publicUrl, storagePath, order }
}

export async function deletePropertyPhoto(storagePath: string) {
  await supabase.storage.from(STORAGE_BUCKETS.propertyPhotos).remove([storagePath])
}
