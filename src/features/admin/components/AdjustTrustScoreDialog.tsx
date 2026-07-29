import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { adjustTrustScore } from '@/features/trust-score/api/adjust-trust-score'

export function AdjustTrustScoreDialog({
  ownerType,
  ownerId,
  ownerName,
}: {
  ownerType: 'landlord' | 'agency'
  ownerId: string
  ownerName: string
}) {
  const [open, setOpen] = useState(false)
  const [delta, setDelta] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit() {
    const parsedDelta = Number(delta)
    if (!Number.isFinite(parsedDelta) || parsedDelta === 0) {
      toast.error('Enter a non-zero number.')
      return
    }
    if (!note.trim()) {
      toast.error('Add a short note explaining the adjustment.')
      return
    }
    setSubmitting(true)
    try {
      await adjustTrustScore(ownerType, ownerId, parsedDelta, note.trim())
      toast.success('Trust score adjusted.')
      setDelta('')
      setNote('')
      setOpen(false)
    } catch {
      toast.error("Couldn't adjust the trust score. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <TrendingUp className="size-3.5" />
          Adjust score
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust trust score</DialogTitle>
          <DialogDescription>
            Manually adjust {ownerName}'s trust score. This is logged as a
            manual admin adjustment in their history.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Adjustment</Label>
            <Input
              type="number"
              placeholder="e.g. 10 or -10"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Note</Label>
            <Textarea
              rows={2}
              placeholder="Why is this being adjusted?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Apply adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
