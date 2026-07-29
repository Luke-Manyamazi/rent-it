import { ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function scoreLabel(score: number) {
  if (score >= 50) return { text: 'Excellent', color: 'text-verified' }
  if (score >= 20) return { text: 'Good', color: 'text-verified' }
  if (score >= 0) return { text: 'New', color: 'text-muted-foreground' }
  return { text: 'Needs attention', color: 'text-destructive' }
}

export function TrustScoreCard({ score }: { score: number }) {
  const { text, color } = scoreLabel(score)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4.5" />
          Trust score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold">{score}</span>
          <span className={`text-sm font-medium ${color}`}>{text}</span>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          Confirming viewings on time and keeping listings accurate raises
          your score. Missing a Verified Before You Travel confirmation
          lowers it — repeated misses can lead to listing suspension.
        </p>
      </CardContent>
    </Card>
  )
}
