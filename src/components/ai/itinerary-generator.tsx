'use client'

import { useState } from 'react'
import { Wand2, Loader2, Calendar, DollarSign, MapPin, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface GeneratedDay {
  date: string
  title: string
  items: GeneratedActivity[]
}

interface GeneratedActivity {
  time_slot: string
  title: string
  description: string
  category: string
  location_name?: string
  location_address?: string
  estimated_cost?: number
  start_time?: string
  end_time?: string
  tips?: string
  booking_required?: boolean
}

interface GeneratedItinerary {
  days: GeneratedDay[]
  general_tips: string[]
  estimated_total_cost: number
}

interface ItineraryGeneratorProps {
  tripId: string
  destinations: string[]
  startDate: string
  endDate: string
  budget?: number
  currency?: string
  onItineraryGenerated?: (itinerary: GeneratedItinerary) => void
  onAddActivity?: (activity: GeneratedActivity, date: string) => Promise<void>
}

const TRAVEL_STYLES = [
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'packed', label: 'Packed' },
]

const INTERESTS = [
  { value: 'culture', label: 'Culture & Museums' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'nature', label: 'Nature & Outdoors' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'history', label: 'History' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'relaxation', label: 'Relaxation' },
]

export function ItineraryGenerator({
  tripId,
  destinations,
  startDate,
  endDate,
  budget,
  currency = 'USD',
  onItineraryGenerated,
  onAddActivity,
}: ItineraryGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedItinerary, setGeneratedItinerary] = useState<GeneratedItinerary | null>(null)
  const [travelStyle, setTravelStyle] = useState('balanced')
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['culture', 'food'])
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          destinations,
          startDate,
          endDate,
          budget,
          currency,
          travelStyle,
          interests: selectedInterests,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate itinerary')
      }

      const data = await response.json()
      setGeneratedItinerary(data.itinerary)
      onItineraryGenerated?.(data.itinerary)
    } catch (err) {
      console.error('Generate error:', err)
      setError('Failed to generate itinerary. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  const handleAddActivity = async (activity: GeneratedActivity, date: string) => {
    if (onAddActivity) {
      await onAddActivity(activity, date)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          <CardTitle>AI Itinerary Generator</CardTitle>
        </div>
        <CardDescription>
          Let AI create a personalized itinerary based on your preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration */}
        {!generatedItinerary && (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Travel Style</Label>
                <Select value={travelStyle} onValueChange={setTravelStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAVEL_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Interests (select at least one)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {INTERESTS.map((interest) => (
                    <div key={interest.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest.value}
                        checked={selectedInterests.includes(interest.value)}
                        onCheckedChange={() => toggleInterest(interest.value)}
                      />
                      <label
                        htmlFor={interest.value}
                        className="text-sm cursor-pointer"
                      >
                        {interest.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Your trip:</p>
              <div className="space-y-1 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {destinations.join(' → ')}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {startDate} - {endDate}
                </p>
                {budget && (
                  <p className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Budget: {currency} {budget.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || selectedInterests.length === 0}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Itinerary...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Itinerary
                </>
              )}
            </Button>
          </>
        )}

        {/* Generated Itinerary */}
        {generatedItinerary && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Generated Itinerary</h3>
                <p className="text-sm text-muted-foreground">
                  Estimated total: {currency} {generatedItinerary.estimated_total_cost.toLocaleString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGeneratedItinerary(null)}
              >
                Generate New
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-6">
                {generatedItinerary.days.map((day, dayIndex) => (
                  <div key={dayIndex} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{day.date}</Badge>
                      <span className="font-medium">{day.title}</span>
                    </div>

                    <div className="space-y-2 pl-4 border-l-2 border-muted">
                      {day.items.map((activity, actIndex) => (
                        <div
                          key={actIndex}
                          className="bg-muted/50 rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-sm">{activity.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {activity.description}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddActivity(activity, day.date)}
                            >
                              Add
                            </Button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {activity.time_slot}
                            </Badge>
                            {activity.start_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {activity.start_time}
                                {activity.end_time && ` - ${activity.end_time}`}
                              </span>
                            )}
                            {activity.location_name && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {activity.location_name}
                              </span>
                            )}
                            {activity.estimated_cost && activity.estimated_cost > 0 && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {activity.estimated_cost}
                              </span>
                            )}
                          </div>

                          {activity.tips && (
                            <p className="text-xs italic text-muted-foreground">
                              Tip: {activity.tips}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {generatedItinerary.general_tips.length > 0 && (
              <div className="bg-primary/5 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">General Tips</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {generatedItinerary.general_tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
