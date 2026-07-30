import { MessageCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useConversationsForUser } from '@/features/messaging/api/conversations'
import { ConversationListItem } from '@/features/messaging/components/ConversationListItem'

const BASE_PATH_BY_ROLE: Record<string, string> = {
  tenant: '/dashboard/tenant/messages',
  landlord: '/dashboard/landlord/messages',
  agency: '/dashboard/agency/messages',
}

export function ConversationListPage() {
  const { firebaseUser, profile } = useAuth()
  const { conversations, loading } = useConversationsForUser(firebaseUser?.uid)
  const basePath = BASE_PATH_BY_ROLE[profile?.role ?? 'tenant']

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Conversations tied to your listings and viewing requests.
      </p>

      {loading ? (
        <div className="mt-6 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
            <MessageCircle className="size-5" />
          </span>
          <p className="font-medium">No conversations yet</p>
          <p className="text-muted-foreground max-w-xs text-sm">
            Messages about a listing or viewing request will show up here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-1">
          {conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              currentUid={firebaseUser!.uid}
              basePath={basePath}
            />
          ))}
        </div>
      )}
    </div>
  )
}
