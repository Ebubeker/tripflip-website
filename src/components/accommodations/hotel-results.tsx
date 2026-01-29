'use client'

import { useState } from 'react'
import { Building2, MapPin, Star, Wifi, Loader2, ChevronDown, ChevronUp, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { type HotelOffer } from '@/lib/amadeus'
import { cn } from '@/lib/utils'

interface HotelResultsProps {
  hotels: HotelOffer[]
  onSelectHotel?: (hotel: HotelOffer, offerId: string) => Promise<void>
  isSelecting?: boolean
  selectedHotelId?: string
}

export function HotelResults({
  hotels,
  onSelectHotel,
  isSelecting,
  selectedHotelId,
}: HotelResultsProps) {
  if (hotels.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No hotels found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search criteria or dates
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {hotels.map((hotel) => (
        <HotelCard
          key={hotel.hotel.hotelId}
          hotel={hotel}
          onSelect={onSelectHotel}
          isSelecting={isSelecting && selectedHotelId === hotel.hotel.hotelId}
          isSelected={selectedHotelId === hotel.hotel.hotelId}
        />
      ))}
    </div>
  )
}

interface HotelCardProps {
  hotel: HotelOffer
  onSelect?: (hotel: HotelOffer, offerId: string) => Promise<void>
  isSelecting?: boolean
  isSelected?: boolean
}

function HotelCard({ hotel, onSelect, isSelecting, isSelected }: HotelCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedOfferId, setSelectedOfferId] = useState<string>(
    hotel.offers[0]?.id || ''
  )

  const selectedOffer = hotel.offers.find((o) => o.id === selectedOfferId) || hotel.offers[0]

  const renderStars = (rating?: string) => {
    if (!rating) return null
    const stars = parseInt(rating)
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(stars)].map((_, i) => (
          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    )
  }

  return (
    <Card className={cn(isSelected && 'ring-2 ring-primary')}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
          {/* Hotel Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{hotel.hotel.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(hotel.hotel.rating)}
                  {hotel.hotel.rating && (
                    <span className="text-xs text-muted-foreground">
                      {hotel.hotel.rating}-star hotel
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            {hotel.hotel.address && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  {[
                    hotel.hotel.address.lines?.join(', '),
                    hotel.hotel.address.cityName,
                    hotel.hotel.address.countryCode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}

            {/* Amenities */}
            {hotel.hotel.amenities && hotel.hotel.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {hotel.hotel.amenities.slice(0, 5).map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="text-xs">
                    {formatAmenity(amenity)}
                  </Badge>
                ))}
                {hotel.hotel.amenities.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{hotel.hotel.amenities.length - 5} more
                  </Badge>
                )}
              </div>
            )}

            {/* Selected Room Info */}
            {selectedOffer && (
              <div className="mt-3 rounded-lg bg-muted p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {selectedOffer.room.typeEstimated?.category || 'Standard Room'}
                    </p>
                    {selectedOffer.room.typeEstimated?.beds && (
                      <p className="text-xs text-muted-foreground">
                        {selectedOffer.room.typeEstimated.beds}{' '}
                        {selectedOffer.room.typeEstimated.bedType || 'bed'}
                        {selectedOffer.room.typeEstimated.beds > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {selectedOffer.guests.adults} guest{selectedOffer.guests.adults > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedOffer.checkInDate} - {selectedOffer.checkOutDate}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex flex-col items-end gap-2 lg:min-w-[150px]">
            {selectedOffer && (
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {selectedOffer.price.currency}{' '}
                  {parseFloat(selectedOffer.price.total).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">total stay</p>
              </div>
            )}

            {onSelect && selectedOffer && (
              <Button
                onClick={() => onSelect(hotel, selectedOfferId)}
                disabled={isSelecting}
                className="w-full lg:w-auto"
              >
                {isSelecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Select Hotel'
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Expandable Details */}
        {hotel.offers.length > 1 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="mt-4 w-full">
                {isExpanded ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Hide Room Options
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    View {hotel.offers.length} Room Options
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="space-y-3">
                {hotel.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className={cn(
                      'rounded-lg border p-3 cursor-pointer transition-colors',
                      selectedOfferId === offer.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted'
                    )}
                    onClick={() => setSelectedOfferId(offer.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {offer.room.typeEstimated?.category || 'Room'}
                        </p>
                        {offer.room.description?.text && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {offer.room.description.text}
                          </p>
                        )}
                        {offer.room.typeEstimated?.beds && (
                          <p className="text-sm text-muted-foreground">
                            {offer.room.typeEstimated.beds}{' '}
                            {offer.room.typeEstimated.bedType || 'bed'}
                            {offer.room.typeEstimated.beds > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {offer.price.currency} {parseFloat(offer.price.total).toFixed(0)}
                        </p>
                        {offer.policies?.cancellation && (
                          <Badge
                            variant={
                              offer.policies.cancellation.description?.text?.toLowerCase().includes('free')
                                ? 'default'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {offer.policies.cancellation.description?.text?.toLowerCase().includes('free')
                              ? 'Free cancellation'
                              : 'Non-refundable'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Policies Info */}
        {selectedOffer?.policies && (
          <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4 flex-shrink-0" />
            <div>
              {selectedOffer.policies.paymentType && (
                <span>Payment: {formatPaymentType(selectedOffer.policies.paymentType)}</span>
              )}
              {selectedOffer.policies.cancellation?.deadline && (
                <span className="ml-2">
                  Cancel by: {new Date(selectedOffer.policies.cancellation.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatAmenity(amenity: string): string {
  // Convert SNAKE_CASE to Title Case
  return amenity
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatPaymentType(type: string): string {
  const types: Record<string, string> = {
    GUARANTEE: 'Card required',
    DEPOSIT: 'Deposit required',
    PREPAY: 'Pay now',
    HOLDTIME: 'Pay at hotel',
  }
  return types[type] || type
}
