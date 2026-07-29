import { motion } from 'framer-motion'
import { CalendarClock, CheckCircle2, XCircle, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export function VerifiedBeforeYouTravel() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="border-verified/30 bg-verified/10 text-verified inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
            Our Masvingo difference
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Never waste transport money on a property that's already gone
          </h2>
          <p className="text-muted-foreground mt-4">
            Before every viewing appointment, the owner or agency must
            confirm the property is still available. If they don't confirm
            in time, the booking is automatically cancelled — and their
            trust score takes a hit.
          </p>

          <ul className="mt-6 space-y-4">
            <li className="flex gap-3">
              <CheckCircle2 className="text-verified mt-0.5 size-5 shrink-0" />
              <span className="text-sm">
                <strong className="font-medium">Confirmed:</strong> the owner
                reconfirms availability before your viewing — travel with
                confidence.
              </span>
            </li>
            <li className="flex gap-3">
              <XCircle className="text-destructive mt-0.5 size-5 shrink-0" />
              <span className="text-sm">
                <strong className="font-medium">Not confirmed in time:</strong>{' '}
                the booking auto-cancels before you leave home — you're
                notified immediately, no trip wasted.
              </span>
            </li>
            <li className="flex gap-3">
              <TrendingDown className="mt-0.5 size-5 shrink-0 text-amber-500" />
              <span className="text-sm">
                <strong className="font-medium">Repeated failures:</strong>{' '}
                lower the owner's trust score and can lead to their listing
                being suspended.
              </span>
            </li>
          </ul>

          <Button asChild className="mt-8">
            <Link to="/verified-before-you-travel">Learn more</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="border-border bg-card rounded-2xl border p-6 shadow-sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border p-4">
              <span className="bg-brand/10 text-brand flex size-9 shrink-0 items-center justify-center rounded-lg">
                <CalendarClock className="size-4.5" />
              </span>
              <div className="text-sm">
                <p className="font-medium">Viewing requested</p>
                <p className="text-muted-foreground">Tomorrow, 2:00 PM</p>
              </div>
            </div>

            <div className="ml-4 h-6 w-px bg-border" />

            <div className="border-verified/30 bg-verified/5 flex items-center gap-3 rounded-xl border p-4">
              <span className="bg-verified text-verified-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                <CheckCircle2 className="size-4.5" />
              </span>
              <div className="text-sm">
                <p className="font-medium">Owner confirmed availability</p>
                <p className="text-muted-foreground">18 hours before viewing</p>
              </div>
            </div>

            <div className="ml-4 h-6 w-px bg-border" />

            <div className="flex items-center gap-3 rounded-xl border p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-500/10 text-neutral-500">
                <CheckCircle2 className="size-4.5" />
              </span>
              <div className="text-sm">
                <p className="font-medium">Verified Before You Travel ✓</p>
                <p className="text-muted-foreground">Go with confidence</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
