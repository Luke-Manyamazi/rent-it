import { z } from 'zod'

export const propertyTypeOptions = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'cottage', label: 'Cottage' },
  { value: 'room', label: 'Room' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
] as const

export const amenityOptions = [
  { value: 'borehole', label: 'Borehole' },
  { value: 'solar_backup', label: 'Solar backup' },
  { value: 'zesa_backup_generator', label: 'Generator backup' },
  { value: 'prepaid_meter', label: 'Prepaid meter' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'parking', label: 'Parking' },
  { value: 'security_guard', label: 'Security guard' },
  { value: 'precast_wall', label: 'Precast wall' },
  { value: 'electric_fence', label: 'Electric fence' },
  { value: 'furnished', label: 'Furnished' },
  { value: 'water_tank', label: 'Water tank' },
  { value: 'garden', label: 'Garden' },
] as const

export const propertyFormSchema = z.object({
  title: z.string().trim().min(5, 'Enter a descriptive title').max(100),
  description: z.string().trim().min(20, 'Add a bit more detail (at least 20 characters)').max(2000),
  propertyType: z.enum(['house', 'apartment', 'cottage', 'room', 'commercial', 'land']),
  bedrooms: z.coerce.number().int().min(0).max(50),
  bathrooms: z.coerce.number().int().min(0).max(50),
  sizeSqm: z.coerce.number().min(0).optional().or(z.literal('')),
  rentAmount: z.coerce.number().positive('Enter a rent amount'),
  currency: z.enum(['USD', 'ZWL']),
  rentFrequency: z.enum(['monthly', 'weekly']),
  depositAmount: z.coerce.number().min(0).optional().or(z.literal('')),
  availableFrom: z.string().min(1, 'Choose a date'),
  amenities: z.array(
    z.enum([
      'borehole',
      'solar_backup',
      'zesa_backup_generator',
      'prepaid_meter',
      'wifi',
      'parking',
      'security_guard',
      'precast_wall',
      'electric_fence',
      'furnished',
      'water_tank',
      'garden',
    ])
  ),
  address: z.string().trim().min(3, 'Enter an address'),
  suburb: z.string().trim().min(2, 'Enter a suburb'),
})
/** Pre-validation shape (what the form fields hold — HTML inputs produce
 *  strings even for the z.coerce.number() fields below). */
export type PropertyFormInput = z.input<typeof propertyFormSchema>
/** Post-validation shape (what onSubmit receives — numbers coerced). */
export type PropertyFormValues = z.output<typeof propertyFormSchema>
