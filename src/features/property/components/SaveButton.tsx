import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { doc, onSnapshot } from 'firebase/firestore'
import { Heart } from 'lucide-react'
import { db } from '@/lib/firebase/config'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { saveProperty, unsaveProperty } from '@/features/property/api/saved'

function useIsPropertySaved(uid: string | undefined, propertyId: string) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!uid) return
    return onSnapshot(doc(db, 'users', uid, 'savedProperties', propertyId), (snap) => {
      setSaved(snap.exists())
    })
  }, [uid, propertyId])

  return saved
}

export function SaveButton({ propertyId }: { propertyId: string }) {
  const { firebaseUser } = useAuth()
  const saved = useIsPropertySaved(firebaseUser?.uid, propertyId)
  const [pending, setPending] = useState(false)

  async function onToggle(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (!firebaseUser) {
      toast.error('Log in to save listings.')
      return
    }
    setPending(true)
    try {
      if (saved) {
        await unsaveProperty(firebaseUser.uid, propertyId)
      } else {
        await saveProperty(firebaseUser.uid, propertyId)
      }
    } catch {
      toast.error("Couldn't update your saved listings.")
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      className="size-8 rounded-full shadow-sm"
      onClick={onToggle}
      disabled={pending}
      title={saved ? 'Remove from saved' : 'Save listing'}
    >
      <Heart className={cn('size-4', saved && 'fill-destructive text-destructive')} />
    </Button>
  )
}
