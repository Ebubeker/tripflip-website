'use client'

import { useState } from 'react'
import { Plane, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { FlightItemCard } from '@/components/trip/cards/flight-item-card'
import { FlightEditModal } from '@/components/trip/modals/flight-edit-modal'
import { FlightAddModal } from '@/components/trip/modals/flight-add-modal'

interface Flight {
  id: string
  airline: string | null
  flight_number: string | null
  flight_type: string
  departure_city: string
  departure_airport: string
  departure_country: string | null
  arrival_city: string
  arrival_airport: string
  arrival_country: string | null
  departure_datetime: string | null
  arrival_datetime: string | null
  duration_minutes: number | null
  stops: number
  cabin_class: string
  price: number | null
  currency: string
  booking_reference: string | null
  booking_url: string | null
  booking_status: string
  seat_number: string | null
  meal_included: boolean
  notes: string | null
}

interface FlightsSectionProps {
  flights: Flight[]
  tripId: string
  currency: string
  onUpdate: () => void
  defaultExpanded?: boolean
}

export function FlightsSection({
  flights,
  tripId,
  currency,
  onUpdate,
  defaultExpanded = false,
}: FlightsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const totalCost = flights.reduce((sum, f) => sum + (f.price || 0), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleEdit = (flight: Flight) => {
    setSelectedFlight(flight)
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
                    <Plane className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Flights</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {flights.length} flight{flights.length !== 1 ? 's' : ''} • {formatCurrency(totalCost)}
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
              {flights.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-4">
                    <Plane className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No flights added yet</p>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Flight
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {flights.map((flight) => (
                    <FlightItemCard
                      key={flight.id}
                      flight={flight}
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
      {selectedFlight && (
        <FlightEditModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          flight={selectedFlight}
          tripId={tripId}
          onSave={onUpdate}
        />
      )}

      {/* Add Modal */}
      <FlightAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        tripId={tripId}
        onSave={onUpdate}
      />
    </>
  )
}
