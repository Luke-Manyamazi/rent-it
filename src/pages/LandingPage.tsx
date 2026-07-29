import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { APP_NAME, APP_TAGLINE } from '@/config/constants'

export function LandingPage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
      >
        {APP_TAGLINE}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        className="text-muted-foreground max-w-xl text-lg"
      >
        {APP_NAME} connects verified tenants with verified landlords and
        agencies — no fake listings, no viewing fees, no wasted trips.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Button size="lg" asChild>
          <Link to="/listings">Browse Rentals</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link to="/list-property">List Your Property</Link>
        </Button>
      </motion.div>
    </section>
  )
}
