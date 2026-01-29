'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Search, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MapboxFeature {
  id: string
  place_name: string
  text: string
  center: [number, number]
  place_type: string[]
  context?: Array<{
    id: string
    text: string
    short_code?: string
  }>
}

interface MapboxGeocodingResponse {
  features: MapboxFeature[]
}

export interface DestinationResult {
  name: string
  fullName: string
  coordinates: [number, number]
  country?: string
  region?: string
}

interface DestinationSearchProps {
  onSelect: (destination: DestinationResult) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export function DestinationSearch({
  onSelect,
  placeholder = 'Where do you want to go?',
  className,
  autoFocus = false,
}: DestinationSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MapboxFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const searchLocations = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&` +
        `types=place,locality,region,country&` +
        `limit=5`
      )

      if (!response.ok) throw new Error('Search failed')

      const data: MapboxGeocodingResponse = await response.json()
      setResults(data.features)
      setIsOpen(data.features.length > 0)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Location search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(query)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, searchLocations])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (feature: MapboxFeature) => {
    const country = feature.context?.find(c => c.id.startsWith('country'))?.text
    const region = feature.context?.find(c => c.id.startsWith('region'))?.text

    const destination: DestinationResult = {
      name: feature.text,
      fullName: feature.place_name,
      coordinates: feature.center,
      country,
      region,
    }

    setQuery(feature.place_name)
    setIsOpen(false)
    onSelect(destination)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="h-14 pl-12 pr-12 text-lg rounded-xl border-2 border-primary/20 focus:border-primary transition-colors"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border-2 border-primary/20 rounded-xl shadow-lg overflow-hidden">
          <ul className="py-2">
            {results.map((feature, index) => (
              <li key={feature.id}>
                <button
                  onClick={() => handleSelect(feature)}
                  className={cn(
                    'w-full px-4 py-3 flex items-start gap-3 text-left transition-colors',
                    index === selectedIndex
                      ? 'bg-primary/10'
                      : 'hover:bg-muted'
                  )}
                >
                  <MapPin className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{feature.text}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {feature.place_name}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
