import type { Timestamp } from 'firebase/firestore'

export interface Conversation {
  id: string
  /** Always exactly 2 participants — a tenant and a landlord/agency contact. */
  participantIds: string[]
  propertyId: string
  bookingId: string | null
  lastMessageText: string | null
  lastMessageSenderId: string | null
  lastMessageAt: Timestamp | null
  /** Unread count per participant, keyed by userId. */
  unreadCounts: Record<string, number>
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  attachmentUrls: string[]
  sentAt: Timestamp
  readBy: string[]
}
