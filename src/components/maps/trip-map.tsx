'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  MapPin,
  Plane,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Set the access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export interface MapDestination {
  id: string
  name: string
  coordinates: [number, number] // [lng, lat]
  type: 'origin' | 'destination' | 'stopover' | 'attraction' | 'restaurant' | 'museum' | 'park' | 'activity' | 'hotel' | 'airport'
  arrivalDate?: string
  departureDate?: string
  order: number
  category?: string
  dayNumber?: number
}

// Get marker color based on type
function getMarkerColor(type: MapDestination['type']): string {
  switch (type) {
    case 'origin': return 'bg-green-500'
    case 'destination': return 'bg-red-500'
    case 'stopover': return 'bg-blue-500'
    case 'attraction': return 'bg-purple-500'
    case 'restaurant': return 'bg-orange-500'
    case 'museum': return 'bg-amber-600'
    case 'park': return 'bg-emerald-500'
    case 'activity': return 'bg-pink-500'
    case 'hotel': return 'bg-indigo-500'
    case 'airport': return 'bg-sky-500'
    default: return 'bg-gray-500'
  }
}

// Get marker icon based on type
function getMarkerIcon(type: MapDestination['type']): string {
  switch (type) {
    case 'origin': return '🏠'
    case 'destination': return '🎯'
    case 'stopover': return '📍'
    case 'attraction': return '⭐'
    case 'restaurant': return '🍽️'
    case 'museum': return '🏛️'
    case 'park': return '🌳'
    case 'activity': return '🎭'
    case 'hotel': return '🏨'
    case 'airport': return '✈️'
    default: return '📍'
  }
}

interface TripMapProps {
  destinations: MapDestination[]
  className?: string
  showRoutes?: boolean
  interactive?: boolean
  onMarkerClick?: (destination: MapDestination) => void
}

export function TripMap({
  destinations,
  className,
  showRoutes = true,
  interactive = true,
  onMarkerClick,
}: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<MapDestination | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return
    if (!mapboxgl.accessToken) {
      console.warn('Mapbox token not configured')
      return
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: destinations[0]?.coordinates || [0, 20],
      zoom: destinations.length === 1 ? 10 : 2,
      interactive,
    })

    map.current.on('load', () => {
      setIsLoaded(true)
    })

    // Add navigation controls
    if (interactive) {
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    }

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [interactive])

  // Add markers and routes when destinations change
  useEffect(() => {
    if (!map.current || !isLoaded) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Remove existing route layers
    if (map.current.getLayer('route-line')) {
      map.current.removeLayer('route-line')
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route')
    }

    if (destinations.length === 0) return

    // Separate destinations (for route) from places (no route)
    const mainDestinations = destinations.filter(d =>
      ['origin', 'destination', 'stopover'].includes(d.type)
    )
    const places = destinations.filter(d =>
      !['origin', 'destination', 'stopover'].includes(d.type)
    )

    // Add markers for each destination
    destinations.forEach((dest, index) => {
      const isPlace = !['origin', 'destination', 'stopover'].includes(dest.type)
      const el = document.createElement('div')
      el.className = 'trip-marker'

      // Use emoji icons for places, numbers for main destinations
      const markerContent = isPlace
        ? `<div class="flex items-center justify-center w-7 h-7 rounded-full ${getMarkerColor(dest.type)} text-white text-sm shadow-lg border-2 border-white">${getMarkerIcon(dest.type)}</div>`
        : `<div class="flex items-center justify-center w-8 h-8 rounded-full ${getMarkerColor(dest.type)} text-white font-bold text-sm shadow-lg border-2 border-white">${mainDestinations.findIndex(d => d.id === dest.id) + 1}</div>`

      el.innerHTML = `<div class="relative">${markerContent}</div>`

      const dayInfo = dest.dayNumber ? `<p class="text-xs text-gray-500">Day ${dest.dayNumber}</p>` : ''
      const categoryInfo = dest.category ? `<p class="text-xs text-gray-500">${dest.category}</p>` : ''

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold">${dest.name}</h3>
          <p class="text-sm text-gray-600">
            ${dest.type.charAt(0).toUpperCase() + dest.type.slice(1)}
          </p>
          ${dayInfo}
          ${categoryInfo}
          ${dest.arrivalDate ? `<p class="text-xs text-gray-500">Arrive: ${dest.arrivalDate}</p>` : ''}
          ${dest.departureDate ? `<p class="text-xs text-gray-500">Depart: ${dest.departureDate}</p>` : ''}
        </div>
      `)

      const marker = new mapboxgl.Marker(el)
        .setLngLat(dest.coordinates)
        .setPopup(popup)
        .addTo(map.current!)

      marker.getElement().addEventListener('click', () => {
        setSelectedDestination(dest)
        onMarkerClick?.(dest)
      })

      markersRef.current.push(marker)
    })

    // Add route lines connecting destinations
    if (showRoutes && destinations.length > 1) {
      const coordinates = destinations
        .sort((a, b) => a.order - b.order)
        .map((d) => d.coordinates)

      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates,
          },
        },
      })

      map.current.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3,
          'line-dasharray': [2, 2],
        },
      })
    }

    // Fit bounds to show all destinations
    if (destinations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      destinations.forEach((dest) => bounds.extend(dest.coordinates))
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 12,
      })
    }
  }, [destinations, isLoaded, showRoutes, onMarkerClick])

  const handleZoomIn = () => {
    map.current?.zoomIn()
  }

  const handleZoomOut = () => {
    map.current?.zoomOut()
  }

  const handleFitBounds = () => {
    if (!map.current || destinations.length === 0) return
    const bounds = new mapboxgl.LngLatBounds()
    destinations.forEach((dest) => bounds.extend(dest.coordinates))
    map.current.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      maxZoom: 12,
    })
  }

  const handleResetNorth = () => {
    map.current?.resetNorth()
  }

  if (!mapboxgl.accessToken) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Map not available</p>
            <p className="text-sm">Configure Mapbox token to enable maps</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <div
        ref={mapContainer}
        className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
      />

      {/* Custom Controls */}
      {interactive && (
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
          <Button variant="secondary" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={handleFitBounds}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={handleResetNorth}>
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-h-[300px] overflow-y-auto">
        <h4 className="text-sm font-medium mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span>Origin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span>Stopover</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span>Final Destination</span>
          </div>
          <hr className="my-1 border-border" />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[8px]">⭐</div>
            <span>Attraction</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-[8px]">🍽️</div>
            <span>Restaurant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-600 flex items-center justify-center text-[8px]">🏛️</div>
            <span>Museum</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px]">🌳</div>
            <span>Park</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center text-[8px]">🎭</div>
            <span>Activity</span>
          </div>
          <hr className="my-1 border-border" />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[8px]">🏨</div>
            <span>Hotel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-[8px]">✈️</div>
            <span>Airport</span>
          </div>
        </div>
      </div>

      {/* Selected Destination Info */}
      {selectedDestination && (
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium">{selectedDestination.name}</h4>
              <Badge variant="secondary" className="mt-1">
                {selectedDestination.type}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setSelectedDestination(null)}
            >
              ×
            </Button>
          </div>
          {selectedDestination.arrivalDate && (
            <p className="text-sm text-muted-foreground mt-2">
              <Plane className="h-3 w-3 inline mr-1" />
              Arrive: {selectedDestination.arrivalDate}
            </p>
          )}
          {selectedDestination.departureDate && (
            <p className="text-sm text-muted-foreground">
              <Plane className="h-3 w-3 inline mr-1 rotate-45" />
              Depart: {selectedDestination.departureDate}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
