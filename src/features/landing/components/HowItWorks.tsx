import { motion } from 'framer-motion'
import { Search, CalendarCheck, KeyRound } from 'lucide-react'
import { VIEWING_FEE_USD } from '@/config/constants'

const STEPS = [
  {
    icon: Search,
    title: 'Search verified listings',
    description:
      'Filter by suburb, price, and property type — every listing is checked before it goes live.',
  },
  {
    icon: CalendarCheck,
    title: `Book a viewing for $${VIEWING_FEE_USD}`,
    description:
      "Pay a small refundable commitment fee to lock in a time — refunded if it's not the one, kept only if you rent. The owner confirms availability before you travel.",
  },
  {
    icon: KeyRound,
    title: 'Message, agree, move in',
    description:
      'Chat with the landlord or agency in-app, agree on terms, and move in with confidence.',
  },
]

export function HowItWorks() {
  return (
    <section className="bg-secondary/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How it works
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative text-center sm:text-left"
            >
              <div className="flex items-center justify-center gap-3 sm:justify-start">
                <span className="bg-brand text-brand-foreground flex size-11 items-center justify-center rounded-full font-semibold">
                  {index + 1}
                </span>
                <span className="bg-background text-brand flex size-9 items-center justify-center rounded-full border">
                  <step.icon className="size-4.5" />
                </span>
              </div>
              <h3 className="mt-4 font-medium">{step.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
