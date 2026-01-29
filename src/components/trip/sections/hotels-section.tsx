'use client'

import { useState } from 'react'
import { Hotel, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { HotelItemCard } from '@/components/trip/cards/hotel-item-card'
import { HotelEditModal } from '@/components/trip/modals/hotel-edit-modal'
import { HotelAddModal } from '@/components/trip/modals/hotel-add-modal'

interface Accommodation {
  id: string
  name: string
  type: string
  address: string | null
  city: string
  country: string | null
  latitude: number | null
  longitude: number | null
  check_in_date: string | null
  check_in_time: string | null
  check_out_date: string | null
  check_out_time: string | null
  nights_count: number | null
  room_type: string | null
  room_count: number
  guests_count: number
  price_per_night: number | null
  total_price: number | null
  currency: string
  rating: number | null
  booking_reference: string | null
  booking_url: string | null
  booking_status: string
  amenities: string[] | null
  breakfast_included: boolean
  cancellation_policy: string | null
  notes: string | null
}

interface HotelsSectionProps {
  accommodations: Accommodation[]
  tripId: string
  currency: string
  onUpdate: () => void
  defaultExpanded?: boolean
}

export function HotelsSection({
  accommodations,
  tripId,
  currency,
  onUpdate,
  defaultExpanded = false,
}: HotelsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const totalCost = accommodations.reduce((sum, a) => sum + (a.total_price || 0), 0)
  const totalNights = accommodations.reduce((sum, a) => sum + (a.nights_count || 0), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleEdit = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation)
    setIsEditModalOpen(true)
  }

  return (
    <>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                    <Hotel className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Accommodations</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {accommodations.length} place{accommodations.length !== 1 ? 's' : ''}
                      {totalNights > 0 && ` • ${totalNights} night${totalNights !== 1 ? 's' : ''}`}
                      {' • '}{formatCurrency(totalCost)}
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
              {accommodations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-4">
                    <Hotel className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No accommodations added yet</p>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Accommodation
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {accommodations.map((accommodation) => (
                    <HotelItemCard
                      key={accommodation.id}
                      accommodation={accommodation}
                      tripId={tripId}
                      onEdit={handleEdit}
                      onDelete={onUpdate}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Edit Modal */}
      {selectedAccommodation && (
        <HotelEditModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          accommodation={selectedAccommodation}
          tripId={tripId}
          onSave={onUpdate}
        />
      )}

      {/* Add Modal */}
      <HotelAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        tripId={tripId}
        onSave={onUpdate}
      />
    </>
  )
}
