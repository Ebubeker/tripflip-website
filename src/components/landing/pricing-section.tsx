'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Check } from 'lucide-react'
import { Confetti } from '@phosphor-icons/react'
import { PRICING_TIERS, PRE_LAUNCH_DISCOUNT } from '@/lib/landing-data'
import { WhopCheckoutModal } from './whop-checkout-modal'

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean
    planId: string | null
    planName: string
  }>({
    isOpen: false,
    planId: null,
    planName: '',
  })

  const handleCheckout = (tier: typeof PRICING_TIERS[0]) => {
    // Get the correct plan ID based on billing period
    const planId = isYearly ? tier.whopPlanId.yearly : tier.whopPlanId.monthly

    if (!planId) {
      // Free plan - show waitlist for now
      alert('Free plan coming soon! Join our waitlist to be notified.')
      return
    }

    // Open checkout modal
    setCheckoutModal({
      isOpen: true,
      planId,
      planName: tier.name,
    })
  }

  const closeCheckoutModal = () => {
    setCheckoutModal({
      isOpen: false,
      planId: null,
      planName: '',
    })
  }

  return (
    <>
      <section id="pricing" className="py-40 bg-slate-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Choose the plan that works for you
            </p>

            {/* Early bird discount badge */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-primary/30 inline-flex items-center gap-2">
                <Confetti weight="duotone" className="w-5 h-5" />
                Early Bird: 20% off all plans!
              </span>
            </motion.div>
          </motion.div>

          {/* Monthly/Yearly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
              <span className="ml-1 text-primary font-semibold">(Save 20%)</span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING_TIERS.map((tier, i) => {
              const basePrice = isYearly ? tier.yearlyPrice / 12 : tier.monthlyPrice
              const discountedPrice = basePrice * (1 - PRE_LAUNCH_DISCOUNT)
              const showDiscount = tier.monthlyPrice > 0

              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-8 rounded-2xl flex flex-col ${
                    tier.highlighted
                      ? 'bg-primary text-white ring-4 ring-primary/20 scale-105 shadow-xl shadow-primary/30'
                      : 'bg-white border-2 border-slate-200'
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <h3 className={`text-2xl font-bold mb-2 ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>{tier.name}</h3>

                  <div className="mb-6">
                    {showDiscount && (
                      <span className={`text-lg line-through ${tier.highlighted ? 'text-white/60' : 'text-gray-400'}`}>
                        ${basePrice.toFixed(0)}
                      </span>
                    )}
                    <span className={`text-4xl font-bold ml-2 ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      ${showDiscount ? discountedPrice.toFixed(0) : '0'}
                    </span>
                    <span className={`text-sm ${tier.highlighted ? 'text-white/80' : 'text-gray-500'}`}>
                      /month
                    </span>
                    {isYearly && tier.monthlyPrice > 0 && (
                      <p className={`text-xs mt-1 ${tier.highlighted ? 'text-white/70' : 'text-gray-500'}`}>
                        Billed ${(tier.yearlyPrice * (1 - PRE_LAUNCH_DISCOUNT)).toFixed(0)}/year
                      </p>
                    )}
                  </div>

                  {/* Features list - grows to fill space */}
                  <ul className="space-y-3 mb-8 grow">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-white' : 'text-primary'}`} />
                        <span className={`text-sm ${tier.highlighted ? 'text-white/90' : 'text-gray-600'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Button at the bottom */}
                  <Button
                    onClick={() => handleCheckout(tier)}
                    className="w-full mt-auto"
                    variant={tier.highlighted ? 'secondary' : 'default'}
                    size="lg"
                  >
                    {tier.cta}
                  </Button>
                </motion.div>
              )
            })}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            All plans include a 14-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Embedded Checkout Modal */}
      <WhopCheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={closeCheckoutModal}
        planId={checkoutModal.planId}
        planName={checkoutModal.planName}
        billingPeriod={isYearly ? 'year' : 'month'}
      />
    </>
  )
}
