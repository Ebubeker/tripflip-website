'use client'

import { useState } from 'react'
import { Copy, Check, Link, Mail, Share2, Twitter, Facebook, MessageCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface ShareDialogProps {
  tripId: string
  tripName: string
  isPublic?: boolean
  shareId?: string | null
  onTogglePublic?: (isPublic: boolean) => Promise<void>
  trigger?: React.ReactNode
}

export function ShareDialog({
  tripId,
  tripName,
  isPublic = false,
  shareId,
  onTogglePublic,
  trigger,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [publicEnabled, setPublicEnabled] = useState(isPublic)

  const shareUrl = shareId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${shareId}`
    : null

  const handleCopy = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const handleTogglePublic = async (checked: boolean) => {
    if (!onTogglePublic) return

    setIsUpdating(true)
    try {
      await onTogglePublic(checked)
      setPublicEnabled(checked)
      if (checked) {
        toast.success('Trip is now public')
      } else {
        toast.success('Trip is now private')
      }
    } catch (err) {
      toast.error('Failed to update sharing settings')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleShare = async (platform: string) => {
    if (!shareUrl) return

    const text = `Check out my trip: ${tripName}`
    let url = ''

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`
        break
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(`Trip: ${tripName}`)}&body=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`
        break
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleNativeShare = async () => {
    if (!shareUrl || !navigator.share) return

    try {
      await navigator.share({
        title: tripName,
        text: `Check out my trip: ${tripName}`,
        url: shareUrl,
      })
    } catch (err) {
      // User cancelled or share failed
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Trip</DialogTitle>
          <DialogDescription>
            Share your trip with friends and family
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Public Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="public-switch" className="font-medium">
                Public Trip
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow anyone with the link to view this trip
              </p>
            </div>
            <Switch
              id="public-switch"
              checked={publicEnabled}
              onCheckedChange={handleTogglePublic}
              disabled={isUpdating}
            />
          </div>

          {/* Share Link */}
          {publicEnabled && shareUrl && (
            <>
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="space-y-2">
                <Label>Share via</Label>
                <div className="flex flex-wrap gap-2">
                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNativeShare}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('twitter')}
                  >
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('facebook')}
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('whatsapp')}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('email')}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                </div>
              </div>
            </>
          )}

          {!publicEnabled && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              <Link className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Enable public sharing to get a shareable link</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
