'use client'

import { useState } from 'react'
import { format, addDays, addWeeks, startOfDay } from 'date-fns'
import { Calendar, Users, Wallet, ChevronDown, ChevronUp, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { CitySearch } from './city-search'

export interface TripOptions {
  startDate: Date | undefined
  endDate: Date | undefined
  travelers: number
  budget: number | undefined
  currency: string
  departureCity?: string
}

interface QuickOptionsProps {
  options: TripOptions
  onChange: (options: TripOptions) => void
  className?: string
}

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (\u20AC)' },
  { value: 'GBP', label: 'GBP (\u00A3)' },
  { value: 'JPY', label: 'JPY (\u00A5)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
]

export function QuickOptions({ options, onChange, className }: QuickOptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateOption = <K extends keyof TripOptions>(key: K, value: TripOptions[K]) => {
    onChange({ ...options, [key]: value })
  }

  return (
    <div className={cn('w-full', className)}>
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-muted-foreground hover:text-foreground"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-4 w-4 mr-2" />
            Hide options
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 mr-2" />
            More options (dates, travelers, budget)
          </>
        )}
      </Button>

      {isExpanded && (
        <div className="mt-4 p-5 bg-card rounded-xl border-2 border-primary/10 space-y-4">
          {/* Row 1: Departure, Dates, Travelers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Departure City */}
            <div className="space-y-1.5 lg:col-span-1">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Plane className="h-4 w-4 text-primary" />
                Flying from
              </Label>
              <CitySearch
                value={options.departureCity}
                onChange={(city) => updateOption('departureCity', city)}
                placeholder="Enter departure city"
              />
            </div>

            {/* Date Range */}
            <div className="space-y-1.5 lg:col-span-1">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Travel Dates
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-10',
                      !options.startDate && 'text-muted-foreground'
                    )}
                  >
                    {options.startDate ? (
                      options.endDate ? (
                        `${format(options.startDate, 'MMM d')} - ${format(options.endDate, 'MMM d')}`
                      ) : (
                        format(options.startDate, 'MMM d, yyyy')
                      )
                    ) : (
                      'Select dates'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="range"
                    selected={{
                      from: options.startDate,
                      to: options.endDate,
                    }}
                    onSelect={(range) => {
                      onChange({
                        ...options,
                        startDate: range?.from,
                        endDate: range?.to,
                      })
                    }}
                    disabled={(date) => startOfDay(date) < startOfDay(new Date())}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Travelers */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Travelers
              </Label>
              <Select
                value={options.travelers.toString()}
                onValueChange={(value) => updateOption('travelers', parseInt(value))}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'traveler' : 'travelers'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                Budget
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={options.budget || ''}
                  onChange={(e) => updateOption('budget', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="h-10 flex-1 min-w-0"
                />
                <Select
                  value={options.currency}
                  onValueChange={(value) => updateOption('currency', value)}
                >
                  <SelectTrigger className="h-10 w-25 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Row 2: Quick Date Presets */}
          <div className="flex items-center gap-3 pt-2 border-t border-border/50">
            <span className="text-sm text-muted-foreground">Quick dates:</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const start = addWeeks(new Date(), 2)
                  onChange({
                    ...options,
                    startDate: start,
                    endDate: addDays(start, 7),
                  })
                }}
                className="h-8"
              >
                In 2 weeks
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const start = addWeeks(new Date(), 4)
                  onChange({
                    ...options,
                    startDate: start,
                    endDate: addDays(start, 7),
                  })
                }}
                className="h-8"
              >
                Next month
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
