import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLANS, PAID_PLAN_TIERS } from '@/config/plans'
import type { SubscriptionTier } from '@/types/agency'

export function PlanPicker({
  value,
  onChange,
}: {
  value: SubscriptionTier
  onChange: (tier: SubscriptionTier) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PAID_PLAN_TIERS.map((tier) => {
        const plan = PLANS[tier]
        const selected = value === tier
        return (
          <button
            key={tier}
            type="button"
            onClick={() => onChange(tier)}
            className={cn(
              'rounded-lg border p-4 text-left transition-colors',
              selected ? 'border-brand bg-brand/5' : 'border-border hover:bg-muted/50'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{plan.name}</span>
              {selected && <Check className="text-brand size-4" />}
            </div>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              ${plan.priceUsd}
              <span className="text-muted-foreground text-sm font-normal">/mo</span>
            </p>
            <ul className="text-muted-foreground mt-2 space-y-1 text-xs">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </button>
        )
      })}
    </div>
  )
}
