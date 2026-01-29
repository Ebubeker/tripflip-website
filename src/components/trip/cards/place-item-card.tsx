'use client'

import { useState } from 'react'
import {
  MapPin,
  Pencil,
  Trash2,
  Star,
  Globe,
  Phone,
  Check,
  Circle,
  Landmark,
  Utensils,
  Coffee,
  Wine,
  Building,
  TreePine,
  Umbrella,
  ShoppingBag,
  Ticket,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmationModal } from '@/components/trip/modals/delete-confirmation-modal'
import { toast } from 'sonner'

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
  provider: string | null
  tags: string[] | null
}

interface PlaceItemCardProps {
  place: SavedPlace
  tripId: string
  onEdit: (place: SavedPlace) => void
  onDelete: () => void
  onToggleVisited: () => void
}

const categoryIcons: Record<string, React.ElementType> = {
  attraction: Landmark,
  restaurant: Utensils,
  cafe: Coffee,
  bar: Wine,
  museum: Building,
  park: TreePine,
  beach: Umbrella,
  shopping: ShoppingBag,
  entertainment: Ticket,
  landmark: Building2,
  other: MapPin,
}

const priceLevelSymbols: Record<string, string> = {
  free: 'Free',
  cheap: '$',
  moderate: '$$',
  expensive: '$$$',
  very_expensive: '$$$$',
}

export function PlaceItemCard({ place, tripId, onEdit, onDelete, onToggleVisited }: PlaceItemCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingVisited, setIsTogglingVisited] = useState(false)

  const CategoryIcon = categoryIcons[place.category || 'other'] || MapPin
  const isManual = !place.provider || place.provider === 'manual'

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/places/${place.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete place')
      }

      toast.success('Place deleted')
      setIsDeleteModalOpen(false)
      onDelete()
    } catch (error) {
      console.error('Error deleting place:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete place')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleVisited = async () => {
    setIsTogglingVisited(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/places/${place.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visited: !place.is_visited }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update place')
      }

      toast.success(place.is_visited ? 'Marked as not visited' : 'Marked as visited')
      onToggleVisited()
    } catch (error) {
      console.error('Error updating place:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update place')
    } finally {
      setIsTogglingVisited(false)
    }
  }

  return (
    <>
      <Card className={`border hover:border-primary/30 transition-colors ${place.is_visited ? 'bg-muted/30' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Place info */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${place.is_visited ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'}`}>
                {place.is_visited ? (
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <CategoryIcon className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {/* Name and badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold ${place.is_visited ? 'line-through text-muted-foreground' : ''}`}>
                    {place.name}
                  </span>
                  {place.category && (
                    <Badge variant="outline" className="capitalize text-xs">
                      {place.category}
                    </Badge>
                  )}
                  {isManual && (
                    <Badge variant="secondary" className="text-xs">
                      Manual
                    </Badge>
                  )}
                  {!isManual && place.provider && (
                    <Badge variant="secondary" className="text-xs">
                      {place.provider === 'google' ? 'Google' : place.provider}
                    </Badge>
                  )}
                </div>

                {/* Description */}
                {place.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {place.description}
                  </p>
                )}

                {/* Details row */}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  {/* Location */}
                  {(place.city || place.address) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {place.city || place.address}
                      {place.country && `, ${place.country}`}
                    </span>
                  )}

                  {/* Rating */}
                  {place.rating && (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-3 h-3 fill-current" />
                      {Number(place.rating).toFixed(1)}
                    </span>
                  )}

                  {/* Price Level */}
                  {place.price_level && (
                    <span className="text-green-600">
                      {priceLevelSymbols[place.price_level] || place.price_level}
                    </span>
                  )}

                  {/* Website */}
                  {place.website && (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Globe className="w-3 h-3" />
                      Website
                    </a>
                  )}

                  {/* Phone */}
                  {place.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {place.phone}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {place.tags && place.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {place.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {place.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{place.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Personal notes */}
                {place.personal_notes && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    Note: {place.personal_notes}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {/* Personal rating */}
              {place.personal_rating && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${star <= place.personal_rating! ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1">
                {/* Toggle visited */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${place.is_visited ? 'text-green-600 hover:text-green-700' : ''}`}
                  onClick={handleToggleVisited}
                  disabled={isTogglingVisited}
                >
                  {place.is_visited ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  <span className="sr-only">{place.is_visited ? 'Mark as not visited' : 'Mark as visited'}</span>
                </Button>
                {/* Edit (only for manual places) */}
                {isManual && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(place)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit place</span>
                  </Button>
                )}
                {/* Delete */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete place</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        itemType="Place"
        itemName={place.name}
      />
    </>
  )
}
