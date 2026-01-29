'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Upload, Images, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PhotoUploadDropzone, PhotoGrid, AlbumCard } from '@/components/photos'
import { createClient, createUntypedClient } from '@/lib/supabase/client'
import type { TripAlbum, AlbumPhoto } from '@/types/database'

export default function PhotosPage() {
  const params = useParams()
  const tripId = params.tripId as string
  const supabase = createClient()

  const [albums, setAlbums] = useState<(TripAlbum & { photo_count: number })[]>([])
  const [photos, setPhotos] = useState<AlbumPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch albums and photos
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch albums with photo counts
        const { data: albumsData, error: albumsError } = await supabase
          .from('trip_albums')
          .select('*')
          .eq('trip_id', tripId)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: true }) as { data: TripAlbum[] | null; error: Error | null }

        if (albumsError) throw albumsError

        // Fetch all photos for this trip
        const { data: photosData, error: photosError } = await supabase
          .from('album_photos')
          .select('*')
          .eq('trip_id', tripId)
          .order('order_index', { ascending: true }) as { data: AlbumPhoto[] | null; error: Error | null }

        if (photosError) throw photosError

        // Calculate photo counts per album
        const albumsWithCounts = (albumsData || []).map((album) => ({
          ...album,
          photo_count: (photosData || []).filter((p) => p.album_id === album.id).length,
        }))

        // If no default album exists, create one
        if (!albumsWithCounts.find((a) => a.is_default)) {
          const untypedSupabase = createUntypedClient()
          const { data: defaultAlbum, error: createError } = await untypedSupabase
            .from('trip_albums')
            .insert({
              trip_id: tripId,
              name: 'All Photos',
              description: 'All photos from this trip',
              is_default: true,
            })
            .select()
            .single()

          if (!createError && defaultAlbum) {
            albumsWithCounts.unshift({ ...(defaultAlbum as TripAlbum), photo_count: 0 })
          }
        }

        setAlbums(albumsWithCounts)
        setPhotos(photosData || [])
      } catch (error) {
        console.error('Error fetching photos:', error)
        toast.error('Failed to load photos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [tripId, supabase])
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isCreateAlbumDialogOpen, setIsCreateAlbumDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [newAlbumName, setNewAlbumName] = useState('')
  const [newAlbumDescription, setNewAlbumDescription] = useState('')

  const selectedAlbum = selectedAlbumId
    ? albums.find((a) => a.id === selectedAlbumId)
    : null

  const albumPhotos = selectedAlbumId
    ? photos.filter((p) => p.album_id === selectedAlbumId || selectedAlbum?.is_default)
    : []

  const handleUpload = async (files: File[]) => {
    setIsUploading(true)
    const defaultAlbum = albums.find((a) => a.is_default)
    const albumId = selectedAlbumId || defaultAlbum?.id

    if (!albumId) {
      toast.error('No album selected')
      setIsUploading(false)
      return
    }

    try {
      const uploadedPhotos: AlbumPhoto[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${tripId}/${crypto.randomUUID()}.${fileExt}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName)

        const photoUrl = urlData.publicUrl

        // Save photo record to database
        const untypedSupabase = createUntypedClient()
        const { data: photoData, error: dbError } = await untypedSupabase
          .from('album_photos')
          .insert({
            album_id: albumId,
            trip_id: tripId,
            url: photoUrl,
            thumbnail_url: photoUrl,
            caption: file.name.replace(/\.[^/.]+$/, ''),
            order_index: photos.length + i,
          })
          .select()
          .single()

        if (dbError) {
          console.error('Database error:', dbError)
          continue
        }

        uploadedPhotos.push(photoData as AlbumPhoto)
      }

      if (uploadedPhotos.length > 0) {
        setPhotos([...photos, ...uploadedPhotos])
        // Update album photo count
        setAlbums(
          albums.map((a) =>
            a.id === albumId
              ? { ...a, photo_count: a.photo_count + uploadedPhotos.length }
              : a
          )
        )
        toast.success(`${uploadedPhotos.length} photo${uploadedPhotos.length > 1 ? 's' : ''} uploaded!`)
      } else {
        toast.error('Failed to upload photos')
      }

      setIsUploadDialogOpen(false)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload photos')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      toast.error('Album name is required')
      return
    }

    try {
      const untypedSupabase = createUntypedClient()
      const { data, error } = await untypedSupabase
        .from('trip_albums')
        .insert({
          trip_id: tripId,
          name: newAlbumName,
          description: newAlbumDescription || null,
          is_default: false,
        })
        .select()
        .single()

      if (error) throw error

      setAlbums([...albums, { ...(data as TripAlbum), photo_count: 0 }])
      setIsCreateAlbumDialogOpen(false)
      setNewAlbumName('')
      setNewAlbumDescription('')
      toast.success('Album created!')
    } catch (error) {
      console.error('Create album error:', error)
      toast.error('Failed to create album')
    }
  }

  const handleToggleFavorite = async (photo: AlbumPhoto) => {
    try {
      const untypedSupabase = createUntypedClient()
      const { error } = await untypedSupabase
        .from('album_photos')
        .update({ is_favorite: !photo.is_favorite })
        .eq('id', photo.id)

      if (error) throw error

      setPhotos(
        photos.map((p) =>
          p.id === photo.id ? { ...p, is_favorite: !p.is_favorite } : p
        )
      )
    } catch (error) {
      console.error('Toggle favorite error:', error)
      toast.error('Failed to update photo')
    }
  }

  const handleDeletePhoto = async (photo: AlbumPhoto) => {
    try {
      const untypedSupabase = createUntypedClient()
      // Delete from database
      const { error: dbError } = await untypedSupabase
        .from('album_photos')
        .delete()
        .eq('id', photo.id)

      if (dbError) throw dbError

      // Try to delete from storage (extract filename from URL)
      const urlParts = photo.url.split('/')
      const fileName = urlParts.slice(-2).join('/')
      await supabase.storage.from('photos').remove([fileName])

      setPhotos(photos.filter((p) => p.id !== photo.id))
      // Update album photo count
      setAlbums(
        albums.map((a) =>
          a.id === photo.album_id
            ? { ...a, photo_count: Math.max(0, a.photo_count - 1) }
            : a
        )
      )
      toast.success('Photo deleted')
    } catch (error) {
      console.error('Delete photo error:', error)
      toast.error('Failed to delete photo')
    }
  }

  const handleDeleteAlbum = async (album: TripAlbum) => {
    if (album.is_default) {
      toast.error('Cannot delete the default album')
      return
    }

    try {
      const untypedSupabase = createUntypedClient()
      // Delete all photos in the album first
      const albumPhotos = photos.filter((p) => p.album_id === album.id)
      for (const photo of albumPhotos) {
        const urlParts = photo.url.split('/')
        const fileName = urlParts.slice(-2).join('/')
        await supabase.storage.from('photos').remove([fileName])
      }

      // Delete photos from database
      await untypedSupabase.from('album_photos').delete().eq('album_id', album.id)

      // Delete album
      const { error } = await untypedSupabase
        .from('trip_albums')
        .delete()
        .eq('id', album.id)

      if (error) throw error

      setAlbums(albums.filter((a) => a.id !== album.id))
      setPhotos(photos.filter((p) => p.album_id !== album.id))
      toast.success('Album deleted')
    } catch (error) {
      console.error('Delete album error:', error)
      toast.error('Failed to delete album')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedAlbumId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedAlbumId(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-semibold">
              {selectedAlbum ? selectedAlbum.name : 'Photos'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedAlbum
                ? selectedAlbum.description || `${albumPhotos.length} photos`
                : 'Capture and organize your trip memories'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!selectedAlbumId && (
            <Dialog open={isCreateAlbumDialogOpen} onOpenChange={setIsCreateAlbumDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  New Album
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Album</DialogTitle>
                  <DialogDescription>
                    Create a new photo album for this trip
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="album-name">Album Name</Label>
                    <Input
                      id="album-name"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      placeholder="e.g., Beach Days"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="album-description">Description (Optional)</Label>
                    <Textarea
                      id="album-description"
                      value={newAlbumDescription}
                      onChange={(e) => setNewAlbumDescription(e.target.value)}
                      placeholder="Add a description..."
                      rows={2}
                    />
                  </div>
                  <Button onClick={handleCreateAlbum} className="w-full">
                    Create Album
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Photos</DialogTitle>
                <DialogDescription>
                  Upload photos to {selectedAlbum?.name || 'your trip'}
                </DialogDescription>
              </DialogHeader>
              <PhotoUploadDropzone
                onUpload={handleUpload}
                isUploading={isUploading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedAlbumId ? (
        // Show photos in selected album
        <PhotoGrid
          photos={albumPhotos}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDeletePhoto}
        />
      ) : (
        // Show album grid
        <>
          {albums.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onClick={() => setSelectedAlbumId(album.id)}
                  onDelete={() => handleDeleteAlbum(album)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Images className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No albums yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create an album to start organizing your photos
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setIsCreateAlbumDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Album
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
