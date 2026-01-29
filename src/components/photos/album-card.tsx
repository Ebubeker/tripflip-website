'use client'

import { Images, MoreVertical, Edit, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { TripAlbum } from '@/types/database'

interface AlbumCardProps {
  album: TripAlbum & { photo_count?: number }
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function AlbumCard({ album, onClick, onEdit, onDelete }: AlbumCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden cursor-pointer transition-shadow hover:shadow-md',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="relative aspect-video bg-muted">
        {album.cover_photo_url ? (
          <img
            src={album.cover_photo_url}
            alt={album.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Images className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Actions dropdown */}
        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="secondary" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Album
                  </DropdownMenuItem>
                )}
                {onDelete && !album.is_default && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Album
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Default badge */}
        {album.is_default && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
            Default
          </div>
        )}
      </div>

      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="font-medium truncate">{album.name}</h3>
            {album.description && (
              <p className="text-sm text-muted-foreground truncate">
                {album.description}
              </p>
            )}
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">
            {album.photo_count ?? 0} photo{(album.photo_count ?? 0) !== 1 ? 's' : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
