import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { AppNotification, NotificationType } from '@/types/notification'

/**
 * Client-authored, same MVP simplification as elsewhere (see
 * ARCHITECTURE.md): without Cloud Functions, the acting user's own client
 * creates the notification doc for the OTHER party. firestore.rules only
 * requires recipientId != the caller, so content isn't otherwise validated —
 * acceptable since a forged notification can only mislead its one recipient,
 * not cause any data-level harm.
 */
export async function createNotification(
  recipientId: string,
  type: NotificationType,
  title: string,
  body: string,
  data: Record<string, string> = {}
) {
  await addDoc(collection(db, 'notifications'), {
    recipientId,
    type,
    title,
    body,
    data,
    isRead: false,
    createdAt: serverTimestamp(),
  })
}

export async function markNotificationRead(notificationId: string) {
  await updateDoc(doc(db, 'notifications', notificationId), { isRead: true })
}

export async function markAllNotificationsRead(notifications: AppNotification[]) {
  await Promise.all(
    notifications.filter((n) => !n.isRead).map((n) => markNotificationRead(n.id))
  )
}

export async function deleteNotification(notificationId: string) {
  await deleteDoc(doc(db, 'notifications', notificationId))
}

interface NotificationsSnapshot {
  uid: string
  notifications: AppNotification[]
}

export function useNotifications(uid: string | undefined, rowLimit = 50) {
  const [snapshot, setSnapshot] = useState<NotificationsSnapshot | null>(null)

  useEffect(() => {
    if (!uid) return
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(rowLimit)
    )
    return onSnapshot(q, (snap) => {
      setSnapshot({
        uid,
        notifications: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppNotification),
      })
    })
  }, [uid, rowLimit])

  const notifications = uid && snapshot?.uid === uid ? snapshot.notifications : []
  const loading = !!uid && snapshot?.uid !== uid
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return { notifications, loading, unreadCount }
}
