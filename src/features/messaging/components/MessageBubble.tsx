import { cn } from '@/lib/utils'
import type { Message } from '@/types/message'

export function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
        )}
      >
        <p className="whitespace-pre-line">{message.text}</p>
        <p
          className={cn(
            'mt-0.5 text-[10px]',
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {message.sentAt?.toDate().toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
