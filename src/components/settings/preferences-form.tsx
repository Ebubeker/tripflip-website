'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  preferencesSchema,
  type PreferencesFormData,
  TRAVEL_STYLES,
  INTERESTS,
  ACCOMMODATION_TYPES,
  BUDGET_OPTIONS,
  SEAT_PREFERENCES,
  MEAL_PREFERENCES,
} from '@/lib/validations/profile'
import { createClient } from '@/lib/supabase/client'
import type { UserPreferences } from '@/types/database'

interface PreferencesFormProps {
  preferences: UserPreferences
}

export function PreferencesForm({ preferences }: PreferencesFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      travel_style: preferences.travel_style || [],
      interests: preferences.interests || [],
      accommodation_type: preferences.accommodation_type || [],
      budget_preference: (preferences.budget_preference as PreferencesFormData['budget_preference']) || 'moderate',
      seat_preference: (preferences.seat_preference as PreferencesFormData['seat_preference']) || 'any',
      meal_preferences: preferences.meal_preferences || [],
      travel_frequency: (preferences.travel_frequency as PreferencesFormData['travel_frequency']) || 'occasionally',
      trip_duration_preference: (preferences.trip_duration_preference as PreferencesFormData['trip_duration_preference']) || 'week',
      ai_suggestions_enabled: preferences.ai_suggestions_enabled ?? true,
      notifications_enabled: preferences.notifications_enabled ?? true,
    },
  })

  async function onSubmit(data: PreferencesFormData) {
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('user_preferences')
        // @ts-expect-error - Supabase types inference issue with @supabase/ssr
        .update({
          travel_style: data.travel_style,
          interests: data.interests,
          accommodation_type: data.accommodation_type,
          budget_preference: data.budget_preference,
          seat_preference: data.seat_preference,
          meal_preferences: data.meal_preferences,
          travel_frequency: data.travel_frequency,
          trip_duration_preference: data.trip_duration_preference,
          ai_suggestions_enabled: data.ai_suggestions_enabled,
          notifications_enabled: data.notifications_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', preferences.id)

      if (error) {
        toast.error('Failed to update preferences')
        console.error(error)
        return
      }

      toast.success('Preferences updated successfully')
    } catch (error) {
      toast.error('Something went wrong')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Travel Style */}
        <Card>
          <CardHeader>
            <CardTitle>Travel Style</CardTitle>
            <CardDescription>
              What kind of travel experiences do you prefer?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="travel_style"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {TRAVEL_STYLES.map((style) => (
                      <FormField
                        key={style.value}
                        control={form.control}
                        name="travel_style"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(style.value)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...(field.value || []), style.value]
                                    : field.value?.filter((v) => v !== style.value) || []
                                  field.onChange(newValue)
                                }}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {style.label}
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
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Interests</CardTitle>
            <CardDescription>
              What activities and experiences interest you most?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="interests"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {INTERESTS.map((interest) => (
                      <FormField
                        key={interest.value}
                        control={form.control}
                        name="interests"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(interest.value)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...(field.value || []), interest.value]
                                    : field.value?.filter((v) => v !== interest.value) || []
                                  field.onChange(newValue)
                                }}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {interest.label}
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
          </CardContent>
        </Card>

        {/* Accommodation & Budget */}
        <Card>
          <CardHeader>
            <CardTitle>Accommodation & Budget</CardTitle>
            <CardDescription>
              Your accommodation and budget preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="accommodation_type"
              render={() => (
                <FormItem>
                  <FormLabel>Preferred Accommodation Types</FormLabel>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {ACCOMMODATION_TYPES.map((type) => (
                      <FormField
                        key={type.value}
                        control={form.control}
                        name="accommodation_type"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(type.value)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...(field.value || []), type.value]
                                    : field.value?.filter((v) => v !== type.value) || []
                                  field.onChange(newValue)
                                }}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {type.label}
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

            <FormField
              control={form.control}
              name="budget_preference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Preference</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your budget preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUDGET_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} - {option.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Flight Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Flight Preferences</CardTitle>
            <CardDescription>
              Your preferences for flight bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="seat_preference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seat Preference</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select seat preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SEAT_PREFERENCES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="meal_preferences"
              render={() => (
                <FormItem>
                  <FormLabel>Meal Preferences</FormLabel>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {MEAL_PREFERENCES.map((meal) => (
                      <FormField
                        key={meal.value}
                        control={form.control}
                        name="meal_preferences"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(meal.value)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...(field.value || []), meal.value]
                                    : field.value?.filter((v) => v !== meal.value) || []
                                  field.onChange(newValue)
                                }}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {meal.label}
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
          </CardContent>
        </Card>

        {/* AI & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>AI & Notifications</CardTitle>
            <CardDescription>
              Control AI suggestions and notification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="ai_suggestions_enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">AI Suggestions</FormLabel>
                    <FormDescription>
                      Get personalized travel recommendations from our AI assistant
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notifications_enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Notifications</FormLabel>
                    <FormDescription>
                      Receive trip reminders, price alerts, and updates
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </div>
      </form>
    </Form>
  )
}
