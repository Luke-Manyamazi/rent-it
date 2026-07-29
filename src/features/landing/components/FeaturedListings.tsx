import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { usePublicProperties } from '@/features/property/api/properties'
import { PropertyCard } from '@/features/property/components/PropertyCard'

/** Hidden entirely until there are real listings — Phase 4 deliberately
 *  avoided showing fabricated sample properties on a real product. */
export function FeaturedListings() {
  const { properties, loading } = usePublicProperties(6)

  if (!loading && properties.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between"
      >
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Recent listings
          </h2>
          <p className="text-muted-foreground mt-2">
            Freshly listed, verified rentals in Masvingo.
          </p>
        </div>
        <Link
          to="/listings"
          className="text-brand hidden items-center gap-1 text-sm font-medium sm:flex"
        >
          View all <ArrowRight className="size-4" />
        </Link>
      </motion.div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
          >
            <PropertyCard property={property} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
