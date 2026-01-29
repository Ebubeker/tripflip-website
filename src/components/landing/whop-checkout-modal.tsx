'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { WhopCheckoutEmbed } from '@whop/checkout/react'

interface WhopCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  planId: string | null
  planName: string
  billingPeriod: 'month' | 'year'
}

export function WhopCheckoutModal({
  isOpen,
  onClose,
  planId,
  planName,
  billingPeriod,
}: WhopCheckoutModalProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !planId) {
      setSessionId(null)
      setError(null)
      return
    }

    // Create checkout session when modal opens
    const createSession = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/checkout/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId,
            billingPeriod,
            planName,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create checkout session')
        }

        setSessionId(data.sessionId)
      } catch (err) {
        console.error('Checkout session error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load checkout')
      } finally {
        setIsLoading(false)
      }
    }

    createSession()
  }, [isOpen, planId, billingPeriod, planName])

  const handleComplete = (paymentId: string) => {
    console.log('Payment completed:', paymentId)
    // Redirect to success page
    window.location.href = '/dashboard?payment=success'
  }

  if (!planId) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Checkout Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-2xl"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors z-10"
                aria-label="Close checkout"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Checkout content */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh]">
                {isLoading && (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Loading checkout...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center justify-center h-96 p-8">
                    <div className="text-center max-w-md">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-6 h-6 text-red-600" />
                      </div>
                      <p className="text-gray-900 font-semibold mb-2">Failed to load checkout</p>
                      <p className="text-gray-600 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {sessionId && !isLoading && !error && (
                  <div className="overflow-y-auto max-h-[85vh]">
                    <WhopCheckoutEmbed
                      sessionId={sessionId}
                      returnUrl={`${window.location.origin}/dashboard?payment=success`}
                      onComplete={handleComplete}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
