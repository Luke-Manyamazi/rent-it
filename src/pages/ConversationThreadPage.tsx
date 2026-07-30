import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useProperty } from '@/features/property/api/properties'
import { useAgency } from '@/features/agency/hooks/useAgency'
import { useUserPublicProfile } from '@/features/account/hooks/useUserPublicProfile'
import {
  useConversation,
  markConversationRead,
} from '@/features/messaging/api/conversations'
import { useMessages, otherParticipant } from '@/features/messaging/api/messages'
import { MessageBubble } from '@/features/messaging/components/MessageBubble'
import { MessageComposer } from '@/features/messaging/components/MessageComposer'
import { NotFoundPage } from '@/pages/NotFoundPage'

const BASE_PATH_BY_ROLE: Record<string, string> = {
  tenant: '/dashboard/tenant/messages',
  landlord: '/dashboard/landlord/messages',
  agency: '/dashboard/agency/messages',
}

export function ConversationThreadPage() {
  const { id } = useParams<{ id: string }>()
  const { firebaseUser, profile } = useAuth()
  const { conversation, loading, denied } = useConversation(id)
  const { messages } = useMessages(id)
  const bottomRef = useRef<HTMLDivElement>(null)
  const basePath = BASE_PATH_BY_ROLE[profile?.role ?? 'tenant']

  const otherId = conversation && firebaseUser ? otherParticipant(conversation, firebaseUser.uid) : undefined
  const { property } = useProperty(conversation?.propertyId)
  const isAgency = property?.ownerType === 'agency'
  const { profile: otherProfile } = useUserPublicProfile(!isAgency ? otherId : undefined)
  const { agency } = useAgency(isAgency ? otherId : undefined)
  const displayName = isAgency ? agency?.name : otherProfile?.fullName
  const photoUrl = isAgency ? agency?.logoUrl : otherProfile?.photoUrl

  useEffect(() => {
    if (id && firebaseUser) markConversationRead(id, firebaseUser.uid)
  }, [id, firebaseUser])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  if (denied) return <NotFoundPage />
  if (loading || !conversation || !firebaseUser) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="border-border bg-background flex h-[calc(100vh-10rem)] flex-col rounded-xl border">
      <div className="flex items-center gap-3 border-b p-3">
        <Link to={basePath} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        <Avatar className="size-8">
          <AvatarImage src={photoUrl ?? undefined} alt={displayName} />
          <AvatarFallback>{displayName?.[0] ?? '?'}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{displayName ?? 'Loading…'}</p>
          {property && (
            <Link
              to={`/listings/${property.id}`}
              className="text-muted-foreground truncate text-xs hover:underline"
            >
              {property.title}
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === firebaseUser.uid}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {otherId && (
        <MessageComposer
          conversationId={conversation.id}
          senderId={firebaseUser.uid}
          otherParticipantId={otherId}
        />
      )}
    </div>
  )
}
