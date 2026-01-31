'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Button } from '@/components/ui/button'
import { 
  Map as MapIcon, 
  Navigation, 
  Layers,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'

// Set Mapbox token
if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
}

interface Location {
  id: string
  name: string
  type: 'hotel' | 'activity' | 'flight' | 'restaurant' | 'attraction'
  latitude: number
  longitude: number
  day?: number
  order?: number
}

interface TripMapProps {
  locations: Location[]
  hotel?: { latitude: number; longitude: number; name: string }
  flights?: Array<{
    departure: { lat: number; lng: number; code: string }
    arrival: { lat: number; lng: number; code: string }
  }>
  viewMode?: 'overview' | 'daily' | 'navigation'
  currentDay?: number
  totalDays?: number
  onDayChange?: (day: number) => void
  onClose?: () => void
  fullscreen?: boolean
}

export function TripMap({
  locations,
  hotel,
  flights,
  viewMode = 'overview',
  currentDay = 1,
  totalDays = 1,
  onDayChange,
  onClose,
  fullscreen = false
}: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mode, setMode] = useState(viewMode)
  const [day, setDay] = useState(currentDay)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  // Filter locations for daily view
  const visibleLocations = mode === 'daily' 
    ? locations.filter(l => l.day === day)
    : locations

  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: hotel ? [hotel.longitude, hotel.latitude] : [0, 0],
      zoom: 12
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
    }
  }, [])

  // Update markers when locations change
  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // Add hotel marker
    if (hotel) {
      const hotelEl = document.createElement('div')
      hotelEl.className = 'w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white'
      hotelEl.innerHTML = '🏨'
      
      const marker = new mapboxgl.Marker(hotelEl)
        .setLngLat([hotel.longitude, hotel.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${hotel.name}</strong><p>Your accommodation</p>`))
        .addTo(map.current!)
      
      markersRef.current.push(marker)
    }

    // Add location markers
    visibleLocations.forEach((loc, index) => {
      const el = document.createElement('div')
      
      // Color based on type
      const colors: Record<string, string> = {
        activity: 'bg-blue-500',
        restaurant: 'bg-orange-500',
        attraction: 'bg-purple-500',
        flight: 'bg-cyan-500'
      }
      
      el.className = `w-7 h-7 ${colors[loc.type] || 'bg-gray-500'} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform`
      
      if (mode === 'daily') {
        el.innerHTML = `${loc.order || index + 1}`
      } else {
        const icons: Record<string, string> = {
          activity: '📍',
          restaurant: '🍽️',
          attraction: '🏛️',
          flight: '✈️'
        }
        el.innerHTML = icons[loc.type] || '📍'
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat([loc.longitude, loc.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <strong>${loc.name}</strong>
          ${loc.day ? `<p class="text-gray-500">Day ${loc.day}</p>` : ''}
        `))
        .addTo(map.current!)
      
      markersRef.current.push(marker)
    })

    // Draw route line for daily view
    if (mode === 'daily' && visibleLocations.length > 1) {
      const coordinates = visibleLocations
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(l => [l.longitude, l.latitude])

      // Add hotel at start if exists
      if (hotel) {
        coordinates.unshift([hotel.longitude, hotel.latitude])
      }

      // Remove existing route layer
      if (map.current.getSource('route')) {
        map.current.removeLayer('route-line')
        map.current.removeSource('route')
      }

      // Add route line
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates
          }
        }
      })

      map.current.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3B82F6',
          'line-width': 3,
          'line-dasharray': [2, 2]
        }
      })
    }

    // Fit bounds to show all markers
    if (visibleLocations.length > 0 || hotel) {
      const bounds = new mapboxgl.LngLatBounds()
      
      if (hotel) {
        bounds.extend([hotel.longitude, hotel.latitude])
      }
      
      visibleLocations.forEach(loc => {
        bounds.extend([loc.longitude, loc.latitude])
      })

      map.current.fitBounds(bounds, { 
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 14
      })
    }
  }, [visibleLocations, hotel, mode, day])

  // Handle day change
  const handleDayChange = (newDay: number) => {
    setDay(newDay)
    onDayChange?.(newDay)
  }

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className={`bg-gray-100 rounded-2xl flex items-center justify-center ${fullscreen ? 'fixed inset-0 z-50' : 'h-96'}`}>
        <div className="text-center text-gray-500">
          <MapIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Map unavailable</p>
          <p className="text-sm">Mapbox token not configured</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${fullscreen ? 'fixed inset-0 z-50' : 'h-96 rounded-2xl overflow-hidden'}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* View Mode Selector */}
        <div className="flex gap-2 pointer-events-auto">
          <Button
            size="sm"
            variant={mode === 'overview' ? 'default' : 'secondary'}
            onClick={() => setMode('overview')}
            className="shadow-lg"
          >
            <Layers className="w-4 h-4 mr-1" />
            Overview
          </Button>
          <Button
            size="sm"
            variant={mode === 'daily' ? 'default' : 'secondary'}
            onClick={() => setMode('daily')}
            className="shadow-lg"
          >
            <Navigation className="w-4 h-4 mr-1" />
            Daily
          </Button>
        </div>

        {/* Close Button (fullscreen) */}
        {fullscreen && onClose && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onClose}
            className="shadow-lg pointer-events-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Day Navigator (Daily Mode) */}
      {mode === 'daily' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-lg">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleDayChange(Math.max(1, day - 1))}
            disabled={day <= 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span className="font-medium min-w-[60px] text-center">
            Day {day}
          </span>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleDayChange(Math.min(totalDays, day + 1))}
            disabled={day >= totalDays}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-lg text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Hotel</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Activity</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Restaurant</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span>Attraction</span>
        </div>
      </div>
    </div>
  )
}
