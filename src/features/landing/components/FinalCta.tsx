import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function FinalCta() {
  const { firebaseUser } = useAuth()

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="bg-brand text-brand-foreground relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16"
      >
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Find your next home. Without the hassle.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm opacity-90 sm:text-base">
          Join RentIT Masvingo today — it's free to browse, free to book a
          viewing, and built to be trusted.
        </p>
        {!firebaseUser && (
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/signup">Create your account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-brand-foreground/30 bg-transparent text-inherit hover:bg-white/10"
              asChild
            >
              <Link to="/listings">Browse rentals</Link>
            </Button>
          </div>
        )}
      </motion.div>
    </section>
  )
}
