import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { findOrCreateConversation } from '@/features/messaging/api/conversations'
import type { Property } from '@/types/property'

export function MessageOwnerButton({ property }: { property: Property }) {
  const navigate = useNavigate()
  const { firebaseUser, profile } = useAuth()
  const [loading, setLoading] = useState(false)

  async function onClick() {
    if (!firebaseUser) {
      toast.error('Log in as a tenant to message the owner.')
      return
    }
    if (profile && profile.role !== 'tenant') {
      toast.error('Only tenants can message listing owners.')
      return
    }
    setLoading(true)
    try {
      const conversationId = await findOrCreateConversation(
        firebaseUser.uid,
        property.ownerId,
        property.id
      )
      navigate(`/dashboard/tenant/messages/${conversationId}`)
    } catch {
      toast.error("Couldn't start that conversation. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" className="w-full" onClick={onClick} disabled={loading}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}
      Message {property.ownerType === 'agency' ? 'agency' : 'owner'}
    </Button>
  )
}
