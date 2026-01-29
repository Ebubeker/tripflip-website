'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Heart, Trash2, MapPin, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { AlbumPhoto } from '@/types/database'

interface PhotoGridProps {
  photos: AlbumPhoto[]
  onToggleFavorite?: (photo: AlbumPhoto) => void
  onDelete?: (photo: AlbumPhoto) => void
}

export function PhotoGrid({ photos, onToggleFavorite, onDelete }: PhotoGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No photos in this album yet</p>
      </div>
    )
  }

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
  }

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null

  return (
    <>
      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative group aspect-square cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <img
              src={photo.thumbnail_url || photo.url}
              alt={photo.caption || `Photo ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                {photo.caption && (
                  <span className="text-white text-xs truncate max-w-[70%]">
                    {photo.caption}
                  </span>
                )}
                {photo.is_favorite && (
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                )}
              </div>
            </div>

            {/* Favorite indicator (always visible if favorited) */}
            {photo.is_favorite && (
              <div className="absolute top-2 right-2">
                <Heart className="h-4 w-4 text-red-500 fill-red-500 drop-shadow-md" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => closeLightbox()}>
        <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">
            Photo viewer - {selectedPhoto?.caption || 'Photo'}
          </DialogTitle>
          {selectedPhoto && (
            <div className="relative">
              {/* Main Image */}
              <div className="relative bg-black flex items-center justify-center min-h-[400px] max-h-[70vh]">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption || 'Photo'}
                  className="max-w-full max-h-[70vh] object-contain"
                />

                {/* Navigation Buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevious()
                  }}
                  disabled={selectedIndex === 0}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  disabled={selectedIndex === photos.length - 1}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-white hover:bg-white/20"
                  onClick={() => closeLightbox()}
                >
                  <X className="h-6 w-6" />
                </Button>

                {/* Counter */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                  {(selectedIndex ?? 0) + 1} / {photos.length}
                </div>
              </div>

              {/* Photo Info */}
              <div className="p-4 bg-background">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    {selectedPhoto.caption && (
                      <p className="font-medium">{selectedPhoto.caption}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {selectedPhoto.location_name && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {selectedPhoto.location_name}
                        </span>
                      )}
                      {selectedPhoto.taken_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(parseISO(selectedPhoto.taken_at), 'PPP')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onToggleFavorite && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite(selectedPhoto)
                        }}
                      >
                        <Heart
                          className={cn(
                            'h-5 w-5',
                            selectedPhoto.is_favorite && 'text-red-500 fill-red-500'
                          )}
                        />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(selectedPhoto)
                          closeLightbox()
                        }}
                      >
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
