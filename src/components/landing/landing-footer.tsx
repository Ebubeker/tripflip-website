'use client'

import Link from 'next/link'
import { Heart } from '@phosphor-icons/react'

export function LandingFooter() {
  return (
    <footer className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-8 h-8">
                <img
                  src="/tripflip_logo.png"
                  alt="TripFlip"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="relative h-4">
                <img
                  src="/logo_text.png"
                  alt="TripFlip"
                  className="h-full object-contain"
                />
              </div>
            </Link>
            <p className="text-gray-600 text-sm">
              AI-powered travel planning made simple. Plan your dream trip in seconds.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/plan" className="text-gray-600 hover:text-primary transition-colors">
                  Plan a Trip
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-gray-600 hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-gray-600 hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-gray-600 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#about" className="text-gray-600 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-600 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a href="https://twitter.com/tripflipapp" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
                  Twitter
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} TripFlip. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs inline-flex items-center gap-1">
            Made with <Heart weight="fill" className="w-3 h-3 text-primary" /> for travelers everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}
