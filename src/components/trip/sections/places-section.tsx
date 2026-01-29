'use client'

import { useState } from 'react'
import { MapPin, Plus, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { PlaceItemCard } from '@/components/trip/cards/place-item-card'
import { PlaceEditModal } from '@/components/trip/modals/place-edit-modal'
import { PlaceAddModal } from '@/components/trip/modals/place-add-modal'

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

interface PlacesSectionProps {
  places: SavedPlace[]
  tripId: string
  onUpdate: () => void
  defaultExpanded?: boolean
}

export function PlacesSection({
  places,
  tripId,
  onUpdate,
  defaultExpanded = false,
}: PlacesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [selectedPlace, setSelectedPlace] = useState<SavedPlace | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const visitedCount = places.filter((p) => p.is_visited).length
  const totalPlaces = places.length

  const handleEdit = (place: SavedPlace) => {
    setSelectedPlace(place)
    setIsEditModalOpen(true)
  }

  // Sort places: unvisited first, then visited
  const sortedPlaces = [...places].sort((a, b) => {
    if (a.is_visited === b.is_visited) return 0
    return a.is_visited ? 1 : -1
  })

  return (
    <>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Places to Visit</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {totalPlaces} place{totalPlaces !== 1 ? 's' : ''}
                      {visitedCount > 0 && (
                        <span className="inline-flex items-center gap-1 ml-2 text-green-600">
                          <Check className="w-3 h-3" />
                          {visitedCount} visited
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsAddModalOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {places.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-4">
                    <MapPin className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No places saved yet</p>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Place
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedPlaces.map((place) => (
                    <PlaceItemCard
                      key={place.id}
                      place={place}
                      tripId={tripId}
                      onEdit={handleEdit}
                      onDelete={onUpdate}
                      onToggleVisited={onUpdate}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Edit Modal */}
      {selectedPlace && (
        <PlaceEditModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          place={selectedPlace}
          tripId={tripId}
          onSave={onUpdate}
        />
      )}

      {/* Add Modal */}
      <PlaceAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        tripId={tripId}
        onSave={onUpdate}
      />
    </>
  )
}
