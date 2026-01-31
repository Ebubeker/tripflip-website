'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, CheckCircle, PaperPlaneTilt, Gift, Sparkle, Users } from '@phosphor-icons/react'

const BENEFITS = [
  { icon: Gift, text: 'Early access to new features' },
  { icon: Sparkle, text: 'Exclusive launch discounts' },
  { icon: Users, text: 'Join our founding community' },
]

export function WaitlistSection() {
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
        body: JSON.stringify({ email, source: 'landing_page' }),
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

  return (
    <section className="py-40 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-3xl transform -rotate-1" />

            <div className="relative bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200">
              {!isSubmitted ? (
                <>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
                    >
                      <Bell weight="duotone" className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      Stay in the Loop
                    </h2>
                    <p className="text-lg text-gray-600 max-w-xl mx-auto">
                      Be the first to know when we launch new features and get exclusive early-bird offers.
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {BENEFITS.map((benefit, i) => {
                      const IconComponent = benefit.icon
                      return (
                        <motion.div
                          key={benefit.text}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200"
                        >
                          <IconComponent weight="duotone" className="w-4 h-4 text-primary" />
                          <span className="text-sm text-gray-700">{benefit.text}</span>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 px-4 bg-white! border-2 border-primary/30 placeholder:text-gray-400 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-lg"
                          disabled={isSubmitting}
                        />
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        className="h-12 px-6 shadow-lg shadow-primary/25"
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
                    </div>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 mt-2 text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </form>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    No spam, ever. Unsubscribe anytime.
                  </p>
                </>
              ) : (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
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
                    onClick={() => {
                      setIsSubmitted(false)
                      setEmail('')
                    }}
                  >
                    Sign up another email
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
