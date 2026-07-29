import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { agencyProfileSchema, type AgencyProfileValues } from '@/features/agency/schemas'
import { updateAgencyProfile } from '@/features/agency/api/agency-profile'
import type { Agency } from '@/types/agency'

export function AgencyProfileForm({ agency, readOnly }: { agency: Agency; readOnly: boolean }) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<AgencyProfileValues>({
    resolver: zodResolver(agencyProfileSchema),
    values: {
      name: agency.name,
      description: agency.description ?? '',
      contactPhone: agency.contactPhone,
      contactEmail: agency.contactEmail,
      website: agency.website ?? '',
      address: agency.address ?? '',
      licenseNumber: agency.licenseNumber ?? '',
    },
  })

  async function onSubmit(values: AgencyProfileValues) {
    setSubmitting(true)
    try {
      await updateAgencyProfile(agency.id, {
        name: values.name,
        description: values.description || null,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        website: values.website || null,
        address: values.address || null,
        licenseNumber: values.licenseNumber || null,
      })
      toast.success('Agency profile updated.')
    } catch {
      toast.error("Couldn't update your agency profile. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <fieldset disabled={readOnly} className="space-y-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agency name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact phone</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!readOnly && (
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          )}
        </form>
      </fieldset>
    </Form>
  )
}
