'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Loader2, X } from 'lucide-react'
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

export interface CityResult {
  name: string
  fullName: string
  country?: string
}

interface CitySearchProps {
  value?: string
  onChange: (city: string | undefined) => void
  placeholder?: string
  className?: string
}

export function CitySearch({
  value,
  onChange,
  placeholder = 'Enter city',
  className,
}: CitySearchProps) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState<MapboxFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Sync external value changes
  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value)
    }
  }, [value])

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
        `types=place,locality&` +
        `limit=5`
      )

      if (!response.ok) throw new Error('Search failed')

      const data: MapboxGeocodingResponse = await response.json()
      setResults(data.features)
      setIsOpen(data.features.length > 0)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('City search error:', error)
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
    const cityName = feature.text
    const country = getCountry(feature)
    // Include country in the value for proper airport lookup
    const fullCityName = country ? `${cityName}, ${country}` : cityName
    setQuery(fullCityName)
    setIsOpen(false)
    onChange(fullCityName)
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
    onChange(undefined)
    inputRef.current?.focus()
  }

  const getCountry = (feature: MapboxFeature) => {
    return feature.context?.find(c => c.id.startsWith('country'))?.text
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!e.target.value) {
              onChange(undefined)
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'h-10 pr-8',
            isLoading && 'pr-8'
          )}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {query && !isLoading && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border rounded-lg shadow-lg overflow-hidden">
          <ul className="py-1">
            {results.map((feature, index) => (
              <li key={feature.id}>
                <button
                  onClick={() => handleSelect(feature)}
                  className={cn(
                    'w-full px-3 py-2 flex items-center gap-2 text-left transition-colors text-sm',
                    index === selectedIndex
                      ? 'bg-primary/10'
                      : 'hover:bg-muted'
                  )}
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{feature.text}</span>
                    {getCountry(feature) && (
                      <span className="text-muted-foreground ml-1">
                        , {getCountry(feature)}
                      </span>
                    )}
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
