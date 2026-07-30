import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, KeyRound, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VIEWING_FEE_USD } from '@/config/constants'

export function AudienceSplit() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="bg-card border-border flex flex-col rounded-2xl border p-8"
        >
          <span className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-xl">
            <KeyRound className="size-5" />
          </span>
          <h3 className="mt-5 text-xl font-semibold">Looking for a home?</h3>
          <p className="text-muted-foreground mt-2 flex-1 text-sm">
            Browse verified rentals in Masvingo and book a viewing for just $
            {VIEWING_FEE_USD} — refunded if it's not a match. Message
            landlords directly, without the $40 it used to cost to see five
            houses.
          </p>
          <Button asChild className="mt-6 w-fit gap-1.5">
            <Link to="/listings">
              Browse rentals <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card border-border flex flex-col rounded-2xl border p-8"
        >
          <span className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-xl">
            <Building2 className="size-5" />
          </span>
          <h3 className="mt-5 text-xl font-semibold">
            Have a property to list?
          </h3>
          <p className="text-muted-foreground mt-2 flex-1 text-sm">
            Reach verified tenants directly, manage bookings and messages in
            one place, and build a trust score that gets your listings seen —
            every viewing request comes with a paid commitment, so you spend
            less time on tenants who were never going to show.
          </p>
          <Button asChild variant="outline" className="mt-6 w-fit gap-1.5">
            <Link to="/list-property">
              List your property <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
