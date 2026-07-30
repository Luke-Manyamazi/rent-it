import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Search,
  CalendarCheck,
  MessageCircle,
  KeyRound,
  Home,
  ShieldCheck,
  Users,
  Banknote,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VIEWING_FEE_USD } from '@/config/constants'

const TENANT_STEPS = [
  {
    icon: Search,
    title: 'Search verified listings',
    description:
      'Filter by suburb, price, and property type. Every listing goes through admin verification before it is marked Verified.',
  },
  {
    icon: CalendarCheck,
    title: `Book a viewing for $${VIEWING_FEE_USD}`,
    description: `Pay a small commitment fee via EcoCash or Paynow to lock in a time — refunded if you view and it's not the one, kept only if you go on to rent. The owner must reconfirm availability before your visit — see Verified Before You Travel.`,
  },
  {
    icon: MessageCircle,
    title: 'Message the owner in-app',
    description: 'Chat directly with the landlord or agency to ask questions and agree on terms.',
  },
  {
    icon: KeyRound,
    title: 'Move in with confidence',
    description: 'Once you agree, move in knowing the listing and owner were verified along the way.',
  },
]

const OWNER_STEPS = [
  {
    icon: Home,
    title: 'List your property',
    description:
      'Add photos, pricing, and details in a few minutes. See List Your Property for the full walkthrough.',
  },
  {
    icon: ShieldCheck,
    title: 'Get verified',
    description:
      'An admin reviews your listing so it can display the Verified badge tenants look for.',
  },
  {
    icon: CalendarCheck,
    title: 'Manage bookings & messages',
    description:
      "Confirm viewing requests, reconfirm availability before each visit, and message tenants directly. Every request already comes with a paid $" +
      VIEWING_FEE_USD +
      ' commitment, so you spend less time on tenants who were never going to show.',
  },
  {
    icon: Banknote,
    title: 'Mark Rented or Not Rented',
    description:
      "After a viewing, tell us whether it turned into a tenancy. Rented takes the listing off the market automatically; Not Rented refunds the tenant's fee instantly.",
  },
  {
    icon: Users,
    title: 'Build your trust score',
    description:
      'Reliable confirmations build your trust score; repeated missed confirmations can suspend a listing.',
  },
]

function StepList({ steps }: { steps: typeof TENANT_STEPS }) {
  return (
    <div className="mt-8 grid gap-8 sm:grid-cols-2">
      {steps.map((step, index) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <div className="flex items-center gap-3">
            <span className="bg-brand text-brand-foreground flex size-9 items-center justify-center rounded-full text-sm font-semibold">
              {index + 1}
            </span>
            <span className="bg-brand/10 text-brand flex size-9 items-center justify-center rounded-full">
              <step.icon className="size-4.5" />
            </span>
          </div>
          <h3 className="mt-3 font-medium">{step.title}</h3>
          <p className="text-muted-foreground mt-1.5 text-sm">{step.description}</p>
        </motion.div>
      ))}
    </div>
  )
}

export function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl text-center"
      >
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h1>
        <p className="text-muted-foreground mt-4">
          RentIT Masvingo connects tenants directly with landlords and agencies — verified
          listings, a ${VIEWING_FEE_USD} refundable viewing fee instead of $40 to see five houses,
          and a booking flow built to stop wasted trips.
        </p>
      </motion.div>

      <Tabs defaultValue="tenants" className="mt-12">
        <TabsList className="mx-auto">
          <TabsTrigger value="tenants">For tenants</TabsTrigger>
          <TabsTrigger value="owners">For landlords & agencies</TabsTrigger>
        </TabsList>
        <TabsContent value="tenants">
          <StepList steps={TENANT_STEPS} />
          <div className="mt-10 flex justify-center">
            <Button asChild>
              <Link to="/listings">
                Browse rentals <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="owners">
          <StepList steps={OWNER_STEPS} />
          <div className="mt-10 flex justify-center">
            <Button asChild>
              <Link to="/list-property">
                List your property <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <p className="text-muted-foreground text-sm">
          Curious how we stop wasted viewing trips?{' '}
          <Link to="/verified-before-you-travel" className="text-foreground font-medium underline underline-offset-4">
            Read about Verified Before You Travel
          </Link>
        </p>
        <p className="text-muted-foreground text-sm">
          Ready to get started?{' '}
          <Link to="/signup" className="text-foreground font-medium underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
