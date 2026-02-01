'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Bell, CheckCircle, PaperPlaneTilt, Gift, Sparkle, Users } from '@phosphor-icons/react'

const BENEFITS = [
  { icon: Gift, text: 'Early access to new features' },
  { icon: Sparkle, text: 'Exclusive launch discounts' },
  { icon: Users, text: 'Join our founding community' },
]

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'modal' }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.alreadyExists) {
          setError('You\'re already on the waitlist!')
        } else {
          setError(data.error || 'Something went wrong. Please try again.')
        }
        return
      }

      setIsSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset form after modal closes
    setTimeout(() => {
      setIsSubmitted(false)
      setEmail('')
      setError('')
    }, 200)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white border-2 border-slate-200 shadow-2xl">
        {!isSubmitted ? (
          <>
            <DialogHeader>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-100 flex items-center justify-center">
                <Bell weight="duotone" className="w-8 h-8 text-sky-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center text-gray-900">
                Join Our Waitlist
              </DialogTitle>
              <DialogDescription className="text-center text-gray-600">
                Be the first to know when we launch and get exclusive early-bird offers.
              </DialogDescription>
            </DialogHeader>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {BENEFITS.map((benefit) => {
                const IconComponent = benefit.icon
                return (
                  <div
                    key={benefit.text}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200"
                  >
                    <IconComponent weight="duotone" className="w-4 h-4 text-sky-600" />
                    <span className="text-xs text-gray-700">{benefit.text}</span>
                  </div>
                )
              })}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 px-4 bg-white border-2 border-sky-200 placeholder:text-gray-400 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all rounded-lg"
                  disabled={isSubmitting}
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 mt-2"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <PaperPlaneTilt weight="bold" className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    <span>Join Waitlist</span>
                    <PaperPlaneTilt weight="bold" className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-500">
              No spam, ever. Unsubscribe anytime.
            </p>
          </>
        ) : (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
            >
              <CheckCircle weight="fill" className="w-10 h-10 text-green-500" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              You're on the list!
            </h3>
            <p className="text-gray-600 mb-6">
              We'll notify you at <span className="font-medium text-gray-900">{email}</span> when we have updates.
            </p>
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-2 border-sky-200 text-sky-600 hover:bg-sky-50"
            >
              Close
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
