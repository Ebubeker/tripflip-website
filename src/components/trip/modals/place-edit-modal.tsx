'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Star } from 'lucide-react'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  savedPlaceSchema,
  type SavedPlaceFormData,
  PLACE_CATEGORIES,
  PRICE_LEVELS,
} from '@/lib/validations/saved-place'

interface SavedPlace {
  id: string
  name: string
  description: string | null
  category: string | null
  address: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  rating: number | null
  price_level: string | null
  phone: string | null
  website: string | null
  is_visited: boolean
  personal_rating: number | null
  personal_notes: string | null
  tags: string[] | null
}

interface PlaceEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  place: SavedPlace
  tripId: string
  onSave: () => void
}

export function PlaceEditModal({ open, onOpenChange, place, tripId, onSave }: PlaceEditModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [isLoading, setIsLoading] = useState(false)
  const [personalRating, setPersonalRating] = useState<number | null>(place.personal_rating)

  const form = useForm<SavedPlaceFormData>({
    resolver: zodResolver(savedPlaceSchema),
    defaultValues: {
      name: place.name,
      description: place.description || '',
      category: (place.category as SavedPlaceFormData['category']) || 'attraction',
      address: place.address || '',
      city: place.city || '',
      country: place.country || '',
      latitude: place.latitude || undefined,
      longitude: place.longitude || undefined,
      rating: place.rating || undefined,
      price_level: (place.price_level as SavedPlaceFormData['price_level']) || undefined,
      phone: place.phone || '',
      website: place.website || '',
      personal_rating: place.personal_rating || undefined,
      personal_notes: place.personal_notes || '',
      is_visited: place.is_visited || false,
      tags: place.tags || [],
    },
  })

  // Reset form when place changes
  useEffect(() => {
    setPersonalRating(place.personal_rating)
    form.reset({
      name: place.name,
      description: place.description || '',
      category: (place.category as SavedPlaceFormData['category']) || 'attraction',
      address: place.address || '',
      city: place.city || '',
      country: place.country || '',
      latitude: place.latitude || undefined,
      longitude: place.longitude || undefined,
      rating: place.rating || undefined,
      price_level: (place.price_level as SavedPlaceFormData['price_level']) || undefined,
      phone: place.phone || '',
      website: place.website || '',
      personal_rating: place.personal_rating || undefined,
      personal_notes: place.personal_notes || '',
      is_visited: place.is_visited || false,
      tags: place.tags || [],
    })
  }, [place, form])

  const onSubmit = async (data: SavedPlaceFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/places/${place.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          rating: data.rating || null,
          personal_rating: personalRating || null,
          price_level: data.price_level || null,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update place')
      }

      toast.success('Place updated')
      onOpenChange(false)
      onSave()
    } catch (error) {
      console.error('Error updating place:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update place')
    } finally {
      setIsLoading(false)
    }
  }

  const FormContent = (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
      {/* Name and Category */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="Place Name"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={form.watch('category')}
            onValueChange={(v) => form.setValue('category', v as SavedPlaceFormData['category'])}
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLACE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="About this place..."
          rows={2}
        />
      </div>

      {/* Location */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            {...form.register('city')}
            placeholder="Paris"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            {...form.register('country')}
            placeholder="France"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          {...form.register('address')}
          placeholder="123 Main Street"
        />
      </div>

      {/* Contact */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...form.register('phone')}
            placeholder="+1 234 567 8900"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            {...form.register('website')}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Rating and Price */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0-5)</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            min={0}
            max={5}
            {...form.register('rating', { valueAsNumber: true })}
            placeholder="4.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_level">Price Level</Label>
          <Select
            value={form.watch('price_level') || ''}
            onValueChange={(v) => form.setValue('price_level', v as SavedPlaceFormData['price_level'])}
          >
            <SelectTrigger id="price_level">
              <SelectValue placeholder="Select price level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Not specified</SelectItem>
              {PRICE_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label} {level.symbol && `(${level.symbol})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Visited toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="is_visited">Visited</Label>
          <p className="text-sm text-muted-foreground">Mark this place as visited</p>
        </div>
        <Switch
          id="is_visited"
          checked={form.watch('is_visited')}
          onCheckedChange={(checked) => form.setValue('is_visited', checked)}
        />
      </div>

      {/* Personal Rating */}
      <div className="space-y-2">
        <Label>Your Rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setPersonalRating(personalRating === star ? null : star)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`w-6 h-6 ${star <= (personalRating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
              />
            </button>
          ))}
          {personalRating && (
            <button
              type="button"
              onClick={() => setPersonalRating(null)}
              className="ml-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Personal Notes */}
      <div className="space-y-2">
        <Label htmlFor="personal_notes">Personal Notes</Label>
        <Textarea
          id="personal_notes"
          {...form.register('personal_notes')}
          placeholder="Your thoughts about this place..."
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Place</DialogTitle>
            <DialogDescription>
              Update place details
            </DialogDescription>
          </DialogHeader>
          {FormContent}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Place</SheetTitle>
          <SheetDescription>
            Update place details
          </SheetDescription>
        </SheetHeader>
        {FormContent}
      </SheetContent>
    </Sheet>
  )
}
