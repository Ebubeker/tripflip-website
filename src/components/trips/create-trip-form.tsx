'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, X, MapPin, Sparkles, Landmark, Utensils, Trees, Mountain, ShoppingBag, Music, Palette, Heart, Camera, Users } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import {
  tripSchema,
  type TripFormData,
  TRIP_TYPES,
  TRAVEL_STYLES,
  TRAVEL_INTERESTS,
} from '@/lib/validations/trip'
import { CURRENCIES } from '@/lib/validations/profile'
import { createClient } from '@/lib/supabase/client'

interface Destination {
  city: string
  country: string
}

// Helper function to get icon component for interests
function getInterestIcon(iconName: string) {
  const icons: Record<string, typeof Landmark> = {
    landmark: Landmark,
    utensils: Utensils,
    trees: Trees,
    mountain: Mountain,
    'shopping-bag': ShoppingBag,
    music: Music,
    palette: Palette,
    spa: Heart,
    camera: Camera,
    users: Users,
  }
  return icons[iconName] || Landmark
}

export function CreateTripForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [newDestination, setNewDestination] = useState({ city: '', country: '' })
  const [tagInput, setTagInput] = useState('')

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      title: '',
      description: '',
      trip_type: 'leisure',
      start_date: '',
      end_date: '',
      total_budget: null,
      currency: 'USD',
      travelers_count: 1,
      travel_style: 'moderate',
      interests: [],
      auto_plan: true,
      notes: '',
      tags: [],
    },
  })

  const addDestination = () => {
    if (newDestination.city && newDestination.country) {
      setDestinations([...destinations, newDestination])
      setNewDestination({ city: '', country: '' })
    }
  }

  const removeDestination = (index: number) => {
    setDestinations(destinations.filter((_, i) => i !== index))
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

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please log in to create a trip')
        return
      }

      // Create the trip
      const { data: trip, error: tripError } = (await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description || null,
          trip_type: data.trip_type,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          total_budget: data.total_budget,
          currency: data.currency,
          travelers_count: data.travelers_count,
          travel_style: data.travel_style || null,
          interests: data.interests || [],
          notes: data.notes || null,
          tags: data.tags || [],
          status: 'planning',
        } as never)
        .select()
        .single()) as { data: { id: string } | null; error: unknown }

      if (tripError || !trip) {
        console.error('Error creating trip:', tripError)
        toast.error('Failed to create trip')
        return
      }

      // Create destinations
      const destinationsToInsert = destinations.map((dest, index) => ({
        trip_id: trip.id,
        city: dest.city,
        country: dest.country,
        order_index: index,
      }))

      const { error: destError } = (await supabase
        .from('trip_destinations')
        .insert(destinationsToInsert as never)) as { error: unknown }

      if (destError) {
        console.error('Error creating destinations:', destError)
        // Trip was created but destinations failed - still navigate
        toast.warning('Trip created but some destinations could not be added')
      } else {
        toast.success('Trip created successfully!')
      }

      // If auto-plan is enabled, redirect to planning page and trigger automation
      if (data.auto_plan) {
        router.push(`/trips/${trip.id}/planning`)
      } else {
        router.push(`/trips/${trip.id}`)
      }
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
            <CardDescription>
              Give your trip a name and set the basic details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Summer Europe Adventure"
                      disabled={isLoading}
                      {...field}
                    />
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
                    <Textarea
                      placeholder="What's this trip about?"
                      disabled={isLoading}
                      rows={3}
                      {...field}
                    />
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
              Where are you going? Add your destinations in order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {destinations.length > 0 && (
              <div className="space-y-2">
                {destinations.map((dest, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg border p-3"
                  >
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

        {/* Travel Style & Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Travel Preferences</CardTitle>
            <CardDescription>
              Help us personalize your trip with AI suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="travel_style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Travel Style</FormLabel>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {TRAVEL_STYLES.map((style) => (
                      <div
                        key={style.value}
                        className={`cursor-pointer rounded-lg border p-4 transition-all hover:border-primary ${
                          field.value === style.value
                            ? 'border-primary bg-primary/5'
                            : ''
                        }`}
                        onClick={() => field.onChange(style.value)}
                      >
                        <div className="font-medium">{style.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {style.description}
                        </div>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interests (select all that apply)</FormLabel>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {TRAVEL_INTERESTS.map((interest) => {
                      const isSelected = field.value?.includes(interest.value)
                      const IconComponent = getInterestIcon(interest.icon)
                      return (
                        <div
                          key={interest.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:border-primary ${
                            isSelected ? 'border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => {
                            const current = field.value || []
                            if (isSelected) {
                              field.onChange(
                                current.filter((v) => v !== interest.value)
                              )
                            } else {
                              field.onChange([...current, interest.value])
                            }
                          }}
                        >
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground'
                            }`}
                          >
                            {isSelected && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-3 w-3"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{interest.label}</span>
                        </div>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="auto_plan"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <FormLabel className="text-base font-semibold">
                        AI Trip Planning
                      </FormLabel>
                    </div>
                    <FormDescription>
                      Automatically search for flights, hotels, and generate a
                      personalized itinerary based on your preferences
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Dates & Budget */}
        <Card>
          <CardHeader>
            <CardTitle>Dates & Budget</CardTitle>
            <CardDescription>
              When are you traveling and what&apos;s your budget?
            </CardDescription>
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
            <CardDescription>
              Add tags for easy filtering and any additional notes
            </CardDescription>
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
                    <Textarea
                      placeholder="Any additional notes about this trip..."
                      disabled={isLoading}
                      rows={4}
                      {...field}
                    />
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
            Create Trip
          </Button>
        </div>
      </form>
    </Form>
  )
}
