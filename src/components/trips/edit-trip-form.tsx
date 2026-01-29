'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, X, MapPin, GripVertical } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  tripSchema,
  type TripFormData,
  TRIP_TYPES,
  TRIP_STATUSES,
} from '@/lib/validations/trip'
import { CURRENCIES } from '@/lib/validations/profile'
import { createClient } from '@/lib/supabase/client'
import type { Trip, TripDestination } from '@/types/database'

interface Destination {
  id?: string
  city: string
  country: string
  order_index: number
}

interface EditTripFormProps {
  trip: Trip & {
    trip_destinations: Pick<
      TripDestination,
      'id' | 'city' | 'country' | 'country_code' | 'latitude' | 'longitude' | 'arrival_date' | 'departure_date' | 'order_index' | 'notes'
    >[]
  }
}

export function EditTripForm({ trip }: EditTripFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [destinations, setDestinations] = useState<Destination[]>(
    trip.trip_destinations
      ?.sort((a, b) => a.order_index - b.order_index)
      .map((d) => ({
        id: d.id,
        city: d.city,
        country: d.country,
        order_index: d.order_index,
      })) || []
  )
  const [newDestination, setNewDestination] = useState({ city: '', country: '' })
  const [tagInput, setTagInput] = useState('')

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      title: trip.title,
      description: trip.description || '',
      trip_type: trip.trip_type as TripFormData['trip_type'],
      start_date: trip.start_date || '',
      end_date: trip.end_date || '',
      total_budget: trip.total_budget,
      currency: trip.currency,
      travelers_count: trip.travelers_count,
      notes: trip.notes || '',
      tags: trip.tags || [],
    },
  })

  const addDestination = () => {
    if (newDestination.city && newDestination.country) {
      setDestinations([
        ...destinations,
        {
          city: newDestination.city,
          country: newDestination.country,
          order_index: destinations.length,
        },
      ])
      setNewDestination({ city: '', country: '' })
    }
  }

  const removeDestination = (index: number) => {
    setDestinations(
      destinations
        .filter((_, i) => i !== index)
        .map((d, i) => ({ ...d, order_index: i }))
    )
  }

  const addTag = () => {
    const currentTags = form.getValues('tags') || []
    const trimmedTag = tagInput.trim().toLowerCase()
    if (trimmedTag && !currentTags.includes(trimmedTag) && currentTags.length < 10) {
      form.setValue('tags', [...currentTags, trimmedTag])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    const currentTags = form.getValues('tags') || []
    form.setValue(
      'tags',
      currentTags.filter((t) => t !== tag)
    )
  }

  async function onSubmit(data: TripFormData) {
    if (destinations.length === 0) {
      toast.error('Please add at least one destination')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Update the trip
      const { error: tripError } = await supabase
        .from('trips')
        // @ts-expect-error - Supabase types inference issue with @supabase/ssr
        .update({
          title: data.title,
          description: data.description || null,
          trip_type: data.trip_type,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          total_budget: data.total_budget,
          currency: data.currency,
          travelers_count: data.travelers_count,
          notes: data.notes || null,
          tags: data.tags || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', trip.id)

      if (tripError) {
        console.error('Error updating trip:', tripError)
        toast.error('Failed to update trip')
        return
      }

      // Handle destinations - delete removed ones, update existing, add new
      const existingIds = destinations.filter((d) => d.id).map((d) => d.id)
      const originalIds = trip.trip_destinations.map((d) => d.id)
      const idsToDelete = originalIds.filter((id) => !existingIds.includes(id))

      // Delete removed destinations
      if (idsToDelete.length > 0) {
        await supabase
          .from('trip_destinations')
          .delete()
          .in('id', idsToDelete)
      }

      // Update existing and add new destinations
      for (const dest of destinations) {
        if (dest.id) {
          // Update existing
          await supabase
            .from('trip_destinations')
            .update({
              city: dest.city,
              country: dest.country,
              order_index: dest.order_index,
            } as never)
            .eq('id', dest.id)
        } else {
          // Insert new
          await supabase
            .from('trip_destinations')
            .insert({
              trip_id: trip.id,
              city: dest.city,
              country: dest.country,
              order_index: dest.order_index,
            } as never)
        }
      }

      toast.success('Trip updated successfully!')
      router.push(`/trips/${trip.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const tags = form.watch('tags') || []

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>Update your trip information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
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
                    <Textarea disabled={isLoading} rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="trip_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trip Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRIP_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="travelers_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Travelers</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        disabled={isLoading}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Destinations */}
        <Card>
          <CardHeader>
            <CardTitle>Destinations</CardTitle>
            <CardDescription>
              Update your destinations. Drag to reorder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {destinations.length > 0 && (
              <div className="space-y-2">
                {destinations.map((dest, index) => (
                  <div
                    key={dest.id || index}
                    className="flex items-center gap-2 rounded-lg border p-3"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {index + 1}
                    </div>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">
                      {dest.city}, {dest.country}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeDestination(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="City"
                value={newDestination.city}
                onChange={(e) =>
                  setNewDestination({ ...newDestination, city: e.target.value })
                }
                disabled={isLoading}
                className="flex-1"
              />
              <Input
                placeholder="Country"
                value={newDestination.country}
                onChange={(e) =>
                  setNewDestination({
                    ...newDestination,
                    country: e.target.value,
                  })
                }
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addDestination}
                disabled={
                  isLoading || !newDestination.city || !newDestination.country
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dates & Budget */}
        <Card>
          <CardHeader>
            <CardTitle>Dates & Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="total_budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Optional"
                        disabled={isLoading}
                        {...field}
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>Leave empty if not set</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags & Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Tags & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  disabled={isLoading || tags.length >= 10}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={isLoading || !tagInput.trim() || tags.length >= 10}
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea disabled={isLoading} rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}
