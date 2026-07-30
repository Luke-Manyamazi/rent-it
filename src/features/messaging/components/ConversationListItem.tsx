import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useProperty } from '@/features/property/api/properties'
import { useAgency } from '@/features/agency/hooks/useAgency'
import { useUserPublicProfile } from '@/features/account/hooks/useUserPublicProfile'
import { otherParticipant } from '@/features/messaging/api/messages'
import type { Conversation } from '@/types/message'

export function ConversationListItem({
  conversation,
  currentUid,
  basePath,
}: {
  conversation: Conversation
  currentUid: string
  basePath: string
}) {
  const { property } = useProperty(conversation.propertyId)
  const otherId = otherParticipant(conversation, currentUid)
  const isAgency = property?.ownerType === 'agency'

  const { profile } = useUserPublicProfile(!isAgency ? otherId : undefined)
  const { agency } = useAgency(isAgency ? otherId : undefined)

  const displayName = isAgency ? agency?.name : profile?.fullName
  const photoUrl = isAgency ? agency?.logoUrl : profile?.photoUrl
  const unread = conversation.unreadCounts[currentUid] ?? 0

  return (
    <Link
      to={`${basePath}/${conversation.id}`}
      className="hover:bg-muted/50 flex items-center gap-3 rounded-xl px-3 py-3"
    >
      <Avatar className="size-10">
        <AvatarImage src={photoUrl ?? undefined} alt={displayName} />
        <AvatarFallback>{displayName?.[0] ?? '?'}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn('truncate text-sm', unread > 0 ? 'font-semibold' : 'font-medium')}>
            {displayName ?? 'Loading…'}
          </p>
          {conversation.lastMessageAt && (
            <span className="text-muted-foreground shrink-0 text-xs">
              {conversation.lastMessageAt.toDate().toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
        <p className="text-muted-foreground truncate text-xs">
          {property?.title ?? 'Listing'}
        </p>
        <p
          className={cn(
            'mt-0.5 truncate text-sm',
            unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
          )}
        >
          {conversation.lastMessageText ?? 'No messages yet'}
        </p>
      </div>
      {unread > 0 && <Badge className="shrink-0">{unread}</Badge>}
    </Link>
  )
}
