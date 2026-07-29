import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export async function removeAgencyMember(agencyId: string, userId: string) {
  await deleteDoc(doc(db, 'agencies', agencyId, 'members', userId))
}
