import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  getDocs,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Conversation } from '@/types/message'

/** One conversation per (tenant, property) pair — asking about two
 *  different listings from the same owner are deliberately separate
 *  threads, since they're different rental decisions. */
export async function findOrCreateConversation(
  tenantId: string,
  ownerId: string,
  propertyId: string
) {
  const existingQuery = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', tenantId),
    where('propertyId', '==', propertyId)
  )
  const existingSnap = await getDocs(existingQuery)
  const existing = existingSnap.docs.find((d) => d.data().participantIds.includes(ownerId))
  if (existing) return existing.id

  const ref = await addDoc(collection(db, 'conversations'), {
    participantIds: [tenantId, ownerId],
    propertyId,
    bookingId: null,
    lastMessageText: null,
    lastMessageSenderId: null,
    lastMessageAt: null,
    unreadCounts: { [tenantId]: 0, [ownerId]: 0 },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function markConversationRead(conversationId: string, uid: string) {
  await updateDoc(doc(db, 'conversations', conversationId), {
    [`unreadCounts.${uid}`]: 0,
  })
}

interface ConversationsSnapshot {
  uid: string
  conversations: Conversation[]
}

export function useConversationsForUser(uid: string | undefined) {
  const [snapshot, setSnapshot] = useState<ConversationsSnapshot | null>(null)

  useEffect(() => {
    if (!uid) return
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', uid),
      orderBy('updatedAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setSnapshot({
        uid,
        conversations: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Conversation),
      })
    })
  }, [uid])

  const conversations = uid && snapshot?.uid === uid ? snapshot.conversations : []
  const loading = !!uid && snapshot?.uid !== uid
  return { conversations, loading }
}

interface ConversationSnapshot {
  conversationId: string
  conversation: Conversation | null
  /** Set on permission-denied — e.g. someone navigating directly to a
   *  conversation URL they're not a participant in. */
  denied: boolean
}

export function useConversation(conversationId: string | undefined) {
  const [snapshot, setSnapshot] = useState<ConversationSnapshot | null>(null)

  useEffect(() => {
    if (!conversationId) return
    return onSnapshot(
      doc(db, 'conversations', conversationId),
      (snap) => {
        setSnapshot({
          conversationId,
          conversation: snap.exists() ? ({ id: snap.id, ...snap.data() } as Conversation) : null,
          denied: false,
        })
      },
      () => {
        setSnapshot({ conversationId, conversation: null, denied: true })
      }
    )
  }, [conversationId])

  const conversation =
    conversationId && snapshot?.conversationId === conversationId ? snapshot.conversation : null
  const denied =
    !!conversationId && snapshot?.conversationId === conversationId ? snapshot.denied : false
  const loading = !!conversationId && snapshot?.conversationId !== conversationId
  return { conversation, loading, denied }
}
