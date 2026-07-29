export const STORAGE_BUCKETS = {
  propertyPhotos: 'property-photos',
  avatars: 'avatars',
  agencyLogos: 'agency-logos',
  verificationDocuments: 'verification-documents',
  chatAttachments: 'chat-attachments',
} as const

/**
 * Path conventions mirror the RLS policies in supabase/storage-policies.sql —
 * changing these requires updating that file too. Folder segments that embed
 * a Firebase UID (avatarPath, verificationDocumentPath, landlord branch of
 * propertyPhotoPath) are what the RLS policies match against
 * `auth.jwt()->>'sub'`.
 */
export function avatarPath(uid: string, fileName: string) {
  return `${uid}/${fileName}`
}

export function verificationDocumentPath(uid: string, fileName: string) {
  return `${uid}/${fileName}`
}

/**
 * Agency-owned listings intentionally omit a per-member RLS check for now —
 * see ARCHITECTURE.md "Storage authorization" for why, and what unlocks it
 * (Phase 11 Cloud Functions or a synced membership table).
 */
export function propertyPhotoPath(
  ownerType: 'landlord' | 'agency',
  ownerId: string,
  propertyId: string,
  fileName: string
) {
  return `${ownerType}/${ownerId}/${propertyId}/${fileName}`
}

export function agencyLogoPath(agencyOwnerUid: string, fileName: string) {
  return `${agencyOwnerUid}/${fileName}`
}

export function chatAttachmentPath(conversationId: string, fileName: string) {
  return `${conversationId}/${fileName}`
}
