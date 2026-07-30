import { PAYMENT_METHODS } from '@/config/plans'
import type { PaymentMethod } from '@/types/subscription'

export function PaymentInstructions({ method }: { method: PaymentMethod }) {
  const info = PAYMENT_METHODS[method]
  return (
    <div className="bg-muted/50 rounded-lg border p-3 text-sm">
      <p className="font-medium">{info.label} payment details</p>
      <ul className="text-muted-foreground mt-1.5 space-y-0.5">
        {info.instructions.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  )
}
