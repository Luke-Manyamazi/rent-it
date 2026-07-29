import { updateProfile as updateFirebaseProfile, type User } from 'firebase/auth'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { supabase } from '@/lib/supabase/config'
import { STORAGE_BUCKETS, avatarPath } from '@/lib/supabase/storage'

export async function updateFullName(user: User, fullName: string) {
  await Promise.all([
    updateFirebaseProfile(user, { displayName: fullName }),
    updateDoc(doc(db, 'users', user.uid), { fullName, updatedAt: serverTimestamp() }),
  ])
}

export async function uploadAvatar(user: User, file: File) {
  const extension = file.name.split('.').pop() ?? 'jpg'
  const path = avatarPath(user.uid, `avatar.${extension}`)

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.avatars)
    .upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) throw uploadError

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKETS.avatars).getPublicUrl(path)
  // Cache-bust so the new photo shows immediately instead of the previous
  // upload's cached response (same path is reused on every re-upload).
  const photoUrl = `${publicUrl}?t=${Date.now()}`

  await Promise.all([
    updateFirebaseProfile(user, { photoURL: photoUrl }),
    updateDoc(doc(db, 'users', user.uid), { photoUrl, updatedAt: serverTimestamp() }),
  ])

  return photoUrl
}
