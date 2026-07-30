import { useState } from 'react'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { sendMessage } from '@/features/messaging/api/messages'

export function MessageComposer({
  conversationId,
  senderId,
  otherParticipantId,
}: {
  conversationId: string
  senderId: string
  otherParticipantId: string
}) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  async function onSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    setSending(true)
    try {
      await sendMessage(conversationId, senderId, otherParticipantId, trimmed)
      setText('')
    } catch {
      toast.error("Couldn't send that message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex items-end gap-2 border-t p-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a message…"
        rows={1}
        className="max-h-32 min-h-9 flex-1 resize-none"
      />
      <Button size="icon" onClick={onSend} disabled={sending || !text.trim()}>
        <Send className="size-4" />
      </Button>
    </div>
  )
}
