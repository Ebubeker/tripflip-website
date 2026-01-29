'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Calendar, MapPin, Users, Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface TripHeaderProps {
  title: string
  description?: string
  startDate: string
  endDate: string
  destination: string
  travelers: number
  onUpdate?: (title: string, description: string) => Promise<void>
}

export function TripHeader({
  title,
  description,
  startDate,
  endDate,
  destination,
  travelers,
  onUpdate,
}: TripHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editDescription, setEditDescription] = useState(description || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!onUpdate) return
    setIsSaving(true)
    try {
      await onUpdate(editTitle, editDescription)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditTitle(title)
    setEditDescription(description || '')
    setIsEditing(false)
  }

  const formatDateRange = () => {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 md:p-8">
      {isEditing ? (
        <div className="space-y-4">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-2xl font-bold h-auto py-2 bg-background"
            placeholder="Trip title"
          />
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="resize-none bg-background"
            placeholder="Add a description..."
            rows={2}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
              {description && (
                <p className="text-muted-foreground mb-4">{description}</p>
              )}
            </div>
            {onUpdate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="shrink-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{destination}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{formatDateRange()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span>{travelers} {travelers === 1 ? 'traveler' : 'travelers'}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
