import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { VerificationStatus } from '@/types/user'

const OPTIONS: { value: VerificationStatus; label: string }[] = [
  { value: 'unverified', label: 'Unverified' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
]

export function VerificationStatusSelect({
  value,
  onChange,
}: {
  value: VerificationStatus
  onChange: (status: VerificationStatus) => Promise<void>
}) {
  async function handleChange(next: string) {
    try {
      await onChange(next as VerificationStatus)
      toast.success('Verification status updated.')
    } catch {
      toast.error("Couldn't update verification status.")
    }
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger size="sm" className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
