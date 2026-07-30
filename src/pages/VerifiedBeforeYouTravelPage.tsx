import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CalendarClock, CheckCircle2, XCircle, TrendingDown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CONFIRMATION_WINDOW_HOURS } from '@/features/booking/api/bookings'
import { VIEWING_FEE_USD } from '@/config/constants'

// Suspension threshold lives in scheduled-jobs/api/sweep-bookings.ts
// (SUSPENSION_STRIKE_THRESHOLD) — a separate deployable, so this number is a
// hardcoded literal here. Keep the two in sync manually if it ever changes.
const SUSPENSION_STRIKE_THRESHOLD = 3

const STEPS = [
  {
    icon: CalendarClock,
    title: 'You request a viewing',
    description: `A $${VIEWING_FEE_USD} refundable commitment fee books your slot — just pick a time that works for you.`,
  },
  {
    icon: CheckCircle2,
    title: 'The owner reconfirms availability',
    description: `Within ${CONFIRMATION_WINDOW_HOURS} hours of your viewing, the owner or agency must confirm the property is still available.`,
  },
  {
    icon: CheckCircle2,
    title: 'You travel with confidence',
    description: 'Once confirmed, you get a "Verified Before You Travel ✓" notification and head over knowing the listing is real and available.',
  },
]

const FAQS = [
  {
    question: 'What happens if the owner doesn’t confirm in time?',
    answer:
      'The booking is automatically cancelled before your viewing time, and you’re notified immediately — no wasted trip, no wasted transport money.',
  },
  {
    question: 'What happens to the owner when that happens?',
    answer: `Every missed confirmation counts against the owner's trust score. After ${SUSPENSION_STRIKE_THRESHOLD} strikes, their listings can be suspended from the platform.`,
  },
  {
    question: 'Does this cost me anything?',
    answer: `Booking a viewing costs a refundable $${VIEWING_FEE_USD} commitment fee, paid via EcoCash or Paynow — refunded if you view and it's not the one, kept only if you go on to rent. The Verified Before You Travel confirmation itself doesn't add any extra cost.`,
  },
  {
    question: 'Where do I see confirmation status?',
    answer:
      'Check your bookings from your dashboard, and watch for a notification the moment the owner confirms — or if the booking auto-cancels.',
  },
]

export function VerifiedBeforeYouTravelPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="border-verified/30 bg-verified/10 text-verified inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
          Our Masvingo difference
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Verified Before You Travel
        </h1>
        <p className="text-muted-foreground mt-4">
          Never waste transport money on a property that's already gone. Here's exactly how the
          confirmation flow protects every viewing you book.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <span className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-xl">
              <step.icon className="size-5" />
            </span>
            <h3 className="mt-4 font-medium">{step.title}</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">{step.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">What each outcome means</h2>
          <ul className="mt-6 space-y-4">
            <li className="flex gap-3">
              <CheckCircle2 className="text-verified mt-0.5 size-5 shrink-0" />
              <span className="text-sm">
                <strong className="font-medium">Confirmed:</strong> the owner reconfirms
                availability before your viewing — travel with confidence.
              </span>
            </li>
            <li className="flex gap-3">
              <XCircle className="text-destructive mt-0.5 size-5 shrink-0" />
              <span className="text-sm">
                <strong className="font-medium">Not confirmed in time:</strong> the booking
                auto-cancels before you leave home — you're notified immediately, no trip wasted.
              </span>
            </li>
            <li className="flex gap-3">
              <TrendingDown className="mt-0.5 size-5 shrink-0 text-amber-500" />
              <span className="text-sm">
                <strong className="font-medium">Repeated failures:</strong> lower the owner's
                trust score and can lead to their listing being suspended.
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="mt-4">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <div className="mt-16 flex justify-center">
        <Button asChild>
          <Link to="/listings">
            Browse verified listings <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
