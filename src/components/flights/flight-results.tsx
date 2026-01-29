'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Plane, Clock, ArrowRight, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  type FlightOffer,
  type Segment,
  formatDuration,
  formatDateTime,
  calculateLayover,
} from '@/lib/amadeus'
import { cn } from '@/lib/utils'

interface FlightResultsProps {
  flights: FlightOffer[]
  dictionaries?: {
    carriers?: Record<string, string>
    aircraft?: Record<string, string>
    locations?: Record<string, { cityCode: string; countryCode: string }>
  }
  onSelectFlight?: (flight: FlightOffer) => Promise<void>
  isSelecting?: boolean
  selectedFlightId?: string
}

export function FlightResults({
  flights,
  dictionaries,
  onSelectFlight,
  isSelecting,
  selectedFlightId,
}: FlightResultsProps) {
  if (flights.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Plane className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No flights found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search criteria
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {flights.length} flight{flights.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          dictionaries={dictionaries}
          onSelect={onSelectFlight}
          isSelecting={isSelecting && selectedFlightId === flight.id}
          isSelected={selectedFlightId === flight.id}
        />
      ))}
    </div>
  )
}

interface FlightCardProps {
  flight: FlightOffer
  dictionaries?: FlightResultsProps['dictionaries']
  onSelect?: (flight: FlightOffer) => Promise<void>
  isSelecting?: boolean
  isSelected?: boolean
}

function FlightCard({
  flight,
  dictionaries,
  onSelect,
  isSelecting,
  isSelected,
}: FlightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getAirlineName = (code: string) => {
    return dictionaries?.carriers?.[code] || code
  }

  const getAircraftName = (code: string) => {
    return dictionaries?.aircraft?.[code] || code
  }

  const outbound = flight.itineraries[0]
  const returnFlight = flight.itineraries[1]

  return (
    <Card className={cn(isSelected && 'ring-2 ring-primary')}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 space-y-4">
            {/* Outbound */}
            <FlightItinerary
              itinerary={outbound}
              label="Outbound"
              getAirlineName={getAirlineName}
            />

            {/* Return */}
            {returnFlight && (
              <>
                <Separator />
                <FlightItinerary
                  itinerary={returnFlight}
                  label="Return"
                  getAirlineName={getAirlineName}
                />
              </>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex flex-col items-end gap-2 lg:min-w-[150px]">
            <div className="text-right">
              <p className="text-2xl font-bold">
                {flight.price.currency} {parseFloat(flight.price.grandTotal).toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">
                per person
              </p>
            </div>

            {onSelect && (
              <Button
                onClick={() => onSelect(flight)}
                disabled={isSelecting}
                className="w-full lg:w-auto"
              >
                {isSelecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Select Flight'
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 w-full"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show Details
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="space-y-4">
              {flight.itineraries.map((itinerary, idx) => (
                <div key={idx}>
                  <h4 className="mb-2 font-medium">
                    {idx === 0 ? 'Outbound Flight' : 'Return Flight'}
                  </h4>
                  <div className="space-y-2">
                    {itinerary.segments.map((segment, segIdx) => (
                      <SegmentDetails
                        key={segment.id}
                        segment={segment}
                        getAirlineName={getAirlineName}
                        getAircraftName={getAircraftName}
                        showLayover={
                          segIdx < itinerary.segments.length - 1
                            ? calculateLayover(
                                segment.arrival.at,
                                itinerary.segments[segIdx + 1].departure.at
                              )
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Baggage Info */}
              {flight.travelerPricings[0]?.fareDetailsBySegment[0]?.includedCheckedBags && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium">Included Baggage</p>
                  <p className="text-sm text-muted-foreground">
                    {flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.quantity
                      ? `${flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.quantity} checked bag(s)`
                      : flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.weight
                      ? `${flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.weight} ${flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.weightUnit}`
                      : 'Check with airline'}
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

interface FlightItineraryProps {
  itinerary: FlightOffer['itineraries'][0]
  label: string
  getAirlineName: (code: string) => string
}

function FlightItinerary({ itinerary, label, getAirlineName }: FlightItineraryProps) {
  const firstSegment = itinerary.segments[0]
  const lastSegment = itinerary.segments[itinerary.segments.length - 1]
  const stops = itinerary.segments.length - 1

  const departure = formatDateTime(firstSegment.departure.at)
  const arrival = formatDateTime(lastSegment.arrival.at)

  const carriers = [...new Set(itinerary.segments.map((s) => s.carrierCode))]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{label}</span>
        <span>•</span>
        <span>{carriers.map(getAirlineName).join(', ')}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Departure */}
        <div className="text-center">
          <p className="text-lg font-semibold">{departure.time}</p>
          <p className="text-sm text-muted-foreground">{firstSegment.departure.iataCode}</p>
        </div>

        {/* Duration and Stops */}
        <div className="flex flex-1 flex-col items-center">
          <p className="text-xs text-muted-foreground">
            {formatDuration(itinerary.duration)}
          </p>
          <div className="relative my-1 w-full">
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <div className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
            <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
            {stops > 0 && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {[...Array(stops)].map((_, i) => (
                  <div
                    key={i}
                    className="inline-block mx-0.5 h-1.5 w-1.5 rounded-full bg-orange-500"
                  />
                ))}
              </div>
            )}
          </div>
          <Badge variant={stops === 0 ? 'default' : 'secondary'} className="text-xs">
            {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
          </Badge>
        </div>

        {/* Arrival */}
        <div className="text-center">
          <p className="text-lg font-semibold">{arrival.time}</p>
          <p className="text-sm text-muted-foreground">{lastSegment.arrival.iataCode}</p>
        </div>
      </div>
    </div>
  )
}

interface SegmentDetailsProps {
  segment: Segment
  getAirlineName: (code: string) => string
  getAircraftName: (code: string) => string
  showLayover?: string
}

function SegmentDetails({
  segment,
  getAirlineName,
  getAircraftName,
  showLayover,
}: SegmentDetailsProps) {
  const departure = formatDateTime(segment.departure.at)
  const arrival = formatDateTime(segment.arrival.at)

  return (
    <>
      <div className="rounded-lg border p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {getAirlineName(segment.carrierCode)} {segment.carrierCode}
              {segment.number}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {getAircraftName(segment.aircraft.code)}
          </Badge>
        </div>

        <div className="mt-3 grid grid-cols-[1fr,auto,1fr] gap-4">
          <div>
            <p className="font-medium">{departure.time}</p>
            <p className="text-sm text-muted-foreground">{departure.date}</p>
            <p className="text-sm">
              {segment.departure.iataCode}
              {segment.departure.terminal && ` T${segment.departure.terminal}`}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {formatDuration(segment.duration)}
            </p>
          </div>

          <div className="text-right">
            <p className="font-medium">{arrival.time}</p>
            <p className="text-sm text-muted-foreground">{arrival.date}</p>
            <p className="text-sm">
              {segment.arrival.iataCode}
              {segment.arrival.terminal && ` T${segment.arrival.terminal}`}
            </p>
          </div>
        </div>
      </div>

      {showLayover && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-orange-600">
          <Clock className="h-4 w-4" />
          <span>Layover: {showLayover}</span>
        </div>
      )}
    </>
  )
}
