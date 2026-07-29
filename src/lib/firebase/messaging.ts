import { getMessaging, isSupported, type Messaging } from 'firebase/messaging'
import { firebaseApp } from '@/lib/firebase/config'

let messagingPromise: Promise<Messaging | null> | null = null

/**
 * FCM requires a Service Worker and isn't available in every browser
 * (e.g. Safari < 16, in-app webviews) — isSupported() guards against that.
 */
export function getMessagingInstance() {
  if (!messagingPromise) {
    messagingPromise = isSupported().then((supported) =>
      supported ? getMessaging(firebaseApp) : null
    )
  }
  return messagingPromise
}
