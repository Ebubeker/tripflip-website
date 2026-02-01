'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/shared/navbar'
import {
  HeroSection,
  HighlightsSection,
  HowItWorksSection,
  WhyChooseUsSection,
  PricingSection,
  AboutSection,
  FAQSection,
  ContactSection,
  WaitlistSection,
  LandingFooter,
} from '@/components/landing'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const searchParams = useSearchParams()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setShowSuccessMessage(true)
      // Remove query param from URL
      window.history.replaceState({}, '', '/')
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="landing" />
      <main>
        <HeroSection />
        <HighlightsSection />
        <HowItWorksSection />
        <WhyChooseUsSection />
        <PricingSection />
        <WaitlistSection />
        <AboutSection />
        <FAQSection />
        <ContactSection />
      </main>
      <LandingFooter />

      {/* Payment Success Notification */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50 max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-200 p-6">
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Payment Successful! 🎉
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Thank you for your pre-order! We'll send you an email with next steps when we launch.
                  </p>
                  <Button
                    onClick={() => setShowSuccessMessage(false)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    Got it!
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
