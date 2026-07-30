import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Conversation, Message } from '@/types/message'

export async function sendMessage(
  conversationId: string,
  senderId: string,
  otherParticipantId: string,
  text: string
) {
  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    conversationId,
    senderId,
    text,
    attachmentUrls: [],
    sentAt: serverTimestamp(),
    readBy: [senderId],
  })

  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessageText: text,
    lastMessageSenderId: senderId,
    lastMessageAt: serverTimestamp(),
    [`unreadCounts.${otherParticipantId}`]: increment(1),
    updatedAt: serverTimestamp(),
  })
}

export function otherParticipant(conversation: Conversation, uid: string) {
  return conversation.participantIds.find((id) => id !== uid)
}

interface MessagesSnapshot {
  conversationId: string
  messages: Message[]
}

export function useMessages(conversationId: string | undefined) {
  const [snapshot, setSnapshot] = useState<MessagesSnapshot | null>(null)

  useEffect(() => {
    if (!conversationId) return
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('sentAt', 'asc')
    )
    return onSnapshot(q, (snap) => {
      setSnapshot({
        conversationId,
        messages: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Message),
      })
    })
  }, [conversationId])

  const messages =
    conversationId && snapshot?.conversationId === conversationId ? snapshot.messages : []
  const loading = !!conversationId && snapshot?.conversationId !== conversationId
  return { messages, loading }
}
