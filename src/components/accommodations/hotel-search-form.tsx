'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays } from 'date-fns'
import { CalendarIcon, Loader2, Search, Building2, Users, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

const hotelSearchSchema = z.object({
  cityCode: z.string().min(3, 'Enter city code').max(3),
  checkInDate: z.date({ message: 'Select check-in date' }),
  checkOutDate: z.date({ message: 'Select check-out date' }),
  adults: z.number().min(1).max(9),
  roomQuantity: z.number().min(1).max(9),
  ratings: z.array(z.string()).optional(),
})

type HotelSearchData = z.infer<typeof hotelSearchSchema>

interface HotelSearchFormProps {
  onSearch: (data: HotelSearchData) => Promise<void>
  isLoading?: boolean
  defaultCityCode?: string
}

const RATING_OPTIONS = [
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
]

export function HotelSearchForm({
  onSearch,
  isLoading,
  defaultCityCode = '',
}: HotelSearchFormProps) {
  const form = useForm<HotelSearchData>({
    resolver: zodResolver(hotelSearchSchema),
    defaultValues: {
      cityCode: defaultCityCode,
      adults: 2,
      roomQuantity: 1,
      ratings: [],
    },
  })

  const handleSubmit = async (data: HotelSearchData) => {
    await onSearch(data)
  }

  const checkInDate = form.watch('checkInDate')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* City Code */}
        <FormField
          control={form.control}
          name="cityCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                Destination City
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="NYC, PAR, LON..."
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  maxLength={3}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="checkInDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Check-in</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date)
                        // Auto-set checkout to next day if not set
                        if (date && !form.getValues('checkOutDate')) {
                          form.setValue('checkOutDate', addDays(date, 1))
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkOutDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Check-out</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const minDate = checkInDate || new Date()
                        return date <= minDate
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Guests and Rooms */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="adults"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Guests
                </FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roomQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rooms</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Room' : 'Rooms'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Star Rating Filter */}
        <FormField
          control={form.control}
          name="ratings"
          render={() => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                Star Rating (Optional)
              </FormLabel>
              <div className="flex flex-wrap gap-4">
                {RATING_OPTIONS.map((option) => (
                  <FormField
                    key={option.value}
                    control={form.control}
                    name="ratings"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const current = field.value || []
                              if (checked) {
                                field.onChange([...current, option.value])
                              } else {
                                field.onChange(
                                  current.filter((v) => v !== option.value)
                                )
                              }
                            }}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search Hotels
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
