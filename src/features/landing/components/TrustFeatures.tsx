import { motion } from 'framer-motion'
import { ShieldCheck, BadgeCheck, MessageCircle, Wallet } from 'lucide-react'

const FEATURES = [
  {
    icon: BadgeCheck,
    title: 'Verified listings',
    description:
      'Every property and landlord goes through verification — no more fake listings wasting your time.',
  },
  {
    icon: Wallet,
    title: 'No viewing fees',
    description:
      'Browse and book viewings for free. No more paying $20+ just to see a property that might already be gone.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Before You Travel',
    description:
      "Owners must confirm a property is still available before your viewing — or the booking auto-cancels and their trust score drops.",
  },
  {
    icon: MessageCircle,
    title: 'Secure in-app messaging',
    description:
      'Talk to landlords and agencies without handing out your number until you\'re ready.',
  },
]

export function TrustFeatures() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Renting, without the guesswork
        </h2>
        <p className="text-muted-foreground mt-3">
          Built to replace unreliable WhatsApp groups and expensive
          in-person-only viewings with something you can actually trust.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="border-border rounded-2xl border p-6"
          >
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-xl">
              <feature.icon className="size-5" />
            </span>
            <h3 className="mt-4 font-medium">{feature.title}</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
