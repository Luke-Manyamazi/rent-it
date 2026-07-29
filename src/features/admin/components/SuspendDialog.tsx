import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function SuspendDialog({
  targetName,
  onSuspend,
}: {
  targetName: string
  onSuspend: (reason: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit() {
    if (!reason.trim()) {
      toast.error('Add a reason for the suspension.')
      return
    }
    setSubmitting(true)
    try {
      await onSuspend(reason.trim())
      toast.success(`${targetName} suspended.`)
      setReason('')
      setOpen(false)
    } catch {
      toast.error("Couldn't suspend. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive">
          <Ban className="size-3.5" />
          Suspend
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspend {targetName}?</DialogTitle>
          <DialogDescription>
            They'll be blocked from taking further action on the platform
            until unsuspended.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Reason</Label>
          <Textarea
            rows={3}
            placeholder="Why is this account being suspended?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={onSubmit} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Suspend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
