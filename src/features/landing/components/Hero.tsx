import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ShieldCheck, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { APP_NAME, APP_TAGLINE } from '@/config/constants'

const PROPERTY_TYPES = [
  { value: 'any', label: 'Any type' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'cottage', label: 'Cottage' },
  { value: 'room', label: 'Room' },
  { value: 'commercial', label: 'Commercial' },
] as const

export function Hero() {
  const navigate = useNavigate()
  const [location, setLocation] = useState('')
  const [propertyType, setPropertyType] = useState('any')
  const [maxPrice, setMaxPrice] = useState('')

  function onSearch(event: React.FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (location.trim()) params.set('location', location.trim())
    if (propertyType !== 'any') params.set('type', propertyType)
    if (maxPrice.trim()) params.set('maxPrice', maxPrice.trim())
    navigate(`/listings${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="from-brand/10 via-background to-background pointer-events-none absolute inset-0 bg-gradient-to-b"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border-verified/30 bg-verified/10 text-verified inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
          >
            <ShieldCheck className="size-3.5" />
            Verified Before You Travel — no more wasted trips
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
          >
            {APP_TAGLINE}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg"
          >
            {APP_NAME} connects verified tenants with verified landlords and
            agencies — no fake listings, no viewing fees, no wasted trips.
          </motion.p>
        </div>

        <motion.form
          onSubmit={onSearch}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
          className="bg-card border-border mx-auto mt-10 flex max-w-3xl flex-col gap-2 rounded-2xl border p-2 shadow-lg sm:flex-row"
        >
          <div className="relative flex-1">
            <MapPin className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Suburb, e.g. Mucheke, Rhodene, Runyararo..."
              className="h-11 border-0 pl-9 shadow-none focus-visible:ring-0"
            />
          </div>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="h-11 border-0 shadow-none sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max price (USD)"
            className="h-11 border-0 shadow-none focus-visible:ring-0 sm:w-40"
          />
          <Button type="submit" size="lg" className="h-11 gap-1.5">
            <Search className="size-4" />
            Search
          </Button>
        </motion.form>
      </div>
    </section>
  )
}
