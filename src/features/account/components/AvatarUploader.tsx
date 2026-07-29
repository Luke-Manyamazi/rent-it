import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Camera, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { uploadAvatar } from '@/features/account/api/profile'

const MAX_FILE_SIZE_MB = 5

export function AvatarUploader() {
  const { firebaseUser, profile } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const initials = profile?.fullName
    ?.split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !firebaseUser) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.')
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_FILE_SIZE_MB}MB.`)
      return
    }

    setUploading(true)
    try {
      await uploadAvatar(firebaseUser, file)
      toast.success('Photo updated.')
    } catch {
      toast.error(
        "Couldn't upload your photo. If this keeps happening, storage may not be fully configured yet."
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="size-16">
          <AvatarImage src={profile?.photoUrl ?? undefined} alt={profile?.fullName} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="bg-background/70 absolute inset-0 flex items-center justify-center rounded-full">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="size-4" />
          Change photo
        </Button>
      </div>
    </div>
  )
}
