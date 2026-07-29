import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Building2, Camera, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { uploadAgencyLogo } from '@/features/agency/api/agency-profile'
import type { Agency } from '@/types/agency'

const MAX_FILE_SIZE_MB = 5

export function AgencyLogoUploader({ agency }: { agency: Agency }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

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
      await uploadAgencyLogo(agency.ownerId, agency.id, file)
      toast.success('Logo updated.')
    } catch {
      toast.error(
        "Couldn't upload your logo. If this keeps happening, storage may not be fully configured yet."
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="size-16 rounded-xl">
          <AvatarImage src={agency.logoUrl ?? undefined} alt={agency.name} />
          <AvatarFallback className="rounded-xl">
            <Building2 className="size-6" />
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="bg-background/70 absolute inset-0 flex items-center justify-center rounded-xl">
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
          Change logo
        </Button>
      </div>
    </div>
  )
}
