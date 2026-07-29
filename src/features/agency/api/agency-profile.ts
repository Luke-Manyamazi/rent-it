import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { supabase } from '@/lib/supabase/config'
import { STORAGE_BUCKETS, agencyLogoPath } from '@/lib/supabase/storage'
import type { Agency } from '@/types/agency'

export type AgencyProfileUpdate = Pick<
  Agency,
  'name' | 'description' | 'contactPhone' | 'contactEmail' | 'website' | 'address' | 'licenseNumber'
>

export async function updateAgencyProfile(agencyId: string, updates: AgencyProfileUpdate) {
  await updateDoc(doc(db, 'agencies', agencyId), { ...updates, updatedAt: serverTimestamp() })
}

export async function uploadAgencyLogo(agencyOwnerUid: string, agencyId: string, file: File) {
  const extension = file.name.split('.').pop() ?? 'jpg'
  const path = agencyLogoPath(agencyOwnerUid, `logo.${extension}`)

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.agencyLogos)
    .upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) throw uploadError

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKETS.agencyLogos).getPublicUrl(path)
  const logoUrl = `${publicUrl}?t=${Date.now()}`

  await updateDoc(doc(db, 'agencies', agencyId), { logoUrl, updatedAt: serverTimestamp() })
  return logoUrl
}
