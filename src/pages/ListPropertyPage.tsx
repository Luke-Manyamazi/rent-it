import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  MapPin,
  DollarSign,
  Sparkles,
  Camera,
  ArrowRight,
  KeyRound,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const SECTIONS = [
  {
    icon: ClipboardList,
    title: 'Basics',
    description: 'Title, description, property type, bedrooms and bathrooms.',
  },
  {
    icon: MapPin,
    title: 'Location',
    description: 'Address and suburb, so tenants can search and filter by area.',
  },
  {
    icon: DollarSign,
    title: 'Pricing',
    description: 'Rent amount, currency, frequency, and deposit.',
  },
  {
    icon: Sparkles,
    title: 'Amenities',
    description: 'Borehole, solar backup, wifi, security, and more — whatever applies.',
  },
  {
    icon: Camera,
    title: 'Photos',
    description: 'Upload photos so your listing stands out and looks trustworthy.',
  },
]

export function ListPropertyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl text-center"
      >
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">List your property</h1>
        <p className="text-muted-foreground mt-4">
          Reach verified tenants directly, manage bookings and messages in one place, and build a
          trust score that gets your listings seen. Here's what listing a property involves.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {SECTIONS.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <span className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-xl">
              <section.icon className="size-5" />
            </span>
            <h3 className="mt-4 font-medium">{section.title}</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">{section.description}</p>
          </motion.div>
        ))}
      </div>

      <p className="text-muted-foreground mx-auto mt-12 max-w-2xl text-center text-sm">
        Once submitted, your listing goes live right away and an admin reviews it for the
        Verified badge. Individual landlords manage their own listings directly; agencies can add
        team members and, on paid plans, list more properties at once.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="bg-card border-border flex flex-col rounded-2xl border p-8">
          <span className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-xl">
            <KeyRound className="size-5" />
          </span>
          <h3 className="mt-5 text-xl font-semibold">I own the property myself</h3>
          <p className="text-muted-foreground mt-2 flex-1 text-sm">
            Sign up as a landlord to list and manage your own rental properties directly.
          </p>
          <Button asChild className="mt-6 w-fit gap-1.5">
            <Link to="/signup?role=landlord">
              Sign up as a landlord <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="bg-card border-border flex flex-col rounded-2xl border p-8">
          <span className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-xl">
            <Building2 className="size-5" />
          </span>
          <h3 className="mt-5 text-xl font-semibold">I manage listings for others</h3>
          <p className="text-muted-foreground mt-2 flex-1 text-sm">
            Sign up as an agency to manage a portfolio of listings with a team.
          </p>
          <Button asChild variant="outline" className="mt-6 w-fit gap-1.5">
            <Link to="/signup?role=agency">
              Sign up as an agency <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
