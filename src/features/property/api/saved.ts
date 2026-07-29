import { deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export async function saveProperty(uid: string, propertyId: string) {
  await setDoc(doc(db, 'users', uid, 'savedProperties', propertyId), {
    propertyId,
    savedAt: serverTimestamp(),
  })
}

export async function unsaveProperty(uid: string, propertyId: string) {
  await deleteDoc(doc(db, 'users', uid, 'savedProperties', propertyId))
}
