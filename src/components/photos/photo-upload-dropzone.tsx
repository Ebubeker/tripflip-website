'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface PhotoUploadDropzoneProps {
  onUpload: (files: File[]) => Promise<void>
  isUploading?: boolean
  maxFiles?: number
  maxSize?: number // in bytes
  accept?: Record<string, string[]>
}

interface FilePreview {
  file: File
  preview: string
}

export function PhotoUploadDropzone({
  onUpload,
  isUploading,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
  },
}: PhotoUploadDropzoneProps) {
  const [previews, setPreviews] = useState<FilePreview[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newPreviews = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))
      setPreviews((prev) => [...prev, ...newPreviews].slice(0, maxFiles))
    },
    [maxFiles]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      maxFiles,
      maxSize,
      disabled: isUploading,
    })

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const newPreviews = [...prev]
      URL.revokeObjectURL(newPreviews[index].preview)
      newPreviews.splice(index, 1)
      return newPreviews
    })
  }

  const handleUpload = async () => {
    if (previews.length === 0) return

    const files = previews.map((p) => p.file)

    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90))
    }, 200)

    try {
      await onUpload(files)
      setUploadProgress(100)

      // Clear previews after successful upload
      previews.forEach((p) => URL.revokeObjectURL(p.preview))
      setPreviews([])
    } finally {
      clearInterval(progressInterval)
      setTimeout(() => setUploadProgress(0), 500)
    }
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          isUploading && 'pointer-events-none opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm font-medium">Drop photos here...</p>
          ) : (
            <>
              <p className="text-sm font-medium">
                Drag & drop photos here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Up to {maxFiles} files, max {Math.round(maxSize / (1024 * 1024))}MB each
              </p>
            </>
          )}
        </div>
      </div>

      {/* File rejections */}
      {fileRejections.length > 0 && (
        <div className="text-sm text-destructive">
          {fileRejections.map(({ file, errors }) => (
            <p key={file.name}>
              {file.name}: {errors.map((e) => e.message).join(', ')}
            </p>
          ))}
        </div>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {previews.map((preview, index) => (
              <div key={preview.preview} className="relative group aspect-square">
                <img
                  src={preview.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => removePreview(index)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload progress */}
          {isUploading && uploadProgress > 0 && (
            <Progress value={uploadProgress} className="h-2" />
          )}

          {/* Upload button */}
          <Button
            onClick={handleUpload}
            disabled={isUploading || previews.length === 0}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading {previews.length} photo{previews.length > 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {previews.length} photo{previews.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
