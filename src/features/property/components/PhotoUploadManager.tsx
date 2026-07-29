import { useRef } from 'react'
import { toast } from 'sonner'
import { ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PropertyPhoto } from '@/types/property'

export interface PhotoItem {
  /** storagePath for existing photos, a random client id for pending new ones. */
  id: string
  kind: 'existing' | 'new'
  previewUrl: string
  photo?: PropertyPhoto
  file?: File
}

const MAX_PHOTOS = 10
const MAX_FILE_SIZE_MB = 10

export function PhotoUploadManager({
  items,
  onChange,
}: {
  items: PhotoItem[]
  onChange: (items: PhotoItem[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function onFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0) return

    if (items.length + files.length > MAX_PHOTOS) {
      toast.error(`You can add up to ${MAX_PHOTOS} photos.`)
      return
    }

    const newItems: PhotoItem[] = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} isn't an image.`)
        continue
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} is over ${MAX_FILE_SIZE_MB}MB.`)
        continue
      }
      newItems.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        kind: 'new',
        previewUrl: URL.createObjectURL(file),
        file,
      })
    }
    onChange([...items, ...newItems])
  }

  function onRemove(id: string) {
    onChange(items.filter((item) => item.id !== id))
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="group bg-muted relative aspect-square overflow-hidden rounded-lg">
            <img src={item.previewUrl} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="bg-background/80 absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {items.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="border-border text-muted-foreground hover:bg-muted/50 flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs"
          >
            <ImagePlus className="size-5" />
            Add photos
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFilesSelected}
      />
      {items.length === 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-4" />
          Add photos
        </Button>
      )}
    </div>
  )
}
