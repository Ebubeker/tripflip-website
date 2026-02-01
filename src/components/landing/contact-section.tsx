'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PaperPlaneTilt, EnvelopeSimple } from '@phosphor-icons/react'

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all fields')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      // Web3Forms API
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY,
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: 'New Contact Form Submission from TripFlip',
          from_name: 'TripFlip Contact Form',
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send message')
      }

      setIsSubmitted(true)
      setFormData({ name: '', email: '', message: '' })
    } catch (err) {
      console.error('Contact form error:', err)
      setError('Something went wrong. Please try emailing us directly at hello@tripflip.app')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <section id="contact" className="py-40 bg-slate-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          {!isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="h-12 px-4 bg-white border-2 border-sky-200 placeholder:text-gray-400 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-12 px-4 bg-white border-2 border-sky-200 placeholder:text-gray-400 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us what's on your mind..."
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="px-4 py-3 bg-white border-2 border-sky-200 placeholder:text-gray-400 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all"
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
                      <span>Send Message</span>
                      <PaperPlaneTilt weight="bold" className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <EnvelopeSimple weight="duotone" className="w-4 h-4" />
                  Or email us directly at{' '}
                  <a href="mailto:hello@tripflip.app" className="text-sky-600 hover:text-sky-700 font-medium">
                    hello@tripflip.app
                  </a>
                </p>
              </div> */}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-12 shadow-lg border-2 border-slate-200 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <PaperPlaneTilt weight="fill" className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Message Sent!
              </h3>
              <p className="text-gray-600 mb-6">
                Thanks for reaching out. We'll get back to you soon!
              </p>
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="border-2 border-sky-200 text-sky-600 hover:bg-sky-50"
              >
                Send Another Message
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
